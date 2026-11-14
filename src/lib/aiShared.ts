// AI 文案的类型和校验 —— 前后端共用。
// Types + validation for the four AI-generated text blocks. Shared by the
// server route and the client hooks, so both agree on the shape.

export type AiKind = "persona" | "pair" | "squad" | "daily";

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

export type AiPayload = AiPersona | AiPair | AiSquad | AiDaily;

export type AiRequest = {
  kind: AiKind;
  profile?: { name: string; gender: string; date: string; hour: string };
  friend?: { name: string; gender: string; date: string; hour: string };
  members?: { name: string; date: string; hour: string; gender: string }[];
  day?: string;
};

export type AiResponse = {
  ok: boolean;
  source: "ai" | "none";
  data?: AiPayload;
  error?: string;
};

// ---------- helpers ----------

/** 超出长度时尽量在标点处收尾，别把一句话砍成半截 */
function cut(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const p = Math.max(
    slice.lastIndexOf("。"),
    slice.lastIndexOf("！"),
    slice.lastIndexOf("？"),
    slice.lastIndexOf("，"),
    slice.lastIndexOf("；"),
  );
  if (p > max * 0.55) {
    const head = slice.slice(0, p + 1);
    // 停在逗号/分号上会像没说完，换成省略号
    return /[，、；：]$/.test(head) ? head.slice(0, -1) + "…" : head;
  }
  return slice.slice(0, max - 1) + "…";
}

export function str(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return cut(v.replace(/\s+/g, " ").trim(), max);
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
        const label = str(o.label, 12);
        if (!label) return null;
        return { label, value: num(o.value, 10, 99, 80) };
      })
      .filter((b): b is { label: string; value: number } => b !== null)
      .slice(0, 2);
    const title = str(r.title, 30);
    const soul = str(r.soul, 90);
    if (!title || !soul || bars.length < 2) return null;
    return { code: str(r.code, 16) || "WUXING", title, bars, soul } satisfies AiPersona;
  }

  if (kind === "pair") {
    const tag = str(r.tag, 12);
    const teaser = str(r.teaser, 30);
    const roast = str(r.roast, 160);
    const heart = str(r.heart, 160);
    const tip = str(r.tip, 60);
    if (!tag || !roast || !heart) return null;
    return { tag, teaser, roast, heart, tip } satisfies AiPair;
  }

  if (kind === "squad") {
    const title = str(r.title, 20);
    const badge = str(r.badge, 4);
    const headline = str(r.headline, 100);
    const advice = strList(r.advice, 3, 60);
    const rolesRaw = Array.isArray(r.roles) ? r.roles : [];
    const roles = rolesRaw
      .map((x) => {
        if (!x || typeof x !== "object") return null;
        const o = x as Record<string, unknown>;
        const name = str(o.name, 12);
        const role = str(o.role, 20);
        if (!name || !role) return null;
        return { name, role, why: str(o.why, 60) };
      })
      .filter((x): x is { name: string; role: string; why: string } => x !== null)
      .slice(0, 5);
    if (!title || !headline) return null;
    return { title, badge: badge || "✨", headline, advice, roles } satisfies AiSquad;
  }

  // daily
  const headline = str(r.headline, 30);
  const yi = strList(r.yi, 3, 20);
  const ji = strList(r.ji, 3, 20);
  const note = str(r.note, 60);
  if (!headline || yi.length < 2 || ji.length < 2) return null;
  return { headline, yi, ji, note } satisfies AiDaily;
}
