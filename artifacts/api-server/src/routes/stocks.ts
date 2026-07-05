import { Router } from 'express';
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
  if (!FINNHUB_KEY) {
    res.status(503).json({ error: 'FINNHUB_API_KEY not set' });
    return;
  }

  const { symbol } = req.params;
  const VALID_RANGES = new Set(['1d', '5d', '1mo', '3mo', '6mo', '1y']);
  const range = VALID_RANGES.has(req.query.range as string) ? (req.query.range as string) : '1d';

  // Finnhub candle resolutions: 1, 5, 15, 30, 60, D, W, M
  const resMap: Record<string, string> = {
    '1d': '5', '5d': '15', '1mo': '60', '3mo': 'D', '6mo': 'D', '1y': 'W',
  };
  // "from" timestamps
  const now = Math.floor(Date.now() / 1000);
  const fromMap: Record<string, number> = {
    '1d':  now - 86400,
    '5d':  now - 5 * 86400,
    '1mo': now - 30 * 86400,
    '3mo': now - 90 * 86400,
    '6mo': now - 180 * 86400,
    '1y':  now - 365 * 86400,
  };

  try {
    const resolution = resMap[range];
    const from = fromMap[range];

    const data = await fhFetch<{
      s: string; t: number[]; c: number[]; o: number[]; h: number[]; l: number[]; v: number[];
    }>(`/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${now}`);

    if (data.s !== 'ok' || !data.t?.length) {
      res.status(404).json({ error: 'No data for this symbol / range' });
      return;
    }

    const points = data.t.map((ts, i) => ({ time: ts * 1000, price: data.c[i] }))
      .filter(p => p.price != null && !isNaN(p.price));

    // Current price from quote cache or last candle
    const cached = quoteCache.get(symbol);
    const regularMarketPrice = (cached?.data.price as number | undefined) ?? points[points.length - 1]?.price;

    res.json({ symbol, currency: 'USD', regularMarketPrice, points });
  } catch (err) {
    console.error(`[stocks] history failed for ${symbol}:`, (err as Error).message);
    res.status(502).json({ error: 'Failed to fetch history' });
  }
});

export default router;
