// Cloudflare Workers 轉接層：把 Vercel 風格的 handler(req, res) 包成 ({ request, env }) => Response。
// 檔名以底線開頭，Vercel 不會把它當成 API 路由。
import { setEnv } from './_redis.js';

export const wrap = handler => async ({ request, env }) => {
  setEnv(env);
  let body = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const text = await request.text();
    try { body = JSON.parse(text); } catch { body = text; }
  }
  const req = { method: request.method, headers: Object.fromEntries(request.headers), body };
  const headers = new Headers();
  let status = 200, out = null;
  const res = {
    setHeader(k, v) { headers.set(k, v); return res; },
    status(s) { status = s; return res; },
    json(o) { headers.set('Content-Type', 'application/json; charset=utf-8'); out = JSON.stringify(o); return res; },
    end(b) { if (b != null) out = b; return res; }
  };
  await handler(req, res);
  return new Response(status === 204 || status === 304 ? null : out, { status, headers });
};
