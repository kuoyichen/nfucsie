// Cloudflare Workers 進入點：/api/* 交給 api/ 底下與 Vercel 共用的 handler，其餘回傳靜態檔（index.html 等）。
import track from '../api/track.js';
import stats from '../api/stats.js';
import bottles from '../api/bottles.js';
import { wrap } from '../api/_cf.js';

const routes = { '/api/track': wrap(track), '/api/stats': wrap(stats), '/api/bottles': wrap(bottles) };

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname.replace(/\/+$/, '');
    const route = routes[path];
    if (route) return route({ request, env });
    if (path.startsWith('/api/')) return new Response('{"error":"not found"}', { status: 404, headers: { 'Content-Type': 'application/json' } });
    return env.ASSETS.fetch(request);
  }
};
