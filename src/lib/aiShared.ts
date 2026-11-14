// AI 文案的类型和校验 —— 前后端共用。
// Types + validation for the four AI-generated text blocks. Shared by the
// server route and the client hooks, so both agree on the shape.

export type AiKind = "persona" | "pair" | "squad" | "daily" | "quiz" | "fengshui" | "homegrid";

export type AiPersona = {
  code: string; // METAL-GENG
  title: string; // 庚金 · 人间清醒人形兵器
  bars: { label: string; value: number }[]; // exactly 2 反差属性条
  soul: string; // 灵魂一击
};

export type AiPair = {
  tag: string; // 关系定位标签
  teaser: string; // 解锁前的悬念
  roast: string; // 毒舌锐评
  heart: string; // 走心模式
  tip: string; // 一条相处建议
};

export type AiSquad = {
  title: string; // 队名
  badge: string; // 一个 emoji
  headline: string; // 一句诊断
  advice: string[]; // 3 条
  roles: { name: string; role: string; why: string }[]; // 分工建议
};

export type AiDaily = {
  headline: string; // 今日一句话
  yi: string[]; // 宜 3 条
  ji: string[]; // 忌 3 条
  note: string; // 提醒
};

export type AiQuiz = {
  headline: string; // 一句话定性
  summary: string; // 60-100 字的总评
  strengths: string[]; // 3 条优势
  watch: string[]; // 2 条盲点
  advice: string; // 一句建议
};

/** 一条英文 + 一行中文小字 */
export type BiText = { en: string; zh: string };

/** 室内布置看图报告：整体 / 3 个可以留 / 3 个可以改 / 一个重点 */
export type AiFengshui = {
  overall: BiText;
  keep: BiText[]; // 3 条
  change: BiText[]; // 3 条
  focus: BiText; // 一个今天就能动手的重点
};

/** 家居分析：九宫格 + 每格照片 */
export type AiHomeGrid = {
  cells: { id: number; en: string; zh: string }[]; // 每间房一句
  overall: BiText;
  keep: BiText[]; // 3 条
  change: BiText[]; // 3 条
  focus: BiText;
};

export type AiPayload = AiPersona | AiPair | AiSquad | AiDaily | AiQuiz | AiFengshui | AiHomeGrid;

export type AiRequest = {
  kind: AiKind;
  /** fengshui：房间类型 key，见 FENGSHUI_ROOMS */
  room?: string;
  /** fengshui / homegrid：压缩后的照片 data URL（最多 4 / 6 张） */
  images?: string[];
  /** homegrid：九宫格里摆了哪些房间、在什么方位、八宅给的什么星 */
  cells?: { id: number; room: string; dirZh: string; dirEn: string; star: string }[];
  profile?: { name: string; gender: string; date: string; hour: string };
  friend?: { name: string; gender: string; date: string; hour: string };
  members?: { name: string; date: string; hour: string; gender: string }[];
  day?: string;
  quiz?: { stem: number; yang: boolean; percent: Record<string, number> };
};

export type AiResponse = {
  ok: boolean;
  source: "ai" | "none";
  data?: AiPayload;
  error?: string;
};

// ---------- helpers ----------

/** 超出长度时尽量在标点处收尾，别把一句话砍成半截（中文标点和英文句号都认） */
function cut(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  let end = -1;
  for (const p of ["。", "！", "？", "；", ". ", "! ", "? "]) {
    const i = slice.lastIndexOf(p);
    if (i >= 0) end = Math.max(end, i + p.length - 1);
  }
  if (end > max * 0.55) {
    const head = slice.slice(0, end + 1).trimEnd();
    // 停在逗号/分号上会像没说完，换成省略号
    return /[，、；：,;]$/.test(head) ? head.slice(0, -1) + "…" : head;
  }
  const comma = Math.max(slice.lastIndexOf("，"), slice.lastIndexOf(", "));
  if (comma > max * 0.55) return slice.slice(0, comma).trimEnd() + "…";
  return slice.slice(0, max - 1).trimEnd() + "…";
}

export function str(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return cut(v.replace(/\s+/g, " ").trim(), max);
}

/** 去掉宿命论说法和结尾的省略号，读起来像人写的 */
function soften(s: string): string {
  return s
    .replace(/生来/g, "本来就")
    .replace(/活成了?/g, "成为")
    .replace(/注定/g, "很容易")
    .replace(/[.…]+$/g, "")
    .trim();
}

export function num(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function strList(v: unknown, count: number, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => str(x, max))
    .filter(Boolean)
    .slice(0, count);
}

/** Turn whatever the model wrote into the exact shape we render, or null. */
export function coerce(kind: AiKind, raw: unknown): AiPayload | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  if (kind === "persona") {
    const barsRaw = Array.isArray(r.bars) ? r.bars : [];
    const bars = barsRaw
      .map((b) => {
        if (!b || typeof b !== "object") return null;
        const o = b as Record<string, unknown>;
        const label = str(o.label, 40);
        if (!label) return null;
        return { label, value: num(o.value, 10, 99, 80) };
      })
      .filter((b): b is { label: string; value: number } => b !== null)
      .slice(0, 2);
    const title = str(r.title, 80);
    const soul = str(r.soul, 220);
    if (!title || !soul || bars.length < 2) return null;
    return { code: str(r.code, 16) || "WUXING", title, bars, soul } satisfies AiPersona;
  }

  if (kind === "pair") {
    const tag = str(r.tag, 40);
    const teaser = str(r.teaser, 90);
    const roast = str(r.roast, 420);
    const heart = str(r.heart, 420);
    const tip = str(r.tip, 160);
    if (!tag || !roast || !heart) return null;
    return { tag, teaser, roast, heart, tip } satisfies AiPair;
  }

  if (kind === "squad") {
    const title = str(r.title, 40);
    const badge = str(r.badge, 4);
    const headline = str(r.headline, 260);
    const advice = strList(r.advice, 3, 130);
    const rolesRaw = Array.isArray(r.roles) ? r.roles : [];
    const roles = rolesRaw
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const o = x as Record<string, unknown>;
        const name = str(o.name, 12);
        const role = str(o.role, 40);
        if (!name || !role) return null;
        return { name, role, why: str(o.why, 130) };
      })
      .filter((x): x is { name: string; role: string; why: string } => x !== null)
      .slice(0, 5);
    if (!title || !headline) return null;
    return { title, badge: badge || "✨", headline, advice, roles } satisfies AiSquad;
  }

  if (kind === "fengshui") {
    const bi = (v: unknown, enMax: number, zhMax: number): BiText | null => {
      if (!v || typeof v !== "object") return null;
      const o = v as Record<string, unknown>;
      // 模型有时会把中英混在一个字段里；两个都没有就当这条作废
      const en = str(o.en, enMax);
      const zh = str(o.zh, zhMax);
      if (!en && !zh) return null;
      return { en: en || zh, zh: zh || en };
    };
    const list = (v: unknown, n: number) =>
      (Array.isArray(v) ? v : [])
        .map((x) => bi(x, 220, 110))
        .filter((x): x is BiText => x !== null)
        .slice(0, n);
    const overall = bi(r.overall, 420, 200);
    const focus = bi(r.focus, 300, 140);
    const keep = list(r.keep, 3);
    const change = list(r.change, 3);
    if (!overall || !focus || keep.length < 2 || change.length < 2) return null;
    return { overall, keep, change, focus } satisfies AiFengshui;
  }

  if (kind === "homegrid") {
    const bi = (v: unknown, enMax: number, zhMax: number): BiText | null => {
      if (!v || typeof v !== "object") return null;
      const o = v as Record<string, unknown>;
      const en = str(o.en, enMax);
      const zh = str(o.zh, zhMax);
      if (!en && !zh) return null;
      return { en: en || zh, zh: zh || en };
    };
    const cells = (Array.isArray(r.cells) ? r.cells : [])
      .map((c) => {
        if (!c || typeof c !== "object") return null;
        const o = c as Record<string, unknown>;
        const id = Number(o.id);
        const t = bi(o, 260, 120);
        if (!Number.isInteger(id) || !t) return null;
        return { id, en: t.en, zh: t.zh };
      })
      .filter((c): c is { id: number; en: string; zh: string } => c !== null)
      .slice(0, 8);
    const overall = bi(r.overall, 460, 220);
    const focus = bi(r.focus, 300, 140);
    const list = (v: unknown) =>
      (Array.isArray(v) ? v : [])
        .map((x) => bi(x, 220, 110))
        .filter((x): x is BiText => x !== null)
        .slice(0, 3);
    const keep = list(r.keep);
    const change = list(r.change);
    if (!overall || !focus || !cells.length) return null;
    return { cells, overall, keep, change, focus } satisfies AiHomeGrid;
  }

  // daily
  const headline = str(r.headline, 90);
  const yi = strList(r.yi, 3, 60);
  const ji = strList(r.ji, 3, 60);
  const note = str(r.note, 150);
  if (!headline || yi.length < 2 || ji.length < 2) return null;
  if (kind === "quiz") {
    const summary = soften(str(r.summary, 320));
    const strengths = strList(r.strengths, 3, 70).map(soften);
    const watch = strList(r.watch, 2, 70).map(soften);
    const advice = soften(str(r.advice, 110));
    if (!summary || strengths.length < 2 || watch.length < 1) return null;
    return { headline: soften(headline), summary, strengths, watch, advice } satisfies AiQuiz;
  }
  return { headline, yi, ji, note } satisfies AiDaily;
}
