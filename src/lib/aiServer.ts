// 服务端 AI：把八字事实整理成提示词，调用任意 OpenAI 兼容接口，再校验回 JSON。
// Server-side AI for the four text blocks. Works with any OpenAI-compatible
// endpoint; set the key in the host's environment variables (see .env.example).
//
// If no key is configured (or the call fails), the route returns ok:false and
// the page keeps its built-in copy from src/lib/copy.ts. A demo never breaks.

import {
  DAY_MASTER_TYPES,
  ELEMENTS,
  ELEMENT_INFO,
  STEMS,
  STEM_ELEMENT,
  computeChart,
  computeLayers,
  computeMatch,
  pillarText,
  readChart,
  type Chart,
  type Profile,
} from "@/lib/bazi";
import { coerce, type AiKind, type AiPayload, type AiRequest } from "@/lib/aiShared";

type Cfg = { base: string; key: string; model: string; label: string };

export function aiConfig(): Cfg | null {
  const model = process.env.AI_MODEL || "";
  const base = (process.env.AI_BASE_URL || "").replace(/\/+$/, "");
  const explicit = process.env.AI_API_KEY;
  if (explicit) {
    return {
      base: base || "https://api.deepseek.com/v1",
      key: explicit,
      model: model || "deepseek-chat",
      label: "custom",
    };
  }
  if (process.env.DEEPSEEK_API_KEY) {
    return { base: base || "https://api.deepseek.com/v1", key: process.env.DEEPSEEK_API_KEY, model: model || "deepseek-chat", label: "deepseek" };
  }
  const gemini = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (gemini) {
    return {
      base: base || "https://generativelanguage.googleapis.com/v1beta/openai",
      key: gemini,
      model: model || "gemini-3.5-flash",
      label: "gemini",
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return { base: base || "https://api.openai.com/v1", key: process.env.OPENAI_API_KEY, model: model || "gpt-4o-mini", label: "openai" };
  }
  if (process.env.GROQ_API_KEY) {
    return { base: base || "https://api.groq.com/openai/v1", key: process.env.GROQ_API_KEY, model: model || "llama-3.3-70b-versatile", label: "groq" };
  }
  return null;
}

// ---------- facts ----------

function toProfile(p: NonNullable<AiRequest["profile"]>): Profile {
  return {
    name: p.name.slice(0, 20),
    gender: p.gender === "m" || p.gender === "f" ? p.gender : "",
    date: p.date,
    hour: p.hour ?? "",
  };
}

function pctOf(chart: Chart) {
  return computeLayers(chart)[2].percent;
}

function personFacts(p: Profile, chart: Chart) {
  const pct = pctOf(chart);
  const reading = readChart(chart);
  const el = ELEMENT_INFO[chart.element];
  const missing = reading.missing.map((m) => ELEMENT_INFO[m].zh).join("、") || "无";
  return [
    `名字：${p.name || "匿名"}`,
    `性别：${p.gender === "m" ? "男" : p.gender === "f" ? "女" : "未填"}`,
    `生日：${p.date}${p.hour === "" ? "（时辰未知，只看三柱）" : ""}`,
    `日主：${STEMS[chart.dayMaster]}${el.zh}（${DAY_MASTER_TYPES[chart.dayMaster].title}）`,
    `四柱：${chart.pillars.map((x) => pillarText(x.pillar)).join(" ")}`,
    `五行比例：${ELEMENTS.map((e) => `${ELEMENT_INFO[e].zh}${pct[e]}%`).join(" ")}`,
    `身强弱：${reading.strong ? "身强" : "身弱"}；偏缺：${missing}`,
  ].join("｜");
}

// ---------- prompts ----------

const SYSTEM = [
  "你是「五行引擎 WuXing Engine」的赛博命理文案师。",
  "你懂八字五行，但说话像小红书/IG 上很会玩梗的朋友：短句、有画面感、敢吐槽但不人身攻击、不油腻、不说教。",
  "用英文写。可以用一点马来西亚大学生活场景（mamak、group assignment、deadline、宿舍、冰美式）。",
  "只根据给你的八字事实说话：不要编造没写出来的天干、五行或数字。",
  "注意：只有「日主」代表一个人的性格，其他柱的天干不要拿来当人格标签。",
  "不要出现「作为 AI」「希望有帮助」这类话。",
  "Output ENGLISH only. Simple, natural English at B1-B2 level: short sentences (12-18 words), common words, no fancy vocabulary.",
  "只输出一个 JSON 对象，不要 markdown 代码块，不要解释。",
].join("\n");

function userPrompt(kind: AiKind, facts: string): string {
  if (kind === "persona") {
    return `${facts}

请给这个人写一张 MBTI 风格的「日柱人设卡」：
1. code：MBTI 式代号，全大写英文，格式「元素-拼音」，例如 METAL-GENG、WATER-GUI。
2. title：称号，格式「天干+五行 · 一句人设」，不超过 20 个汉字，要有梗、要准。
3. bars：正好两条「反差属性条」，必须是一条「表面…」配一条相反的另一面（「内心…」/「私下…」），label 不超过 8 个汉字，value 是 40-99 的整数。不要两条都写表面行为。
4. soul：灵魂一击，一句大白话扎心又好笑的总结，25-45 个汉字（硬限制，超过 45 字算不合格），像朋友突然揭穿你。

JSON 格式：
{"code":"","title":"","bars":[{"label":"","value":0},{"label":"","value":0}],"soul":""}`;
  }

  if (kind === "pair") {
    return `${facts}

这是一对朋友的合盘。请写：
1. tag：关系定位标签，必须是中文，不超过 8 个汉字，要具体好笑（如「搞钱绝配」「塑料饭搭子」「欢喜冤家」）。
2. teaser：解锁前的悬念，一句，不超过 18 个汉字，结尾用省略号。
3. roast：毒舌锐评，结合两人五行生克狠狠吐槽，50-90 个汉字，要具体到生活场景，好笑但别伤人。
4. heart：走心模式，给具体的相处避坑指南或互补建议，50-90 个汉字，要能照着做。
5. tip：一条最短的相处建议，不超过 25 个汉字。

JSON 格式：
{"tag":"","teaser":"","roast":"","heart":"","tip":""}`;
  }

  if (kind === "squad") {
    return `${facts}

这是一个 3-5 人的「五行小队」。请根据成员五行分布做团队诊断：
1. title：队名，不超过 12 个汉字，要像综艺队名、有梗。
2. badge：一个最贴切的 emoji。
3. headline：一句诊断，30-60 个汉字，直接说这个队最大的问题或最大的优势。
4. advice：正好三条团队建议，每条不超过 40 个汉字，具体可执行。
5. roles：给每个成员一句分工建议，name 用成员名字，role 是职位（如「Leader」「管钱」「创意」），why 不超过 30 个汉字。

JSON 格式：
{"title":"","badge":"","headline":"","advice":["","",""],"roles":[{"name":"","role":"","why":""}]}`;
  }

  if (kind === "quiz") {
    return `${facts}

这是一个人做完 15 道「五行性格题」后的结果，不是八字。请写一份像朋友看穿你的性格报告。
注意：直接写「他是个什么样的人」，不要提题目、选项、答案，也不要说「你选了……所以……」。
不要用「生来」「注定」「活成」这类宿命论说法；用「你习惯」「你容易」。
1. headline：一句话定性，不超过 14 个汉字，要有画面感、有梗。
2. summary：60-100 个汉字的总评：你是什么样的人、别人跟你相处会有什么感觉。
3. strengths：正好三条优势，每条不超过 16 个汉字，要具体。
4. watch：正好两条盲点，每条不超过 16 个汉字，别骂人。
5. advice：一条现在就能做的建议，不超过 25 个汉字。

JSON 格式：
{"headline":"","summary":"","strengths":["","",""],"watch":["",""],"advice":""}`;
  }

  return `${facts}

请为这个人写今天的「赛博黄历」：
1. headline：今日一句话总结，不超过 15 个汉字，有画面感。
2. yi：宜，正好三条，每条不超过 12 个汉字，要针对学生/职场日常（喝冰美式、找导师套近乎、早点睡……）。
3. ji：忌，正好三条，每条不超过 12 个汉字，具体好笑。
4. note：一句提醒，不超过 40 个汉字。

JSON 格式：
{"headline":"","yi":["","",""],"ji":["","",""],"note":""}`;
}

// ---------- model call ----------

type Attempt = { data?: unknown; retry: boolean };

const RETRY_STATUS = [429, 500, 502, 503, 504, 404];

// 某个模型今天没额度 / 慢到不能等，就先记住，10 分钟内不再碰它（省得每次都要等超时）
const SKIP = new Map<string, number>();
const SKIP_MS = 10 * 60 * 1000;

async function callModel(cfg: Cfg, model: string, user: string, temperature: number, budgetMs: number): Promise<Attempt> {
  const body: Record<string, unknown> = {
    model,
    temperature,
    max_tokens: 2500,
    // 少想一点，快一点（Gemini 3.x 默认会长时间思考，一张卡要等十几秒）
    reasoning_effort: "low",
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), budgetMs);
  try {
    let res = await fetch(`${cfg.base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.key}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok && (res.status === 400 || res.status === 422)) {
      // 有的接口不认 response_format / reasoning_effort，去掉再试一次
      delete body.response_format;
      delete body.reasoning_effort;
      res = await fetch(`${cfg.base}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${cfg.key}` },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    }
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 120);
      console.warn(`[ai] ${cfg.label}/${model} ${res.status}: ${detail}`);
      if (res.status === 429) SKIP.set(model, Date.now() + SKIP_MS);
      return { retry: RETRY_STATUS.includes(res.status) };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string | { text?: string }[] }; finish_reason?: string }[];
    };
    const raw = json.choices?.[0]?.message?.content;
    const text = typeof raw === "string" ? raw : Array.isArray(raw) ? raw.map((p) => p.text ?? "").join("") : "";
    if (!text.trim()) {
      console.warn(`[ai] ${cfg.label}/${model} empty content, finish=${json.choices?.[0]?.finish_reason}`);
      SKIP.set(model, Date.now() + SKIP_MS);
      return { retry: true };
    }
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) return { retry: false };
    try {
      return { data: JSON.parse(cleaned.slice(start, end + 1)) as unknown, retry: false };
    } catch {
      return { retry: true };
    }
  } catch (err) {
    if (controller.signal.aborted) {
      console.warn(`[ai] ${cfg.label}/${model} timeout after ${budgetMs}ms`);
      SKIP.set(model, Date.now() + SKIP_MS);
      return { retry: true };
    }
    console.warn("[ai] call failed:", err instanceof Error ? err.message : err);
    return { retry: false };
  } finally {
    clearTimeout(timer);
  }
}

async function chatJson(cfg: Cfg, user: string, temperature: number): Promise<unknown | null> {
  // 免费额度按模型算：主模型限流 / 变慢就退到 lite，保证路演时一定有字
  const models =
    cfg.label === "gemini"
      ? Array.from(new Set([cfg.model, "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]))
      : [cfg.model];

  const deadline = Date.now() + 25000;
  for (const model of models) {
    if ((SKIP.get(model) ?? 0) > Date.now()) continue; // 刚失败过，先跳过
    const left = deadline - Date.now();
    if (left < 3000) break;
    const attempt = await callModel(cfg, model, user, temperature, Math.min(8000, left));
    if (attempt.data !== undefined) return attempt.data;
    if (!attempt.retry) return null;
  }
  return null;
}

// ---------- entry ----------

function buildFacts(req: AiRequest): string | null {
  if (req.kind === "persona" || req.kind === "daily") {
    if (!req.profile) return null;
    const p = toProfile(req.profile);
    const chart = computeChartFor(p);
    if (!chart) return null;
    const base = personFacts(p, chart);
    if (req.kind === "persona") return `【人物】\n${base}`;
    const day = req.day || new Date().toISOString().slice(0, 10);
    const lucky = ELEMENT_INFO[readChart(chart).lucky];
    return `【人物】\n${base}\n今日日期：${day}\n今日幸运五行：${lucky.zh}（可写进黄历）`;
  }

  if (req.kind === "pair") {
    if (!req.profile || !req.friend) return null;
    const a = toProfile(req.profile);
    const b = toProfile(req.friend);
    const ca = computeChartFor(a);
    const cb = computeChartFor(b);
    if (!ca || !cb) return null;
    const score = computeMatch(ca, cb, a.gender, b.gender);
    return `【A】\n${personFacts(a, ca)}\n\n【B】\n${personFacts(b, cb)}\n\n配对分数：${score.score}%（${score.label}），日主关系：${score.reason}`;
  }

  if (req.kind === "quiz") {
    if (!req.quiz) return null;
    const { stem, yang, percent } = req.quiz;
    const el = ELEMENT_INFO[STEM_ELEMENT[stem]];
    const mix = ELEMENTS.map((e) => `${ELEMENT_INFO[e].zh}${Math.round(percent[e] ?? 0)}%`).join(" ");
    return `【问卷结果】\n主五行：${el.zh}（${Math.round(percent[STEM_ELEMENT[stem]] ?? 0)}%）｜阴阳：偏${yang ? "阳" : "阴"}｜对应：${STEMS[stem]}${el.zh}\n五行占比：${mix}`;
  }

  // squad
  const members = (req.members ?? []).slice(0, 5);
  if (members.length < 2) return null;
  const rows: string[] = [];
  const counts: Record<string, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const m of members) {
    const p = toProfile(m);
    const c = computeChartFor(p);
    if (!c) continue;
    const reading = readChart(c);
    counts[ELEMENT_INFO[c.element].zh] += 1;
    rows.push(`${p.name}：日主${STEMS[c.dayMaster]}${ELEMENT_INFO[c.element].zh}，${reading.strong ? "身强" : "身弱"}，喜${ELEMENT_INFO[reading.lucky].zh}`);
  }
  const missing = Object.entries(counts)
    .filter(([, n]) => n === 0)
    .map(([k]) => k);
  return `【队员】\n${rows.join("\n")}\n\n五行人数：木${counts["木"]} 火${counts["火"]} 土${counts["土"]} 金${counts["金"]} 水${counts["水"]}\n缺少：${missing.join("、") || "不缺，五行齐全"}`;
}

/** Local chart helper — kept here so the route never passes raw bazi logic around. */
function computeChartFor(p: Profile): Chart | null {
  return computeChart(p);
}

export async function generate(req: AiRequest): Promise<{ data: AiPayload | null; error?: string }> {
  const cfg = aiConfig();
  if (!cfg) return { data: null, error: "no-key" };
  const facts = buildFacts(req);
  if (!facts) return { data: null, error: "bad-input" };
  const temperature = req.kind === "pair" || req.kind === "squad" || req.kind === "quiz" ? 0.95 : 0.85;
  const raw = await chatJson(cfg, userPrompt(req.kind, facts), temperature);
  if (!raw) return { data: null, error: "model-failed" };
  const data = coerce(req.kind, raw);
  if (!data) return { data: null, error: "bad-shape" };
  return { data };
}
