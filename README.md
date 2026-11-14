# WuXing Engine · 五行引擎

输入生日 → 生成你的**日柱人设卡**（MBTI 式代号 + 反差属性条 + AI 灵魂一击）→ 扫码 1v1 合盘 → 组 3–5 人五行小队 → 每日补给站。
深色赛博 + 粉紫糖水风，手机优先，全部在浏览器里跑。

---

## 页面

| 路径 | 做什么 |
|---|---|
| `/` | 首页：五行能量球、生日输入（可不知道时辰）、人设卡 / 合盘 / 小队 / 每日补给入口；三层五角图免费看，**「这三层各决定了什么 + 结论」是月卡内容** |
| `/card` | 日柱人设卡。AI 写称号/属性条/灵魂一击，可下载 1080×1920 海报；也可用 `?n=名字&d=2005-02-08&g=m&h=3` 直接看别人的卡 |
| `/match?n=…&d=…` | 1v1 合盘：分数免费，原因/五角图/AI 报告要解锁（分享 2 人或 RM 9.9 演示支付） |
| `/squad` → `/squad/1234` | 五行小队：4 位房间号、群二维码、实时雷达、AI 团队诊断；`?demo=4` 可以一个人演示满编队 |
| `/fortune` | 每日补给站：7 天/30 天签到、AI 今日宜忌、赛博冰块 / 招财木鱼、VIP 月卡 |
| `/event` | 现场破冰模式（大屏）：超大二维码 + 评委扫码后实时弹出五行入场卡 |
| `/event/join` | 评委手机端：填生日 → 写进大屏 |

## 本地跑

```bash
npm install
npm run dev      # http://localhost:3000
npm run verify   # eslint + next build，提交前跑一遍
```

## 1. 让 AI 真的生成（可选，但路演建议配）

所有 AI 文案都走 `POST /api/ai`（`src/app/api/ai/route.ts`），任何 OpenAI 兼容接口都行。
**没有 key 也不会坏**：页面先用 `src/lib/copy.ts` 的预设文案，AI 回来后无缝替换；卡片右上角会显示「AI 即时生成」还是「预设」。

本地：把 `.env.example` 复制成 `.env.local`，填一个 key：

```bash
GEMINI_API_KEY=...      # https://aistudio.google.com/apikey 免费额度，最快
# 或者
DEEPSEEK_API_KEY=...
OPENAI_API_KEY=...
# 或者自定义
AI_API_KEY=... AI_BASE_URL=https://api.example.com/v1 AI_MODEL=...
```

Vercel：Project → Settings → Environment Variables 加同一个变量，然后 Redeploy。
（`/api/ai` 用 Node runtime，20 秒超时；Gemini 主模型限流会自动退到 `gemini-3.5-flash-lite`，再不行就退回预设文案，不会白屏。）

改提示词：`src/lib/aiServer.ts` 里的 `userPrompt()`。四种 kind：`persona` / `pair` / `squad` / `daily`。

## 2. 房间和大屏要发一次 Firebase 规则（只做一次）

`/squad/:code`、`/event` 用的是 Firebase Realtime Database（纯 REST，没有 SDK）。
新加了 `rooms` 和 `stage` 两个路径，必须把仓库里的 `database.rules.json` 贴进
**Firebase Console → Realtime Database → Rules → Publish**。
不贴的话页面顶部会提示「房间数据库没有权限」，本地演示可以用 `?demo=4` / 「🧪 模拟队友」绕过。

## 3. 路演流程（3 分钟版）

1. `/` 输入生日 → 进 `/card`，让评委看 AI 现场写的灵魂一击，点「下载海报」。
2. 评委扫 `/event` 大屏上的码，填生日 → 大屏 2 秒内弹出他的五行入场卡。
3. 进 `/match`：分数免费，先给悬念；切「毒舌锐评 / 走心模式」，再用「模拟好友加入」解锁。
4. `/squad` 建房间，3 台手机扫码 → 雷达显示缺哪种五行 → AI 团队诊断。
5. `/fortune` 签到、敲木鱼/碎冰、开月卡看完整宜忌。

## 技术备注

- Next.js 16 App Router + TS + Tailwind v4，无 UI 库。
- 八字计算在 `src/lib/bazi.ts`：年月日（+可选时柱）、藏干、合冲、身强弱、喜用神。
- 文案兜底在 `src/lib/copy.ts`；AI 请求/缓存逻辑在 `src/lib/aiClient.ts`。
- 状态都在 localStorage（`wuxing-profile` / `wuxing-user`），没有后台账号。
- 支付是演示弹窗，不会真扣钱；生日只用于配对，几秒内从数据库删掉。
