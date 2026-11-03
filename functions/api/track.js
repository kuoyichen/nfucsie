// Cloudflare Pages Function：/api/track（共用 api/track.js 的程式）
import handler from '../../api/track.js';
import { wrap } from '../../api/_cf.js';
export const onRequest = wrap(handler);
