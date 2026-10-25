// POST /api/track
//   { type: 'visit', vid }                 一次造訪：總造訪數、不重複訪客、當日人數
//   { type: 'dwell', vid, ms, first }      停留時間（頁面隱藏或離開時以 sendBeacon 送出）
import { configured, pipeline, PREFIX as P, taipeiDate, readBody } from './_redis.js';

const VID = /^[A-Za-z0-9-]{8,64}$/;
const MAX_DWELL = 4 * 60 * 60 * 1000; // 單筆最多計 4 小時，避免分頁掛著灌水
const KEEP = 60 * 60 * 24 * 400;      // 每日不重複訪客 HyperLogLog 保留約 400 天

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'method not allowed' }); }
  if (!configured()) return res.status(503).json({ error: 'not configured' });
  const b = readBody(req);
  if (!b || !VID.test(String(b.vid || ''))) return res.status(400).json({ error: 'bad request' });
  const day = taipeiDate();
  try {
    if (b.type === 'visit') {
      await pipeline([
        ['INCR', P + 'visits'],
        ['PFADD', P + 'uv', b.vid],
        ['HINCRBY', P + 'daily:visits', day, 1],
        ['PFADD', P + 'uv:' + day, b.vid],
        ['EXPIRE', P + 'uv:' + day, KEEP]
      ]);
    } else if (b.type === 'dwell') {
      const ms = Math.round(Number(b.ms));
      if (!Number.isFinite(ms) || ms < 0) return res.status(400).json({ error: 'bad ms' });
      const c = Math.min(ms, MAX_DWELL);
      const cmds = [['INCRBY', P + 'dwell:ms', c], ['HINCRBY', P + 'daily:dwell', day, c]];
      if (b.first) cmds.push(['INCR', P + 'dwell:n'], ['HINCRBY', P + 'daily:dwelln', day, 1]);
      await pipeline(cmds);
    } else {
      return res.status(400).json({ error: 'bad type' });
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.status(204).end();
  } catch (e) {
    return res.status(502).json({ error: 'storage error' });
  }
}
