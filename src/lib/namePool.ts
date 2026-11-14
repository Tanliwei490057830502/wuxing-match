// 取名用字库 + 推荐算法 · Name-character pool & generator
// Element is judged by radical / meaning (one common convention — schools differ).
// gender: m = 偏男, f = 偏女, n = 中性

import { readChart, type Chart, type Element } from "@/lib/bazi";
import { charInfo, computeWuge, nameScore, numberElement, numberInfo, sancai } from "@/lib/wuge";

type G = "m" | "f" | "n";
export type PoolChar = { ch: string; el: Element; g: G; mean: string };

const RAW: [string, Element, G, string][] = [
  // 木
  ["林", "wood", "n", "树林，生机勃勃"], ["森", "wood", "n", "森林，繁盛"], ["楠", "wood", "n", "楠木，坚实珍贵"],
  ["柏", "wood", "m", "松柏，坚贞长青"], ["松", "wood", "m", "青松，坚毅挺拔"], ["梓", "wood", "n", "梓树，故乡与栋梁"],
  ["杰", "wood", "m", "才能出众的人"], ["栋", "wood", "m", "栋梁之才"], ["楷", "wood", "m", "楷模，典范"],
  ["荣", "wood", "n", "繁荣，光荣"], ["芳", "wood", "f", "芬芳美好"], ["芸", "wood", "f", "芸香，书香气"],
  ["茜", "wood", "f", "茜草，鲜艳动人"], ["萱", "wood", "f", "萱草，忘忧"], ["若", "wood", "n", "杜若香草，温润"],
  ["芷", "wood", "f", "白芷，高洁"], ["蓉", "wood", "f", "芙蓉，清丽"], ["菲", "wood", "f", "花草芳香"],
  ["薇", "wood", "f", "蔷薇，坚韧美丽"], ["彬", "wood", "m", "文质彬彬"], ["东", "wood", "n", "东方，朝气"],
  ["桐", "wood", "n", "梧桐，引凤栖"], ["梅", "wood", "f", "梅花，傲雪"], ["朵", "wood", "f", "花朵，可爱"],
  // 火
  ["明", "fire", "n", "光明磊落"], ["晓", "fire", "n", "破晓，通达事理"], ["晨", "fire", "n", "清晨，朝气蓬勃"],
  ["昊", "fire", "m", "广阔的天空"], ["昕", "fire", "n", "太阳将出，黎明"], ["晴", "fire", "f", "晴朗明媚"],
  ["煜", "fire", "m", "照耀，光辉"], ["熙", "fire", "n", "光明，和乐"], ["阳", "fire", "m", "阳光，开朗"],
  ["彤", "fire", "f", "红色，热情"], ["晗", "fire", "f", "天将明，温和"], ["旭", "fire", "m", "旭日东升"],
  ["晖", "fire", "n", "阳光的光辉"], ["耀", "fire", "m", "光耀，荣耀"], ["炜", "fire", "m", "光明，盛大"],
  ["灿", "fire", "n", "灿烂，光彩"], ["昭", "fire", "n", "光明显著"], ["晶", "fire", "f", "晶莹剔透"],
  ["暖", "fire", "f", "温暖"], ["炫", "fire", "m", "光彩夺目"], ["丹", "fire", "f", "赤诚之心"],
  // 土
  ["坤", "earth", "m", "大地，厚德载物"], ["城", "earth", "m", "城池，稳固"], ["培", "earth", "m", "培育，栽培"],
  ["均", "earth", "n", "公平均衡"], ["坚", "earth", "m", "坚定不移"], ["峰", "earth", "m", "山峰，登高"],
  ["岩", "earth", "m", "岩石，稳重"], ["嵩", "earth", "m", "嵩山，高大"], ["岚", "earth", "f", "山间雾气，灵秀"],
  ["安", "earth", "n", "平安，安宁"], ["宇", "earth", "n", "宇宙，胸怀广阔"], ["宁", "earth", "n", "安宁，平静"],
  ["佳", "earth", "n", "美好，优秀"], ["恩", "earth", "n", "恩情，感恩"], ["怡", "earth", "f", "和悦，愉快"],
  ["悦", "earth", "f", "喜悦"], ["远", "earth", "m", "志向远大"], ["航", "earth", "m", "远航，前进"],
  ["辰", "earth", "n", "星辰，时光"], ["尧", "earth", "m", "尧帝，崇高"],
  // 金
  ["铭", "metal", "m", "铭记，铭刻于心"], ["锋", "metal", "m", "锋芒，锐意进取"], ["钰", "metal", "n", "珍宝"],
  ["鑫", "metal", "m", "财富兴盛"], ["锦", "metal", "n", "锦绣前程"], ["钧", "metal", "m", "千钧之力，尊贵"],
  ["瑞", "metal", "n", "吉祥如意"], ["琪", "metal", "f", "美玉"], ["珊", "metal", "f", "珊瑚，珍贵"],
  ["瑶", "metal", "f", "美玉，美好"], ["琳", "metal", "f", "美玉"], ["玲", "metal", "f", "玉声清脆，灵巧"],
  ["璇", "metal", "f", "美玉，星名"], ["瑾", "metal", "f", "美玉，美德"], ["诗", "metal", "f", "诗意，有才华"],
  ["信", "metal", "m", "诚信"], ["新", "metal", "n", "日新月异"], ["思", "metal", "n", "深思，有思想"],
  ["然", "metal", "n", "自然，坦然"], ["书", "metal", "n", "书香，博学"], ["诚", "metal", "m", "真诚"],
  ["成", "metal", "m", "成功，成就"], ["睿", "metal", "n", "睿智，通达"],
  // 水
  ["涵", "water", "n", "涵养，包容"], ["泽", "water", "m", "恩泽，润泽"], ["浩", "water", "m", "浩大，胸怀宽广"],
  ["洋", "water", "m", "海洋，宽广"], ["清", "water", "n", "清澈，清白"], ["沐", "water", "n", "沐浴恩泽"],
  ["润", "water", "n", "滋润，温润"], ["雨", "water", "f", "雨露，滋养"], ["雪", "water", "f", "白雪，纯洁"],
  ["霖", "water", "m", "甘霖，及时雨"], ["霏", "water", "f", "雨雪纷飞"], ["泉", "water", "n", "泉水，源源不绝"],
  ["涛", "water", "m", "波涛，气势"], ["源", "water", "m", "源头，根本"], ["渊", "water", "m", "学识渊博"],
  ["海", "water", "m", "大海，包容"], ["沁", "water", "f", "沁人心脾"], ["溪", "water", "f", "小溪，清灵"],
  ["汐", "water", "f", "晚潮，温柔"], ["凝", "water", "f", "凝聚，专注"], ["淳", "water", "n", "淳朴"],
  ["瀚", "water", "m", "浩瀚，博大"], ["冰", "water", "f", "冰清玉洁"], ["子", "water", "n", "君子，温文尔雅"],
];

export const POOL: PoolChar[] = RAW.map(([ch, el, g, mean]) => ({ ch, el, g, mean }));

// 常用好听的双字名 · curated two-character given names: [name, gender, meaning]
const NAMES2: [string, G, string][] = [
  // 偏女
  ["子涵", "f", "有涵养的君子"], ["思涵", "f", "思虑周全，有涵养"], ["欣怡", "f", "欣喜愉快"], ["梓涵", "f", "如梓木般稳重有涵养"],
  ["诗涵", "f", "有诗意，有内涵"], ["雨萱", "f", "雨露滋养的萱草，无忧"], ["佳怡", "f", "美好而愉悦"], ["可馨", "f", "可爱温馨"],
  ["若曦", "f", "如晨光般明亮"], ["梦琪", "f", "美梦如玉"], ["雨桐", "f", "雨中梧桐，清雅"], ["欣妍", "f", "欣喜美丽"],
  ["思琪", "f", "聪慧如美玉"], ["静怡", "f", "安静愉悦"], ["晓晴", "f", "清晨晴朗"], ["心怡", "f", "心情愉快"],
  ["嘉怡", "f", "美好愉悦"], ["雅琪", "f", "高雅如玉"], ["诗琪", "f", "诗意美玉"], ["婉清", "f", "温婉清丽"],
  ["清妍", "f", "清秀美丽"], ["安琪", "f", "平安美好"], ["芷若", "f", "香草般高洁"], ["若汐", "f", "如潮汐般温柔"],
  ["沐晴", "f", "沐浴在晴光里"], ["晴雪", "f", "晴天白雪，纯净"], ["雨涵", "f", "雨露滋润，包容"], ["紫萱", "f", "紫色萱草，忘忧"],
  ["梓萱", "f", "梓木萱草，安康"], ["依诺", "f", "信守承诺"], ["语桐", "f", "梧桐低语，温柔"], ["书瑶", "f", "书香美玉"],
  ["诗瑶", "f", "诗意美玉"], ["佳琪", "f", "美好美玉"], ["晓雪", "f", "清晨白雪"], ["宁馨", "f", "安宁温馨"],
  ["欣然", "f", "愉快的样子"], ["悦然", "f", "喜悦自在"], ["映雪", "f", "雪光映照，勤学"], ["思妍", "f", "聪慧美丽"],
  ["雅静", "f", "高雅文静"], ["慧敏", "f", "聪慧敏捷"], ["芳菲", "f", "花草芬芳"], ["芸熙", "f", "书香光明"],
  ["若彤", "f", "热情明媚"], ["瑾瑜", "f", "美玉，美德"], ["沁怡", "f", "沁人心脾，愉悦"], ["凝雪", "f", "凝结的白雪，纯洁"],
  // 偏男
  ["浩然", "m", "浩然正气"], ["子轩", "m", "气宇轩昂的君子"], ["宇轩", "m", "胸怀宇宙，气宇轩昂"], ["梓睿", "m", "栋梁之材，睿智"],
  ["俊杰", "m", "才智出众的人"], ["浩宇", "m", "胸怀浩大"], ["子墨", "m", "文墨君子"], ["明轩", "m", "光明磊落，气宇轩昂"],
  ["博文", "m", "博学多才"], ["思远", "m", "志存高远"], ["泽宇", "m", "恩泽广阔"], ["一鸣", "m", "一鸣惊人"],
  ["文博", "m", "文采博学"], ["承泽", "m", "承受恩泽"], ["俊熙", "m", "英俊光明"], ["宇航", "m", "遨游宇宙"],
  ["子豪", "m", "豪迈君子"], ["志远", "m", "志向远大"], ["致远", "m", "宁静致远"], ["明哲", "m", "明智通达"],
  ["睿哲", "m", "睿智有哲思"], ["景行", "m", "品德高尚"], ["修远", "m", "路漫漫其修远"], ["正阳", "m", "正直阳光"],
  ["浩辰", "m", "浩瀚星辰"], ["昊天", "m", "广阔苍天"], ["晨阳", "m", "清晨的太阳"], ["瑞霖", "m", "吉祥甘霖"],
  ["沐阳", "m", "沐浴阳光"], ["嘉树", "m", "美好的树，栋梁"], ["泽楷", "m", "恩泽楷模"], ["宏宇", "m", "宏大的胸怀"],
  ["立诚", "m", "立身以诚"], ["子睿", "m", "睿智君子"], ["铭轩", "m", "铭记于心，气宇轩昂"], ["锦程", "m", "锦绣前程"],
  ["鹏飞", "m", "鹏程万里"], ["子谦", "m", "谦逊君子"], ["思齐", "m", "见贤思齐"], ["明远", "m", "目光远大"],
  ["启明", "m", "启明星，开创"], ["俊豪", "m", "英俊豪迈"], ["浩轩", "m", "浩大轩昂"], ["天佑", "m", "上天保佑"],
  ["皓轩", "m", "光明轩昂"], ["煜城", "m", "照耀之城"], ["博涛", "m", "博学，气势如涛"], ["宁远", "m", "宁静致远"],
  // 中性
  ["子安", "n", "平安君子"], ["一然", "n", "自然坦然"], ["若水", "n", "上善若水"], ["知行", "n", "知行合一"],
  ["清扬", "n", "清新飞扬"], ["安然", "n", "平安自在"], ["星辰", "n", "星辰大海"], ["思源", "n", "饮水思源"],
  ["宁安", "n", "安宁平安"], ["嘉禾", "n", "茁壮的禾苗，丰收"], ["云舒", "n", "云卷云舒，从容"], ["景明", "n", "春和景明"],
  ["亦辰", "n", "如星辰"], ["予安", "n", "给予平安"], ["沐辰", "n", "沐浴星光"], ["乐知", "n", "乐于求知"],
];

export const NAMES_2: { given: string; g: G; mean: string }[] = NAMES2.map(([given, g, mean]) => ({ given, g, mean }));

const POOL_BY_CHAR = new Map(POOL.map((p) => [p.ch, p]));
export function asPoolChar(ch: string): PoolChar {
  return POOL_BY_CHAR.get(ch) ?? { ch, el: "earth", g: "n", mean: "" };
}

// ---------- generator ----------

export type Gender = "m" | "f" | "any";
export type Length = 1 | 2 | "both";

export type Suggestion = {
  given: string;
  meaning: string;
  chars: PoolChar[];
  score: number;
  base: number;
  buyun: number | null;
  ren: number;
  di: number;
  zong: number;
  sancaiLabel: string;
};

function pool(gender: Gender) {
  if (gender === "any") return POOL;
  return POOL.filter((c) => c.g === "n" || c.g === gender);
}

export function buyunScore(w: ReturnType<typeof computeWuge>, chars: PoolChar[], chart: Chart) {
  const r = readChart(chart);
  let s = 0;
  if (numberElement(w.ren) === r.lucky) s += 40;
  if (numberElement(w.di) === r.lucky) s += 15;
  if (numberElement(w.zong) === r.lucky) s += 15;
  // the characters' own element (字五行) helping the chart
  for (const c of chars) {
    if (c.el === r.lucky) s += 15;
    else if (r.missing.includes(c.el)) s += 10;
  }
  return Math.min(100, s);
}

/** One scoring rule for both 取名 and 测算: 五格 score, plus 补运 (40%) when there is a birthday. */
export function scoreName(w: ReturnType<typeof computeWuge>, chars: PoolChar[], chart: Chart | null) {
  const base = nameScore(w);
  const buyun = chart ? buyunScore(w, chars, chart) : null;
  const score = buyun === null ? base : Math.round(base * 0.6 + buyun * 0.4);
  return { base, buyun, score };
}

/**
 * Suggest names for a surname. Deterministic: same inputs → same list.
 * Only keeps names whose 人格, 地格 and 总格 are all 吉 or 半吉.
 */
export function suggestNames(opts: {
  surname: string;
  gender: Gender;
  length: Length;
  chart: Chart | null;
  mustUse?: string; // 指定用字（字辈）
  limit?: number;
}): { list: Suggestion[]; surnameOk: boolean } {
  const s = Array.from(opts.surname);
  const sStrokes = s.map((ch) => charInfo(ch).strokes);
  if (!s.length || sStrokes.some((x) => !x)) return { list: [], surnameOk: false };
  const surnameStrokes = sStrokes as number[];

  const p = pool(opts.gender).filter((c) => !s.includes(c.ch));
  const must = opts.mustUse ? Array.from(opts.mustUse)[0] : "";
  const mustChar: PoolChar | null = must
    ? (POOL.find((c) => c.ch === must) ?? { ch: must, el: "earth", g: "n", mean: "指定用字" })
    : null;
  if (mustChar && !charInfo(mustChar.ch).strokes) return { list: [], surnameOk: true };

  const okGender = (g: G) => opts.gender === "any" || g === "n" || g === opts.gender;
  const combos: { chars: PoolChar[]; meaning: string }[] = [];
  if (mustChar) {
    // 字辈 can sit first or second; the other character comes from the pool
    if (opts.length !== 2) combos.push({ chars: [mustChar], meaning: mustChar.mean });
    if (opts.length !== 1)
      for (const b of p)
        if (b.ch !== mustChar.ch) {
          combos.push({ chars: [mustChar, b], meaning: `${b.ch}：${b.mean}` });
          combos.push({ chars: [b, mustChar], meaning: `${b.ch}：${b.mean}` });
        }
  } else {
    if (opts.length !== 2) for (const a of p) combos.push({ chars: [a], meaning: a.mean });
    if (opts.length !== 1)
      for (const n of NAMES_2)
        if (okGender(n.g) && !Array.from(n.given).some((c) => s.includes(c)))
          combos.push({ chars: Array.from(n.given).map(asPoolChar), meaning: n.mean });
  }

  const out: Suggestion[] = [];
  for (const { chars, meaning } of combos) {
    const strokes = chars.map((c) => charInfo(c.ch).strokes);
    if (strokes.some((x) => !x)) continue;
    const w = computeWuge(surnameStrokes, strokes as number[]);
    const ok = (n: number) => numberInfo(n).luck !== "凶";
    if (!ok(w.ren) || !ok(w.di) || !ok(w.zong)) continue;
    const { base, buyun: by, score } = scoreName(w, chars, opts.chart);
    out.push({
      given: chars.map((c) => c.ch).join(""),
      meaning,
      chars,
      score,
      base,
      buyun: by,
      ren: w.ren,
      di: w.di,
      zong: w.zong,
      sancaiLabel: sancai(w).label,
    });
  }

  // sort by score, then a stable tie-break by the name itself
  out.sort((a, b) => b.score - a.score || a.given.localeCompare(b.given, "zh"));

  // variety: each character at most twice in the final list
  const used = new Map<string, number>();
  const list: Suggestion[] = [];
  for (const sug of out) {
    if (list.length >= (opts.limit ?? 12)) break;
    const counts = sug.chars.filter((c) => c.ch !== mustChar?.ch).map((c) => used.get(c.ch) ?? 0);
    if (counts.some((n) => n >= 2)) continue;
    sug.chars.forEach((c) => used.set(c.ch, (used.get(c.ch) ?? 0) + 1));
    list.push(sug);
  }
  return { list, surnameOk: true };
}

