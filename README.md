# 虎尾科大資工系特色島 · NFU CSIE Island

國立虎尾科技大學資訊工程系的 3D 互動特色島（單一 `index.html`，Three.js 0.160.0，原生 ES Modules，不需建置）。

- 12 座六角島：五專一～五年級、四技一～四年級、碩士班，加上「綜三館」（師資與系辦）與「榮譽殿堂」（競賽成果）。
- 117 位島民：上課、做專題、休閒、把作品帶去比賽；9 條交流線（實線＝正式制度、虛線＝社群交流、點線＝籌備中）。
- 20 位專任教師頭上都有名牌，點選後老師會自我介紹專業（打字機文字＋瀏覽器語音）。
- 大四、專五、碩士班（研二）島上有碼頭，三艘輪船定期載同學到外海 12 座科技公司外島（鴻海、華碩、廣達、台達電、台積電、聯發科、聯詠、瑞昱、聯電、力積電、日月光、研華）參訪，主管會稱讚本系學生；系友偶爾搭直升機降落綜三館屋頂分享就業經驗。公司所在地與產業為公開資訊，參訪情節與評語為示意。
- 日夜循環（每秒 10 分鐘）、不同時段亮起不同建物；`?lang=en` 切換英文。
- 手機：一指平移、兩指拖曳或扭轉旋轉、捏合縮放；側欄與卡片變成 bottom sheet。
- 所有資料與圖片來自 <https://csie.nfu.edu.tw/>（老師照片與系徽以網址直接載入），寫在 `index.html` 頂端的 `DATA` 物件。

## 參訪紀錄（Vercel + Upstash Redis）

`api/track.js` 記錄造訪、不重複訪客（HyperLogLog）、停留時間（離開頁面時 `sendBeacon`），以台灣時間分日統計；
`api/stats.js` 回傳總數、平均停留時間與近 30 天每日人數。網頁右上「說明 → 參訪紀錄」可查看。

在 Vercel 專案 **nfucsie** → Settings → Environment Variables 設定（Upstash Console → 資料庫 → REST API 取得）：

| 變數 | 說明 |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | 例如 `https://xxxx.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | REST token（非唯讀那一組） |

若是從 Vercel Marketplace 安裝 Upstash 整合，會自動注入 `KV_REST_API_URL` / `KV_REST_API_TOKEN`，程式也能直接使用。設定後重新部署即可。
資料鍵值都以 `nfucsie:` 開頭。

## 本機預覽

任何靜態伺服器都可以（例如 `npx serve .`）；API 需要 `vercel dev` 與上述環境變數，未設定時參訪紀錄會顯示「尚未設定」。

預覽圖 `og.png` 的網址寫成 `https://nfucsie.vercel.app/og.png`，如果正式網域不同，請改 `index.html` 的 `og:url`、`og:image`、`twitter:image`。
