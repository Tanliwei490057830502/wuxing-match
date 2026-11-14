// 简化版八字五行计算 —— 为了好玩，不是专业排盘。
// Simplified Bazi / Five Elements — for fun, not professional fortune-telling.

export type Element = "wood" | "fire" | "earth" | "metal" | "water";

export const ELEMENTS: Element[] = ["wood", "fire", "earth", "metal", "water"];

export const ELEMENT_INFO: Record<
  Element,
  { zh: string; en: string; emoji: string; color: string; soft: string }
> = {
  wood: { zh: "木", en: "Wood", emoji: "🌳", color: "#4caf7a", soft: "#dcf5e5" },
  fire: { zh: "火", en: "Fire", emoji: "🔥", color: "#ff6b6b", soft: "#ffe0e0" },
  earth: { zh: "土", en: "Earth", emoji: "⛰️", color: "#d9a441", soft: "#fbefd2" },
  metal: { zh: "金", en: "Metal", emoji: "🪙", color: "#9b8cff", soft: "#ebe7ff" },
  water: { zh: "水", en: "Water", emoji: "💧", color: "#4aa8ff", soft: "#dcefff" },
};

const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const STEM_ELEMENT: Element[] = [
  "wood", "wood", "fire", "fire", "earth", "earth", "metal", "metal", "water", "water",
];
const BRANCH_ELEMENT: Element[] = [
  "water", "earth", "wood", "wood", "earth", "fire", "fire", "earth", "metal", "metal", "earth", "water",
];

// 十二时辰 (index = branch index). Value "" means unknown.
export const HOURS: { value: string; label: string }[] = [
  { value: "", label: "不知道 / Not sure" },
  { value: "0", label: "子时 23:00–00:59" },
  { value: "1", label: "丑时 01:00–02:59" },
  { value: "2", label: "寅时 03:00–04:59" },
  { value: "3", label: "卯时 05:00–06:59" },
  { value: "4", label: "辰时 07:00–08:59" },
  { value: "5", label: "巳时 09:00–10:59" },
  { value: "6", label: "午时 11:00–12:59" },
  { value: "7", label: "未时 13:00–14:59" },
  { value: "8", label: "申时 15:00–16:59" },
  { value: "9", label: "酉时 17:00–18:59" },
  { value: "10", label: "戌时 19:00–20:59" },
  { value: "11", label: "亥时 21:00–22:59" },
];

// 日主性格 —— 像 MBTI 一样的十种类型
export const DAY_MASTER_TYPES: {
  title: string;
  en: string;
  traits: string;
  traitsEn: string;
}[] = [
  { title: "青松", en: "The Oak", traits: "正直有担当，朋友的靠山。", traitsEn: "Upright and dependable — everyone's rock." },
  { title: "青藤", en: "The Vine", traits: "温柔又会变通，社交小能手。", traitsEn: "Gentle, flexible, a social butterfly." },
  { title: "烈阳", en: "The Sun", traits: "热情大方，走到哪里亮到哪里。", traitsEn: "Warm and generous, lights up every room." },
  { title: "明烛", en: "The Candle", traits: "细心体贴，默默照亮身边的人。", traitsEn: "Thoughtful, quietly lights up friends." },
  { title: "厚山", en: "The Mountain", traits: "可靠踏实，天塌下来也不慌。", traitsEn: "Solid and calm, never panics." },
  { title: "沃田", en: "The Garden", traits: "包容心强，最会照顾人。", traitsEn: "Caring and nurturing, a natural carer." },
  { title: "锐锋", en: "The Blade", traits: "果断直率，说到做到。", traitsEn: "Decisive and direct, keeps every promise." },
  { title: "珠玉", en: "The Jewel", traits: "精致有品味，小细节控。", traitsEn: "Stylish and detail-loving." },
  { title: "沧海", en: "The Ocean", traits: "聪明点子多，自由不受拘束。", traitsEn: "Smart, full of ideas, free-spirited." },
  { title: "甘露", en: "The Dew", traits: "感性有灵气，超会察言观色。", traitsEn: "Intuitive and perceptive." },
];

export type Gender = "m" | "f";

export type Profile = {
  name: string;
  gender: Gender | ""; // "" = unknown (old links)
  date: string; // YYYY-MM-DD
  hour: string; // "" or "0".."11" (branch index)
};

export const GENDER_INFO: Record<Gender, { zh: string; en: string; chart: string; emoji: string }> = {
  m: { zh: "男", en: "Male", chart: "乾造", emoji: "👦" },
  f: { zh: "女", en: "Female", chart: "坤造", emoji: "👧" },
};

export function parseGender(v: string): Gender | "" {
  return v === "m" || v === "f" ? v : "";
}

export type Pillar = { stem: number; branch: number };

export type Chart = {
  pillars: { label: string; pillar: Pillar }[];
  dayMaster: number; // stem index
  element: Element;
  counts: Record<Element, number>;
};

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function daysSinceEpoch(y: number, m: number, d: number) {
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

// 1900-01-01 是甲戌日 (cycle index 10)
const REF_DAYS = daysSinceEpoch(1900, 1, 1);
const REF_CYCLE = 10;

export function computeChart(profile: Profile): Chart | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(profile.date);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;

  // Year pillar: year changes around 立春 (~Feb 4)
  const beforeSpring = m < 2 || (m === 2 && d < 4);
  const yearNum = beforeSpring ? y - 1 : y;
  const yearCycle = mod(yearNum - 4, 60);
  const year: Pillar = { stem: yearCycle % 10, branch: yearCycle % 12 };

  // Month pillar: solar months start around the 6th; 寅 month starts in Feb
  const solarMonth = d < 6 ? m - 1 : m; // 1..12, 0 = previous Dec
  const monthBranch = mod(solarMonth, 12); // Jan -> 丑(1), Feb -> 寅(2), Dec -> 子(0)
  const monthOffset = mod(monthBranch - 2, 12); // 寅 = 0
  const firstMonthStem = mod((year.stem % 5) * 2 + 2, 10); // 五虎遁
  const month: Pillar = { stem: mod(firstMonthStem + monthOffset, 10), branch: monthBranch };

  // Day pillar
  const dayCycle = mod(REF_CYCLE + daysSinceEpoch(y, m, d) - REF_DAYS, 60);
  const day: Pillar = { stem: dayCycle % 10, branch: dayCycle % 12 };

  const pillars: { label: string; pillar: Pillar }[] = [
    { label: "年 Year", pillar: year },
    { label: "月 Month", pillar: month },
    { label: "日 Day", pillar: day },
  ];

  if (profile.hour !== "") {
    const hb = Number(profile.hour);
    if (hb >= 0 && hb <= 11) {
      const hourStem = mod((day.stem % 5) * 2 + hb, 10); // 五鼠遁
      pillars.push({ label: "时 Hour", pillar: { stem: hourStem, branch: hb } });
    }
  }

  const counts: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const { pillar } of pillars) {
    counts[STEM_ELEMENT[pillar.stem]] += 1;
    counts[BRANCH_ELEMENT[pillar.branch]] += 1;
  }

  return { pillars, dayMaster: day.stem, element: STEM_ELEMENT[day.stem], counts };
}

export function pillarText(p: Pillar) {
  return STEMS[p.stem] + BRANCHES[p.branch];
}

export function stemText(i: number) {
  return STEMS[i];
}

// 相生: wood→fire→earth→metal→water→wood
function generates(a: Element, b: Element) {
  return ELEMENTS[(ELEMENTS.indexOf(a) + 1) % 5] === b;
}
// 相克: wood→earth→water→fire→metal→wood
function controls(a: Element, b: Element) {
  return ELEMENTS[(ELEMENTS.indexOf(a) + 2) % 5] === b;
}

export type MatchResult = {
  score: number;
  romantic: boolean; // one male + one female
  label: string;
  labelEn: string;
  title: string;
  titleEn: string;
  reason: string;
  reasonEn: string;
};

export function computeMatch(
  a: Chart,
  b: Chart,
  genderA: Gender | "" = "",
  genderB: Gender | "" = "",
): MatchResult {
  const romantic = genderA !== "" && genderB !== "" && genderA !== genderB;
  let base: number;
  let reason: string;
  let reasonEn: string;
  const ea = ELEMENT_INFO[a.element];
  const eb = ELEMENT_INFO[b.element];

  if (a.element === b.element) {
    base = 76;
    reason = `你们都是${ea.zh}，想法很像，一拍即合！`;
    reasonEn = `You're both ${ea.en} — great minds think alike!`;
  } else if (generates(a.element, b.element) || generates(b.element, a.element)) {
    base = 88;
    const [from, to] = generates(a.element, b.element) ? [ea, eb] : [eb, ea];
    reason = `${from.zh}生${to.zh}，互相成就的最佳拍档！`;
    reasonEn = `${from.en} feeds ${to.en} — you bring out the best in each other!`;
  } else {
    base = 64;
    const [from, to] = controls(a.element, b.element) ? [ea, eb] : [eb, ea];
    reason = `${from.zh}克${to.zh}，火花四射，吵吵闹闹感情好～`;
    reasonEn = `${from.en} challenges ${to.en} — sparks fly, but it's never boring!`;
  }

  // Bonus: friend has a lot of what you're missing (互补)
  let bonus = 0;
  for (const el of ELEMENTS) {
    if (a.counts[el] === 0 && b.counts[el] >= 2) bonus += 3;
    if (b.counts[el] === 0 && a.counts[el] >= 2) bonus += 3;
  }

  // A little stable "fate" wobble so every pair feels unique.
  // Each person gets their own number from the SAME formula, then the two are added,
  // so A-invites-B and B-invites-A always give exactly the same score.
  const seed = (personalSeed(a) + personalSeed(b)) % 9;
  // 阴阳调和: man with a yang day master + woman with a yin day master
  if (romantic) {
    const man = genderA === "m" ? a : b;
    const woman = genderA === "m" ? b : a;
    if (man.dayMaster % 2 === 0 && woman.dayMaster % 2 === 1) {
      bonus += 4;
      reason += " 男阳女阴，阴阳调和！";
      reasonEn += " Yang meets yin — perfect balance!";
    }
  }

  const score = Math.max(52, Math.min(99, base + bonus + seed - 4));

  let title: string;
  let titleEn: string;
  if (romantic) {
    if (score >= 90) { title = "天生一对"; titleEn = "Born for each other"; }
    else if (score >= 80) { title = "正缘来了"; titleEn = "The real one"; }
    else if (score >= 70) { title = "甜甜的恋爱"; titleEn = "Sweet romance"; }
    else if (score >= 60) { title = "欢喜冤家"; titleEn = "Love-hate sparks"; }
    else { title = "慢慢培养"; titleEn = "Slow burn"; }
  } else {
    if (score >= 90) { title = "灵魂挚友"; titleEn = "Soul friends"; }
    else if (score >= 80) { title = "超级合拍"; titleEn = "Super in sync"; }
    else if (score >= 70) { title = "好朋友组合"; titleEn = "Besties"; }
    else if (score >= 60) { title = "欢喜冤家"; titleEn = "Frenemies (the fun kind)"; }
    else { title = "需要多磨合"; titleEn = "Work in progress"; }
  }

  const label = romantic ? "缘分指数" : "友情指数";
  const labelEn = romantic ? "Love score" : "Friendship score";

  return { score, romantic, label, labelEn, title, titleEn, reason, reasonEn };
}

function personalSeed(c: Chart) {
  return c.dayMaster * 7 + sumCounts(c) * 3 + c.pillars[0].pillar.branch * 11;
}

function sumCounts(c: Chart) {
  return ELEMENTS.reduce((s, el, i) => s + c.counts[el] * (i + 1), 0);
}

export function inviteUrl(origin: string, p: Profile) {
  const params = new URLSearchParams({ n: p.name, d: p.date });
  if (p.gender) params.set("g", p.gender);
  if (p.hour !== "") params.set("h", p.hour);
  return `${origin}/match?${params.toString()}`;
}

// ---------- 八字解读 (simplified reading) ----------

export const PILLAR_MEANING: Record<string, { zh: string; en: string }> = {
  "年 Year": { zh: "祖上与童年，你从小带着的底色", en: "Roots & childhood" },
  "月 Month": { zh: "父母与成长环境，影响做事风格", en: "Family & how you grew up" },
  "日 Day": { zh: "你自己（日主）和另一半", en: "You yourself & your partner" },
  "时 Hour": { zh: "子女与晚年，也代表你的梦想", en: "Dreams & later life" },
};

export const ELEMENT_TRAIT: Record<Element, { zh: string; en: string; luckyColor: string; direction: string }> = {
  wood: { zh: "仁 · 成长、善良、有上进心", en: "Growth & kindness", luckyColor: "绿色 Green", direction: "东 East" },
  fire: { zh: "礼 · 热情、表达力强、有魅力", en: "Passion & charm", luckyColor: "红色 Red", direction: "南 South" },
  earth: { zh: "信 · 稳重、守信用、包容", en: "Trust & stability", luckyColor: "黄色 Yellow", direction: "中 Centre" },
  metal: { zh: "义 · 果断、讲义气、有原则", en: "Loyalty & decisiveness", luckyColor: "白色/金色 White/Gold", direction: "西 West" },
  water: { zh: "智 · 聪明、灵活、想象力丰富", en: "Wisdom & flexibility", luckyColor: "蓝色/黑色 Blue/Black", direction: "北 North" },
};

export type Reading = {
  strongest: Element[];
  missing: Element[]; // under 5% after all three layers
  strong: boolean; // 身强
  supportPct: number;
  lucky: Element;
};

// Uses the final (layer 3) numbers so it matches the charts
export function readChart(chart: Chart): Reading {
  const pct = computeLayers(chart)[2].percent;
  const max = Math.max(...ELEMENTS.map((el) => pct[el]));
  const strongest = ELEMENTS.filter((el) => pct[el] === max);
  const missing = ELEMENTS.filter((el) => pct[el] < 5);

  const self = chart.element;
  const mother = ELEMENTS[(ELEMENTS.indexOf(self) + 4) % 5]; // the element that generates me (印)
  const child = ELEMENTS[(ELEMENTS.indexOf(self) + 1) % 5]; // the element I generate (食伤)
  const supportPct = pct[self] + pct[mother];
  const strong = supportPct >= 50;

  // 身强喜泄，身弱喜生 (very simplified 喜用神)
  const lucky = strong ? child : mother;

  return { strongest, missing, strong, supportPct, lucky };
}

export function elementRelation(a: Element, b: Element): "same" | "generate" | "control" {
  if (a === b) return "same";
  if (ELEMENTS[(ELEMENTS.indexOf(a) + 1) % 5] === b || ELEMENTS[(ELEMENTS.indexOf(b) + 1) % 5] === a) {
    return "generate";
  }
  return "control";
}

// ---------- 三层计算 · Three calculation layers ----------

// 地支藏干 (hidden stems), main qi first
const HIDDEN_STEMS: number[][] = [
  [9], // 子: 癸
  [5, 9, 7], // 丑: 己 癸 辛
  [0, 2, 4], // 寅: 甲 丙 戊
  [1], // 卯: 乙
  [4, 1, 9], // 辰: 戊 乙 癸
  [2, 4, 6], // 巳: 丙 戊 庚
  [3, 5], // 午: 丁 己
  [5, 3, 1], // 未: 己 丁 乙
  [6, 8, 4], // 申: 庚 壬 戊
  [7], // 酉: 辛
  [4, 7, 3], // 戌: 戊 辛 丁
  [8, 0], // 亥: 壬 甲
];
const HIDDEN_WEIGHTS: Record<number, number[]> = { 1: [1], 2: [0.7, 0.3], 3: [0.6, 0.3, 0.1] };

// 天干五合: 甲己土 乙庚金 丙辛水 丁壬木 戊癸火
const STEM_COMBOS: { a: number; b: number; to: Element }[] = [
  { a: 0, b: 5, to: "earth" },
  { a: 1, b: 6, to: "metal" },
  { a: 2, b: 7, to: "water" },
  { a: 3, b: 8, to: "wood" },
  { a: 4, b: 9, to: "fire" },
];
// 地支六合: 子丑土 寅亥木 卯戌火 辰酉金 巳申水 午未火
const BRANCH_COMBOS: { a: number; b: number; to: Element }[] = [
  { a: 0, b: 1, to: "earth" },
  { a: 2, b: 11, to: "wood" },
  { a: 3, b: 10, to: "fire" },
  { a: 4, b: 9, to: "metal" },
  { a: 5, b: 8, to: "water" },
  { a: 6, b: 7, to: "fire" },
];
// 六冲: 子午 丑未 寅申 卯酉 辰戌 巳亥 (branches 6 apart)
const CLASH_LOSS = 0.3;

type Piece = { source: string; element: Element; points: number };

export type Layer = {
  key: 1 | 2 | 3;
  title: string;
  titleEn: string;
  logic: string;
  logicEn: string;
  percent: Record<Element, number>;
  events: string[]; // what happened in this layer, human readable
};

function toPercent(pieces: Piece[]): Record<Element, number> {
  const sum: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  for (const p of pieces) sum[p.element] += p.points;
  const total = ELEMENTS.reduce((s, el) => s + sum[el], 0) || 1;
  const out = {} as Record<Element, number>;
  for (const el of ELEMENTS) out[el] = Math.round((sum[el] / total) * 100);
  return out;
}

function shortLabel(label: string) {
  return label.split(" ")[0]; // "年 Year" -> "年"
}

export function computeLayers(chart: Chart): Layer[] {
  const n = chart.pillars.length;

  // Layer 1: every visible character = 1 point
  const l1: Piece[] = [];
  chart.pillars.forEach(({ label, pillar }) => {
    const s = shortLabel(label);
    l1.push({ source: `${s}干`, element: STEM_ELEMENT[pillar.stem], points: 1 });
    l1.push({ source: `${s}支`, element: BRANCH_ELEMENT[pillar.branch], points: 1 });
  });

  // Layer 2: branches split into hidden stems; month branch (月令) counts double
  const l2: Piece[] = [];
  const l2Events: string[] = [];
  chart.pillars.forEach(({ label, pillar }) => {
    const s = shortLabel(label);
    l2.push({ source: `${s}干`, element: STEM_ELEMENT[pillar.stem], points: 1 });
    const hidden = HIDDEN_STEMS[pillar.branch];
    const weights = HIDDEN_WEIGHTS[hidden.length];
    const factor = s === "月" ? 2 : 1;
    hidden.forEach((stem, i) => {
      l2.push({ source: `${s}支`, element: STEM_ELEMENT[stem], points: weights[i] * factor });
    });
    if (hidden.length > 1) {
      l2Events.push(
        `${s}支「${BRANCHES[pillar.branch]}」藏 ${hidden
          .map((st) => STEMS[st] + ELEMENT_INFO[STEM_ELEMENT[st]].zh)
          .join("、")}${factor === 2 ? "（月令 ×2）" : ""}`,
      );
    } else if (factor === 2) {
      l2Events.push(`月支「${BRANCHES[pillar.branch]}」是月令，分数 ×2`);
    }
  });

  // Layer 3: start from layer 2, apply combinations (合化) and clashes (冲)
  let l3: Piece[] = l2.map((p) => ({ ...p }));
  const l3Events: string[] = [];
  const usedStem = new Set<number>();
  const usedBranch = new Set<number>();

  for (let i = 0; i < n - 1; i++) {
    const A = chart.pillars[i];
    const B = chart.pillars[i + 1];
    const sa = shortLabel(A.label);
    const sb = shortLabel(B.label);

    // adjacent stems combine
    if (!usedStem.has(i) && !usedStem.has(i + 1)) {
      const combo = STEM_COMBOS.find(
        (c) =>
          (c.a === A.pillar.stem && c.b === B.pillar.stem) || (c.b === A.pillar.stem && c.a === B.pillar.stem),
      );
      if (combo) {
        usedStem.add(i).add(i + 1);
        const from = [STEM_ELEMENT[A.pillar.stem], STEM_ELEMENT[B.pillar.stem]];
        l3 = l3.map((p) =>
          p.source === `${sa}干` || p.source === `${sb}干` ? { ...p, element: combo.to } : p,
        );
        l3Events.push(
          `${STEMS[A.pillar.stem]}${STEMS[B.pillar.stem]}合${ELEMENT_INFO[combo.to].zh}：${[...new Set(from)]
            .map((e) => ELEMENT_INFO[e].zh)
            .join("和")}的分数转给${ELEMENT_INFO[combo.to].zh}`,
        );
      }
    }

    // adjacent branches combine or clash
    if (!usedBranch.has(i) && !usedBranch.has(i + 1)) {
      const ba = A.pillar.branch;
      const bb = B.pillar.branch;
      const combo = BRANCH_COMBOS.find((c) => (c.a === ba && c.b === bb) || (c.b === ba && c.a === bb));
      if (combo) {
        usedBranch.add(i).add(i + 1);
        l3 = l3.map((p) =>
          p.source === `${sa}支` || p.source === `${sb}支` ? { ...p, element: combo.to } : p,
        );
        l3Events.push(`${BRANCHES[ba]}${BRANCHES[bb]}合${ELEMENT_INFO[combo.to].zh}：两个地支的分数都转给${ELEMENT_INFO[combo.to].zh}`);
      } else if (mod(ba - bb, 12) === 6) {
        usedBranch.add(i).add(i + 1);
        l3 = l3.map((p) =>
          p.source === `${sa}支` || p.source === `${sb}支` ? { ...p, points: p.points * (1 - CLASH_LOSS) } : p,
        );
        l3Events.push(`${BRANCHES[ba]}${BRANCHES[bb]}相冲：两个地支互相削弱，各减 ${CLASH_LOSS * 100}%`);
      }
    }
  }
  if (l3Events.length === 0) l3Events.push("这个八字没有相邻的合或冲，所以和第二层一样。");

  return [
    {
      key: 1,
      title: "第一层 · 字面",
      titleEn: "Layer 1 · Surface",
      logic: `${n * 2} 个字平均分配，每个字占 ${Math.round(1000 / (n * 2)) / 10}%。`,
      logicEn: `Each of the ${n * 2} characters counts equally.`,
      percent: toPercent(l1),
      events: ["只看字面上写出来的天干地支。"],
    },
    {
      key: 2,
      title: "第二层 · 藏干 + 月令",
      titleEn: "Layer 2 · Hidden stems + month",
      logic: "地支里「藏」着的天干也算进来（主气 60%、中气 30%、余气 10%），月支是月令，分数翻倍。",
      logicEn: "Branches split into their hidden stems; the month branch counts double.",
      percent: toPercent(l2),
      events: l2Events,
    },
    {
      key: 3,
      title: "第三层 · 合化 + 冲克",
      titleEn: "Layer 3 · Combine + clash",
      logic: "相邻的天干五合、地支六合会把分数转给合化出来的五行；地支相冲会互相削弱。",
      logicEn: "Adjacent combinations move points to a new element; clashes weaken both sides.",
      percent: toPercent(l3),
      events: l3Events,
    },
  ];
}


/** Parse a typed date like 2000-01-01, 2000/1/1, 2000.1.1, 20000101, 2000年1月1日 → "YYYY-MM-DD" or null */
export function parseTypedDate(input: string): string | null {
  const t = input.trim().replace(/[\uFF10-\uFF19]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  let y: number, m: number, d: number;
  const compact = /^(\d{4})(\d{2})(\d{2})$/.exec(t);
  const split = /^(\d{4})\s*[-/.年\s]\s*(\d{1,2})\s*[-/.月\s]\s*(\d{1,2})\s*日?$/.exec(t);
  if (compact) [y, m, d] = [Number(compact[1]), Number(compact[2]), Number(compact[3])];
  else if (split) [y, m, d] = [Number(split[1]), Number(split[2]), Number(split[3])];
  else return null;
  if (y < 1900 || y > 2100) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Link that shows a finished match (inviter + friend) to anyone who opens it */
export function resultUrl(origin: string, inviter: Profile, friend: Profile) {
  const params = new URLSearchParams({ n: inviter.name, d: inviter.date });
  if (inviter.gender) params.set("g", inviter.gender);
  if (inviter.hour !== "") params.set("h", inviter.hour);
  params.set("fn", friend.name);
  params.set("fd", friend.date);
  if (friend.gender) params.set("fg", friend.gender);
  if (friend.hour !== "") params.set("fh", friend.hour);
  return `${origin}/match?${params.toString()}`;
}
