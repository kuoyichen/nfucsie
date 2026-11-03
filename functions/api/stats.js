// Cloudflare Pages Function：/api/stats（共用 api/stats.js 的程式）
import handler from '../../api/stats.js';
import { wrap } from '../../api/_cf.js';
export const onRequest = wrap(handler);
