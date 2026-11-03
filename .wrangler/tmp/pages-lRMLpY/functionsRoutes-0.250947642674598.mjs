import { onRequest as __api_bottles_js_onRequest } from "/home/claude/nfucsie/functions/api/bottles.js"
import { onRequest as __api_stats_js_onRequest } from "/home/claude/nfucsie/functions/api/stats.js"
import { onRequest as __api_track_js_onRequest } from "/home/claude/nfucsie/functions/api/track.js"

export const routes = [
    {
      routePath: "/api/bottles",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_bottles_js_onRequest],
    },
  {
      routePath: "/api/stats",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_stats_js_onRequest],
    },
  {
      routePath: "/api/track",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_track_js_onRequest],
    },
  ]