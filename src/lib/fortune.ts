// 每日运势 — fixed for the same person on the same day (no randomness).
// Based on how today's day pillar relates to your chart (simplified 十神 + 冲合).

import {
  BRANCHES,
  ELEMENTS,
  ELEMENT_INFO,
  ELEMENT_TRAIT,
  STEMS,
  STEM_ELEMENT,
  computeChart,
  type Chart,
  type Element,
} from "@/lib/bazi";

const ZODIAC = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
const ZODIAC_EN = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
const ZODIAC_EMOJI = ["🐭", "🐮", "🐯", "🐰", "🐲", "🐍", "🐴", "🐑", "🐵", "🐔", "🐶", "🐷"];

// 六合 partner of each branch
const LIU_HE = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
// 天乙贵人 by day stem
const TIAN_YI: number[][] = [
  [1, 7], // 甲 丑未
  [0, 8], // 乙 子申
  [11, 9], // 丙 亥酉
  [11, 9], // 丁 亥酉
  [1, 7], // 戊 丑未
  [0, 8], // 己 子申
  [1, 7], // 庚 丑未
  [2, 6], // 辛 寅午
  [3, 5], // 壬 卯巳
  [3, 5], // 癸 卯巳
];
// 河图 numbers
const NUMBERS: Record<Element, [number, number]> = {
  water: [1, 6],
  fire: [2, 7],
  wood: [3, 8],
  metal: [4, 9],
  earth: [5, 10],
};

type God = "peer" | "resource" | "output" | "wealth" | "officer";

const GOD_TEXT: Record<
  God,
  { name: string; en: string; stars: number; zh: string; enText: string; caution: string; cautionEn: string }
> = {
  peer: {
    name: "比劫日",
    en: "Peer day",
    stars: 3,
    zh: "朋友运旺，适合一起做事、找人合作。",
    enText: "Friends are on your side — team up today.",
    caution: "容易冲动消费，也小心跟朋友抢风头。",
    cautionEn: "Watch impulse spending and ego clashes with friends.",
  },
  resource: {
    name: "印星日",
    en: "Support day",
    stars: 5,
    zh: "贵人运强，适合学习、请教、好好休息。",
    enText: "Helpers appear — great for learning and resting.",
    caution: "别太依赖别人，自己的事还是要动手。",
    cautionEn: "Don't lean on others too much.",
  },
  output: {
    name: "食伤日",
    en: "Creative day",
    stars: 4,
    zh: "灵感爆发，适合表达、创作、展示自己。",
    enText: "Ideas flow — express, create, show off.",
    caution: "说话太直容易得罪人，三思再开口。",
    cautionEn: "Think before you speak — bluntness backfires.",
  },
  wealth: {
    name: "财星日",
    en: "Money day",
    stars: 4,
    zh: "财运不错，适合处理钱、做计划、谈条件。",
    enText: "Good money luck — plan, budget, negotiate.",
    caution: "别为了小钱贪心，见好就收。",
    cautionEn: "Don't get greedy over small gains.",
  },
  officer: {
    name: "官杀日",
    en: "Pressure day",
    stars: 2,
    zh: "压力比较大，按规矩做事，适合处理正经事。",
    enText: "Some pressure — follow the rules and get serious work done.",
    caution: "避免跟老师、上司正面冲突，低调一点。",
    cautionEn: "Avoid clashing with bosses or teachers.",
  },
};

function godOf(me: Element, today: Element): God {
  const i = ELEMENTS.indexOf(me);
  const j = ELEMENTS.indexOf(today);
  const d = (j - i + 5) % 5;
  return (["peer", "output", "wealth", "officer", "resource"] as God[])[d];
}

export type DailyFortune = {
  date: string;
  todayPillar: string;
  god: (typeof GOD_TEXT)[God];
  stars: number;
  note: string | null; // clash / harmony note
  luckyElement: Element;
  luckyColor: string;
  luckyNumber: number;
  totem: { zh: string; en: string; emoji: string };
  benefactors: { zh: string; en: string; emoji: string }[];
  villain: { zh: string; en: string; emoji: string };
};

function zodiac(b: number) {
  return { zh: `属${ZODIAC[b]}`, en: ZODIAC_EN[b], emoji: ZODIAC_EMOJI[b] };
}

export function dailyFortune(chart: Chart, date: string): DailyFortune | null {
  const today = computeChart({ name: "", gender: "", date, hour: "" });
  if (!today) return null;
  const tp = today.pillars[2].pillar; // today's day pillar
  const myDay = chart.pillars[2].pillar;
  const me = chart.element;
  const todayEl = STEM_ELEMENT[tp.stem];
  const g = godOf(me, todayEl);
  const god = GOD_TEXT[g];

  let stars = god.stars;
  let note: string | null = null;
  if ((tp.branch - myDay.branch + 12) % 12 === 6) {
    stars -= 1;
    note = `今天「${BRANCHES[tp.branch]}」冲你的日支「${BRANCHES[myDay.branch]}」，计划容易变，多留后路。`;
  } else if (LIU_HE[myDay.branch] === tp.branch) {
    stars += 1;
    note = `今天「${BRANCHES[tp.branch]}」与你的日支「${BRANCHES[myDay.branch]}」六合，人缘特别好！`;
  }
  stars = Math.max(1, Math.min(5, stars));

  // Lucky element: if today strengthens you, release it (child); if it drains you, support (mother)
  const strengthens = g === "peer" || g === "resource";
  const idx = ELEMENTS.indexOf(me);
  const luckyElement = ELEMENTS[(idx + (strengthens ? 1 : 4)) % 5];
  const luckyNumber = NUMBERS[luckyElement][(tp.stem + tp.branch) % 2];

  return {
    date,
    todayPillar: STEMS[tp.stem] + BRANCHES[tp.branch],
    god,
    stars,
    note,
    luckyElement,
    luckyColor: ELEMENT_TRAIT[luckyElement].luckyColor,
    luckyNumber,
    totem: zodiac(LIU_HE[tp.branch]),
    benefactors: TIAN_YI[chart.dayMaster].map(zodiac),
    villain: zodiac((myDay.branch + 6) % 12),
  };
}

export { ELEMENT_INFO };
