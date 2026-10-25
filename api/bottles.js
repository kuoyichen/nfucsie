// 留言瓶
//   GET  /api/bottles                 最新 40 則留言（新到舊）
//   POST /api/bottles { vid, text, name }  丟一個瓶子：每位訪客 45 秒限一則、全站每小時最多 120 則
import { configured, pipeline, PREFIX as P, readBody } from './_redis.js';

const VID = /^[A-Za-z0-9-]{8,64}$/;
const KEY = P + 'bottles';
const KEEP = 200;              // 只保留最新 200 則
const MAX_TEXT = 120, MAX_NAME = 16;
// 基本過濾：擋網址與常見髒話，其餘由管理者從 Upstash 後台刪除
const BLOCK = [/https?:\/\//i, /www\./i, /幹你|幹妳|操你|靠北|機掰|雞掰|白癡|智障|去死|fuck|shit|bitch/i];
const clean = (s, n) => String(s || '').replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!configured()) return res.status(503).json({ error: 'not configured' });
  try {
    if (req.method === 'GET') {
      const [list] = await pipeline([['LRANGE', KEY, 0, 39]]);
      const bottles = (list || []).map(s => { try { return JSON.parse(s); } catch { return null; } }).filter(Boolean);
      return res.status(200).json({ bottles });
    }
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'method not allowed' }); }
    const b = readBody(req);
    if (!b || !VID.test(String(b.vid || ''))) return res.status(400).json({ error: 'bad request' });
    const text = clean(b.text, MAX_TEXT), name = clean(b.name, MAX_NAME) || '匿名島民';
    if (text.length < 2) return res.status(400).json({ error: 'too short' });
    if (BLOCK.some(r => r.test(text) || r.test(name))) return res.status(400).json({ error: 'blocked' });
    const hour = Math.floor(Date.now() / 3600000);
    const [ok, n] = await pipeline([
      ['SET', P + 'bottle:rl:' + b.vid, '1', 'NX', 'EX', 45],
      ['INCR', P + 'bottle:hour:' + hour]
    ]);
    await pipeline([['EXPIRE', P + 'bottle:hour:' + hour, 7200]]);
    if (ok !== 'OK') return res.status(429).json({ error: 'slow down' });
    if (n > 120) return res.status(429).json({ error: 'busy' });
    const item = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), t: Date.now(), text, name };
    await pipeline([['LPUSH', KEY, JSON.stringify(item)], ['LTRIM', KEY, 0, KEEP - 1]]);
    return res.status(201).json({ bottle: item });
  } catch (e) {
    return res.status(502).json({ error: 'storage error' });
  }
}
