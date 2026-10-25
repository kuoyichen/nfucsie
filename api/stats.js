// GET /api/stats → { total, unique, avgDwellMs, days: [{ date, visits, unique, avgDwellMs }] }（近 30 天，舊到新）
import { configured, pipeline, PREFIX as P, taipeiDate } from './_redis.js';

const DAYS = 30;
const toMap = flat => { const m = {}; for (let i = 0; i + 1 < (flat || []).length; i += 2) m[flat[i]] = Number(flat[i + 1]) || 0; return m; };

export default async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'method not allowed' }); }
  if (!configured()) return res.status(503).json({ error: 'not configured' });
  const dates = [];
  for (let i = DAYS - 1; i >= 0; i--) dates.push(taipeiDate(new Date(Date.now() - i * 864e5)));
  try {
    const r = await pipeline([
      ['GET', P + 'visits'], ['PFCOUNT', P + 'uv'], ['GET', P + 'dwell:ms'], ['GET', P + 'dwell:n'],
      ['HGETALL', P + 'daily:visits'], ['HGETALL', P + 'daily:dwell'], ['HGETALL', P + 'daily:dwelln'],
      ...dates.map(d => ['PFCOUNT', P + 'uv:' + d])
    ]);
    const [total, unique, dwellMs, dwellN, dv, dd, dn] = r;
    const visits = toMap(dv), dwell = toMap(dd), dwellCount = toMap(dn);
    const days = dates.map((date, i) => ({
      date,
      visits: visits[date] || 0,
      unique: Number(r[7 + i]) || 0,
      avgDwellMs: dwellCount[date] ? Math.round((dwell[date] || 0) / dwellCount[date]) : 0
    }));
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      total: Number(total) || 0,
      unique: Number(unique) || 0,
      avgDwellMs: Number(dwellN) ? Math.round(Number(dwellMs) / Number(dwellN)) : 0,
      days
    });
  } catch (e) {
    return res.status(502).json({ error: 'storage error' });
  }
}
