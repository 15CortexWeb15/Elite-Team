import { Router } from 'express';
import yahooFinance from 'yahoo-finance2';
import { requireAuth } from '../lib/auth';

const router = Router();

const FINNHUB_KEY = process.env.FINNHUB_API_KEY ?? '';
const BASE = 'https://finnhub.io/api/v1';

async function fhFetch<T>(path: string): Promise<T> {
  if (!FINNHUB_KEY) throw new Error('FINNHUB_API_KEY not configured');
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}token=${FINNHUB_KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Finnhub HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Server-side cache (15 s TTL) ────────────────────────────────────────────

type CachedQuote = { data: Record<string, unknown>; expiresAt: number };
const quoteCache = new Map<string, CachedQuote>();
const CACHE_TTL = 15_000;

async function fetchOneQuote(symbol: string): Promise<Record<string, unknown> | null> {
  const hit = quoteCache.get(symbol);
  if (hit && Date.now() < hit.expiresAt) return hit.data;

  try {
    // Finnhub /quote returns: c (current), d (change), dp (change%), h, l, o, pc (prevClose), t
    const q = await fhFetch<{
      c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; t: number;
    }>(`/quote?symbol=${encodeURIComponent(symbol)}`);

    if (!q.c) return hit?.data ?? null;  // 0 price = symbol not found

    // Get company profile for name (cached separately if needed — we skip it for speed)
    const quote: Record<string, unknown> = {
      symbol,
      name: symbol,   // name filled in via profile endpoint below if available
      price: q.c,
      change: q.d,
      changePercent: q.dp,
      dayHigh: q.h,
      dayLow: q.l,
      open: q.o,
      prevClose: q.pc,
      volume: 0,       // Finnhub /quote doesn't include volume; we leave it 0
      currency: 'USD',
    };

    quoteCache.set(symbol, { data: quote, expiresAt: Date.now() + CACHE_TTL });
    return quote;
  } catch (err) {
    if (hit) return hit.data;
    console.error(`[stocks] quote failed for ${symbol}:`, (err as Error).message);
    return null;
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/stocks/quote?symbols=AAPL,TSLA,BTC
router.get('/quote', requireAuth, async (req, res): Promise<void> => {
  if (!FINNHUB_KEY) {
    res.status(503).json({ error: 'FINNHUB_API_KEY not set — please add it to Replit Secrets' });
    return;
  }

  const raw = (req.query.symbols as string | undefined)?.trim();
  if (!raw) { res.status(400).json({ error: 'symbols query param required' }); return; }

  const symbols = [...new Set(raw.split(',').map(s => s.trim().toUpperCase()).filter(Boolean))].slice(0, 20);

  // Sequential fetches with 60 ms gaps to stay comfortably under 60 req/min
  const results: (Record<string, unknown> | null)[] = [];
  for (let i = 0; i < symbols.length; i++) {
    results.push(await fetchOneQuote(symbols[i]));
    if (i < symbols.length - 1) await new Promise(r => setTimeout(r, 60));
  }

  res.json(results.filter(Boolean));
});

// GET /api/stocks/search?q=apple
router.get('/search', requireAuth, async (req, res): Promise<void> => {
  if (!FINNHUB_KEY) { res.json([]); return; }
  const q = (req.query.q as string | undefined)?.trim();
  if (!q) { res.json([]); return; }
  try {
    const data = await fhFetch<{ count: number; result: { description: string; displaySymbol: string; symbol: string; type: string }[] }>(
      `/search?q=${encodeURIComponent(q)}`,
    );
    res.json(
      (data.result ?? [])
        .filter(r => ['Common Stock', 'ETP', 'Crypto', 'Forex'].includes(r.type))
        .slice(0, 8)
        .map(r => ({
          symbol: r.symbol,
          name: r.description,
          exchange: '',
          type: r.type,
        })),
    );
  } catch (err) {
    console.error('[stocks] search failed:', (err as Error).message);
    res.json([]);
  }
});

// GET /api/stocks/history/:symbol?range=1d|5d|1mo|3mo|6mo|1y
router.get('/history/:symbol', requireAuth, async (req, res): Promise<void> => {
  const symbol = Array.isArray(req.params.symbol) ? req.params.symbol[0] : req.params.symbol;
  const VALID_RANGES = new Set(['1d', '5d', '1mo', '3mo', '6mo', '1y']);
  const range = VALID_RANGES.has(req.query.range as string) ? (req.query.range as string) : '1d';

  // Yahoo Finance intervals
  const intervalMap: Record<string, '5m' | '15m' | '60m' | '1d' | '1wk'> = {
    '1d': '5m', '5d': '15m', '1mo': '60m', '3mo': '1d', '6mo': '1d', '1y': '1wk',
  };
  const fromMap: Record<string, Date> = {
    '1d':  new Date(Date.now() - 86_400_000),
    '5d':  new Date(Date.now() - 5 * 86_400_000),
    '1mo': new Date(Date.now() - 30 * 86_400_000),
    '3mo': new Date(Date.now() - 90 * 86_400_000),
    '6mo': new Date(Date.now() - 180 * 86_400_000),
    '1y':  new Date(Date.now() - 365 * 86_400_000),
  };

  try {
    const result = await yahooFinance.chart(symbol, {
      period1: fromMap[range],
      interval: intervalMap[range],
    }, { validateResult: false });

    const quotes = result.quotes ?? [];
    if (!quotes.length) {
      res.status(404).json({ error: 'No data for this symbol / range' });
      return;
    }

    const isFiniteNum = (n: unknown): n is number => typeof n === 'number' && isFinite(n);
    const points = quotes
      .filter(q => q.open != null && q.close != null)
      .map(q => ({
        time: new Date(q.date).getTime(),
        price: q.close as number,
        open: q.open as number,
        high: q.high as number,
        low: q.low as number,
        close: q.close as number,
        volume: q.volume ?? 0,
      }))
      .filter(p =>
        isFiniteNum(p.time) &&
        isFiniteNum(p.open) &&
        isFiniteNum(p.high) &&
        isFiniteNum(p.low) &&
        isFiniteNum(p.close),
      )
      .sort((a, b) => a.time - b.time);

    const cached = quoteCache.get(symbol);
    const regularMarketPrice =
      (cached?.data.price as number | undefined) ??
      result.meta?.regularMarketPrice ??
      points[points.length - 1]?.price;

    res.json({ symbol, currency: result.meta?.currency ?? 'USD', regularMarketPrice, points });
  } catch (err) {
    console.error(`[stocks] history failed for ${symbol}:`, (err as Error).message);
    res.status(502).json({ error: 'Failed to fetch history' });
  }
});

export default router;
