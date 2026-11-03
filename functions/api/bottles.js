// Cloudflare Pages Function：/api/bottles（共用 api/bottles.js 的程式）
import handler from '../../api/bottles.js';
import { wrap } from '../../api/_cf.js';
export const onRequest = wrap(handler);
