// Upstash Redis REST 小工具（不需額外套件）。
// 環境變數：UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
// （若是透過 Vercel Marketplace 安裝 Upstash，會自動提供 KV_REST_API_URL / KV_REST_API_TOKEN，也能用）
// Marketplace 安裝時若自訂了前綴（例如 STORAGE_KV_REST_API_URL），也一併找得到
// Vercel 透過 process.env 提供；Cloudflare Pages Functions 則由 api/_cf.js 呼叫 setEnv(context.env) 注入
let ENV = (typeof process !== 'undefined' && process.env) || {};
export const setEnv = e => { if (e) ENV = e; };
const envEnding = suffix => { const k = Object.keys(ENV).find(k => k.endsWith(suffix) && ENV[k]); return k ? ENV[k] : ''; };
const URL_ = () => ENV.UPSTASH_REDIS_REST_URL || ENV.KV_REST_API_URL || envEnding('_KV_REST_API_URL') || envEnding('_REDIS_REST_URL') || '';
const TOKEN = () => ENV.UPSTASH_REDIS_REST_TOKEN || ENV.KV_REST_API_TOKEN || envEnding('_KV_REST_API_TOKEN') || envEnding('_REDIS_REST_TOKEN') || '';

export const PREFIX = 'nfucsie:';
export const configured = () => Boolean(URL_() && TOKEN());

export async function pipeline(commands) {
  const res = await fetch(URL_().replace(/\/+$/, '') + '/pipeline', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands)
  });
  if (!res.ok) throw new Error(`upstash ${res.status}`);
  const out = await res.json();
  return out.map(r => { if (r.error) throw new Error(r.error); return r.result; });
}

// 以台灣時間計算日期：YYYY-MM-DD
export function taipeiDate(d = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export function readBody(req) {
  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = null; } }
  return b && typeof b === 'object' ? b : null;
}
