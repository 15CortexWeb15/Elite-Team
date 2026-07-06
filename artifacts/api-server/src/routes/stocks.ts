import { Router } from 'express';
import YahooFinance from 'yahoo-finance2';

const router = Router();

// yahoo-finance2 v3 requires instantiation
const yf = new YahooFinance();

// ─── Server-side cache ────────────────────────────────────────────────────────

type CachedQuote = { data: Record<string, unknown>; expiresAt: number };
const quoteCache = new Map<string, CachedQuote>();
const QUOTE_TTL = 15_000;

async function fetchOneQuote(symbol: string): Promise<Record<string, unknown> | null> {
  const hit = quoteCache.get(symbol);
  if (hit && Date.now() < hit.expiresAt) return hit.data;

  try {
    const q = await yf.quote(symbol, {}, { validateResult: false });
    if (!q || !q.regularMarketPrice) return hit?.data ?? null;

    const quote: Record<string, unknown> = {
      symbol: q.symbol ?? symbol,
      name: q.shortName ?? q.longName ?? symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange ?? 0,
      changePercent: q.regularMarketChangePercent ?? 0,
      dayHigh: q.regularMarketDayHigh ?? 0,
      dayLow: q.regularMarketDayLow ?? 0,
      open: q.regularMarketOpen ?? 0,
      prevClose: q.regularMarketPreviousClose ?? 0,
      volume: q.regularMarketVolume ?? 0,
      currency: q.currency ?? 'USD',
    };

    quoteCache.set(symbol, { data: quote, expiresAt: Date.now() + QUOTE_TTL });
    return quote;
  } catch (err) {
    if (hit) return hit.data;
    console.error(`[stocks] quote failed for ${symbol}:`, (err as Error).message);
    return null;
  }
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/stocks/quote?symbols=AAPL,TSLA,BTC-USD
router.get('/quote', async (req, res): Promise<void> => {
  const raw = (req.query.symbols as string | undefined)?.trim();
  if (!raw) { res.status(400).json({ error: 'symbols query param required' }); return; }

  const symbols = [...new Set(raw.split(',').map(s => s.trim().toUpperCase()).filter(Boolean))].slice(0, 20);

  const results: (Record<string, unknown> | null)[] = [];
  for (let i = 0; i < symbols.length; i++) {
    results.push(await fetchOneQuote(symbols[i]));
    if (i < symbols.length - 1) await new Promise(r => setTimeout(r, 80));
  }

  res.json(results.filter(Boolean));
});

// GET /api/stocks/search?q=apple
router.get('/search', async (req, res): Promise<void> => {
  const q = (req.query.q as string | undefined)?.trim();
  if (!q) { res.json([]); return; }

  try {
    const data = await yf.search(q, {}, { validateResult: false });
    const quotes = (data.quotes ?? []) as Array<{
      symbol?: string;
      shortname?: string;
      longname?: string;
      exchDisp?: string;
      quoteType?: string;
    }>;

    res.json(
      quotes
        .filter(r => r.symbol && ['EQUITY', 'ETF', 'CRYPTOCURRENCY', 'CURRENCY', 'FUTURE'].includes(r.quoteType ?? ''))
        .slice(0, 8)
        .map(r => ({
          symbol: r.symbol,
          name: r.shortname ?? r.longname ?? r.symbol,
          exchange: r.exchDisp ?? '',
          type: r.quoteType ?? '',
        })),
    );
  } catch (err) {
    console.error('[stocks] search failed:', (err as Error).message);
    res.json([]);
  }
});

// GET /api/stocks/history/:symbol?range=1d|5d|1mo|3mo|6mo|1y
router.get('/history/:symbol', async (req, res): Promise<void> => {
  const symbol = Array.isArray(req.params.symbol) ? req.params.symbol[0] : req.params.symbol;
  const VALID_RANGES = new Set(['1d', '5d', '1mo', '3mo', '6mo', '1y']);
  const range = VALID_RANGES.has(req.query.range as string) ? (req.query.range as string) : '1d';

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
    const result = await yf.chart(symbol, {
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

    if (!points.length) {
      res.status(404).json({ error: 'No valid data points for this symbol / range' });
      return;
    }

    const cached = quoteCache.get(symbol);
    const regularMarketPrice =
      (cached?.data.price as number | undefined) ??
      result.meta?.regularMarketPrice ??
      points[points.length - 1]?.price;

    res.json({ symbol, currency: result.meta?.currency ?? 'USD', regularMarketPrice, points });
  } catch (err) {
    console.error(`[stocks] history failed for ${symbol}:`, (err as Error).message);
    res.status(502).json({ error: 'Failed to fetch history from Yahoo Finance' });
  }
});

export default router;
