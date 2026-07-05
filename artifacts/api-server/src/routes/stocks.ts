import { Router } from 'express';
import { requireAuth } from '../lib/auth';

const router = Router();

const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function yfFetch(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: YF_HEADERS });
  if (!res.ok) {
    throw new Error(`Yahoo Finance error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// GET /api/stocks/quote?symbols=AAPL,TSLA,BTC-USD
router.get('/quote', requireAuth, async (req, res): Promise<void> => {
  const symbols = (req.query.symbols as string | undefined)?.trim();
  if (!symbols) {
    res.status(400).json({ error: 'symbols query param required' });
    return;
  }
  try {
    const fields = [
      'symbol', 'shortName', 'regularMarketPrice', 'regularMarketChange',
      'regularMarketChangePercent', 'regularMarketVolume', 'marketCap',
      'regularMarketDayHigh', 'regularMarketDayLow', 'regularMarketOpen',
      'regularMarketPreviousClose', 'currency', 'quoteType',
    ].join(',');

    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}&fields=${fields}`;
    const data = await yfFetch(url) as Record<string, unknown>;
    const results = ((data as any).quoteResponse?.result ?? []) as Record<string, unknown>[];

    res.json(results.map((q) => ({
      symbol: q.symbol,
      name: q.shortName || q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      volume: q.regularMarketVolume,
      marketCap: q.marketCap,
      dayHigh: q.regularMarketDayHigh,
      dayLow: q.regularMarketDayLow,
      open: q.regularMarketOpen,
      prevClose: q.regularMarketPreviousClose,
      currency: q.currency ?? 'USD',
    })));
  } catch {
    res.status(502).json({ error: 'Failed to fetch quotes from data provider' });
  }
});

// GET /api/stocks/search?q=apple
router.get('/search', requireAuth, async (req, res): Promise<void> => {
  const q = (req.query.q as string | undefined)?.trim();
  if (!q) { res.json([]); return; }
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&listsCount=0`;
    const data = await yfFetch(url) as Record<string, unknown>;
    const quotes = (data as any).quotes ?? [];
    const allowed = new Set(['EQUITY', 'ETF', 'CRYPTOCURRENCY', 'INDEX']);

    res.json(
      (quotes as Record<string, unknown>[])
        .filter((r) => allowed.has(r.quoteType as string))
        .slice(0, 8)
        .map((r) => ({
          symbol: r.symbol,
          name: r.shortname || r.longname || r.symbol,
          exchange: r.exchange,
          type: r.quoteType,
        })),
    );
  } catch {
    res.status(502).json([]);
  }
});

// GET /api/stocks/history/:symbol?range=1d
router.get('/history/:symbol', requireAuth, async (req, res): Promise<void> => {
  const { symbol } = req.params;
  const VALID_RANGES = new Set(['1d', '5d', '1mo', '3mo']);
  const range = VALID_RANGES.has(req.query.range as string) ? (req.query.range as string) : '1d';
  const intervalMap: Record<string, string> = { '1d': '5m', '5d': '15m', '1mo': '1d', '3mo': '1wk' };
  const interval = intervalMap[range];

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;
    const data = await yfFetch(url) as Record<string, unknown>;
    const chart = (data as any).chart?.result?.[0];
    if (!chart) { res.status(404).json({ error: 'Symbol not found' }); return; }

    const timestamps: number[] = chart.timestamp ?? [];
    const closes: (number | null)[] = chart.indicators?.quote?.[0]?.close ?? [];
    const points = timestamps
      .map((ts: number, i: number) => ({ time: ts * 1000, price: closes[i] }))
      .filter((p) => p.price != null);

    res.json({
      symbol: chart.meta.symbol,
      currency: chart.meta.currency ?? 'USD',
      regularMarketPrice: chart.meta.regularMarketPrice,
      points,
    });
  } catch {
    res.status(502).json({ error: 'Failed to fetch history from data provider' });
  }
});

export default router;
