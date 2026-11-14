// 五格剖象法 · Five-grid name analysis
// Uses Kangxi stroke counts (traditional forms, radicals in original form).
// 81 数理吉凶 follows the common traditional table; schools differ slightly.

import { ELEMENTS, ELEMENT_INFO, type Element } from "@/lib/bazi";
import { KANGXI_GROUPS, KANGXI_TRAD } from "@/lib/kangxiData";

// ---------- stroke lookup ----------

let strokeMap: Map<string, number> | null = null;
let tradMap: Map<string, string> | null = null;

function load() {
  if (strokeMap && tradMap) return;
  strokeMap = new Map();
  for (const group of KANGXI_GROUPS.split("|")) {
    const [n, chars] = group.split(":");
    for (const ch of Array.from(chars)) strokeMap.set(ch, Number(n));
  }
  tradMap = new Map();
  const pairs = Array.from(KANGXI_TRAD);
  for (let i = 0; i + 1 < pairs.length; i += 2) tradMap.set(pairs[i], pairs[i + 1]);
}

export type CharInfo = { ch: string; trad: string; strokes: number | null };

export function charInfo(ch: string): CharInfo {
  load();
  return { ch, trad: tradMap!.get(ch) ?? ch, strokes: strokeMap!.get(ch) ?? null };
}

// ---------- 81 数理 ----------

export type Luck = "吉" | "半吉" | "凶";

// [name, luck, meaning] for 1..81
const NUMS: [string, Luck, string][] = [
  ["太极之数", "吉", "万物开泰，大吉大利"],
  ["两仪之数", "凶", "混沌未开，进退两难"],
  ["三才之数", "吉", "名利双收，前途光明"],
  ["四象之数", "凶", "多波折，需加倍努力"],
  ["五行之数", "吉", "福寿双全，阴阳和合"],
  ["六爻之数", "吉", "家道兴隆，安稳有余"],
  ["七政之数", "吉", "刚毅果断，独立有成"],
  ["八卦之数", "吉", "意志坚定，努力发达"],
  ["大成之数", "凶", "怀才不遇，宜守不宜攻"],
  ["终结之数", "凶", "万事归空，起伏较大"],
  ["旱苗逢雨", "吉", "枯木逢春，渐入佳境"],
  ["掘井无泉", "凶", "力不从心，宜量力而行"],
  ["春日牡丹", "吉", "才艺多能，智谋出众"],
  ["破兆之数", "凶", "孤独劳心，需防挫折"],
  ["福寿之数", "吉", "福寿圆满，贵人相助"],
  ["厚重之数", "吉", "德高望重，众望所归"],
  ["刚强之数", "半吉", "意志刚强，宜刚柔并济"],
  ["铁镜重磨", "吉", "有志竟成，排除万难"],
  ["多难之数", "凶", "风云蔽月，辛苦重来"],
  ["屋下藏金", "凶", "非业破运，宜稳中求进"],
  ["明月中天", "吉", "光风霁月，独立权威"],
  ["秋草逢霜", "凶", "困难重重，需耐心坚持"],
  ["壮丽之数", "吉", "旭日东升，功名荣达"],
  ["掘藏得金", "吉", "家门余庆，白手成家"],
  ["荣俊之数", "吉", "资性英敏，才能出众"],
  ["变怪之数", "凶", "英雄多难，波澜起伏"],
  ["增长之数", "半吉", "先苦后甜，宜戒骄躁"],
  ["阔水浮萍", "凶", "漂泊不定，宜沉稳"],
  ["智谋之数", "吉", "智谋优秀，财力归集"],
  ["非运之数", "半吉", "沉浮不定，得失参半"],
  ["春日花开", "吉", "智勇得志，博得名利"],
  ["宝马金鞍", "吉", "侥幸多望，贵人得助"],
  ["旭日升天", "吉", "鸾凤相会，名闻天下"],
  ["破家之数", "凶", "见识短小，宜多学习"],
  ["高楼望月", "吉", "温和平静，智达通畅"],
  ["波澜重叠", "凶", "常陷困境，宜守本分"],
  ["猛虎出林", "吉", "权威显达，热诚忠信"],
  ["磨铁成针", "半吉", "意志坚定，宜学技艺"],
  ["富贵荣华", "吉", "财帛丰盈，暗藏险象需防"],
  ["退安之数", "半吉", "智谋胆力，宜谨慎守成"],
  ["有德之数", "吉", "纯阳独秀，德高望重"],
  ["寒蝉在柳", "凶", "博识多能，精通世情却难专一"],
  ["散财之数", "凶", "外祥内苦，宜守财"],
  ["烦闷之数", "凶", "破家亡身，需防暗礁"],
  ["顺风之数", "吉", "新生泰和，顺风扬帆"],
  ["浪里淘金", "凶", "载宝沉舟，需耐心"],
  ["点石成金", "吉", "花开之象，万事如意"],
  ["古松立鹤", "吉", "智谋兼备，德量荣达"],
  ["转变之数", "半吉", "吉临则吉，凶来则凶"],
  ["小舟入海", "凶", "一成一败，宜谨慎"],
  ["沉浮之数", "半吉", "盛衰交加，宜守"],
  ["达眼之数", "吉", "卓识达眼，先见之明"],
  ["曲卷难星", "凶", "外祥内患，宜务实"],
  ["石上栽花", "凶", "多难悲运，宜坚忍"],
  ["善恶之数", "半吉", "吉凶参半，宜修身"],
  ["浪里行舟", "凶", "历尽艰辛，宜忍耐"],
  ["日照春松", "吉", "寒雪青松，终得发达"],
  ["晚行遇月", "半吉", "沉浮多端，先苦后甜"],
  ["寒蝉悲风", "凶", "意志薄弱，宜立定志向"],
  ["无谋之数", "凶", "争名夺利，宜三思"],
  ["牡丹芙蓉", "吉", "名利双收，繁荣富贵"],
  ["衰败之数", "凶", "内外不和，宜修养"],
  ["舟出平海", "吉", "万物化育，繁荣之象"],
  ["非命之数", "凶", "骨肉分离，宜珍惜身边人"],
  ["巨流归海", "吉", "天长地久，家运隆昌"],
  ["岩头步马", "凶", "进退维谷，宜谨慎"],
  ["顺风通达", "吉", "天赋幸运，四通八达"],
  ["顺风吹帆", "吉", "智虑周密，集众信达"],
  ["非业之数", "凶", "非业非力，宜稳"],
  ["残菊逢霜", "凶", "寂寞无碍，宜积极"],
  ["石上金花", "半吉", "石上金花，内心劳苦"],
  ["劳苦之数", "凶", "荣苦相伴，宜坚持"],
  ["无勇之数", "半吉", "盛衰交加，徒有高志"],
  ["残菊经霜", "凶", "无能无智，宜学习"],
  ["退守之数", "半吉", "发迹甚迟，宜守成"],
  ["离散之数", "凶", "倾覆离散，宜团结"],
  ["半吉之数", "半吉", "家庭有悦，半吉半凶"],
  ["晚苦之数", "凶", "祸福参半，先天智能"],
  ["云头望月", "凶", "身疲力尽，宜休养"],
  ["遁吉之数", "凶", "辛苦不绝，早入隐遁"],
  ["万物回春", "吉", "最吉之数，还本归元"],
];

export function numberInfo(n: number) {
  const k = n > 81 ? ((n - 1) % 80) + 1 : Math.max(1, n);
  const [name, luck, meaning] = NUMS[k - 1];
  return { n, name, luck, meaning };
}

/** 1,2 木 · 3,4 火 · 5,6 土 · 7,8 金 · 9,0 水 */
export function numberElement(n: number): Element {
  const d = n % 10;
  if (d === 1 || d === 2) return "wood";
  if (d === 3 || d === 4) return "fire";
  if (d === 5 || d === 6) return "earth";
  if (d === 7 || d === 8) return "metal";
  return "water";
}

// ---------- 五格 ----------

export type GridKey = "tian" | "ren" | "di" | "wai" | "zong";

export const GRID_INFO: Record<GridKey, { zh: string; en: string; about: string; weight: number }> = {
  tian: { zh: "天格", en: "Heaven", about: "祖先留下来的，跟姓有关，对运势影响小", weight: 0 },
  ren: { zh: "人格", en: "Person", about: "主运，代表性格和一生的核心", weight: 35 },
  di: { zh: "地格", en: "Earth", about: "前运，影响童年到青年", weight: 20 },
  wai: { zh: "外格", en: "Outer", about: "副运，人际关系和外在环境", weight: 15 },
  zong: { zh: "总格", en: "Total", about: "后运，影响中年以后", weight: 30 },
};

export type Wuge = Record<GridKey, number>;

/** surname: 1–2 stroke counts, given: 1–2 stroke counts */
export function computeWuge(surname: number[], given: number[]): Wuge {
  const s = surname;
  const g = given;
  const total = [...s, ...g].reduce((a, b) => a + b, 0);
  const tian = s.length === 1 ? s[0] + 1 : s[0] + s[1];
  const ren = s[s.length - 1] + g[0];
  const di = g.length === 1 ? g[0] + 1 : g[0] + g[1];
  let wai: number;
  if (s.length === 1 && g.length === 1) wai = 2;
  else if (s.length === 1) wai = g[g.length - 1] + 1;
  else if (g.length === 1) wai = s[0] + 1;
  else wai = s[0] + g[g.length - 1];
  return { tian, ren, di, wai, zong: total };
}

// ---------- 三才 ----------

function relation(a: Element, b: Element): "生" | "克" | "同" | "被生" | "被克" {
  if (a === b) return "同";
  const i = ELEMENTS.indexOf(a);
  const j = ELEMENTS.indexOf(b);
  if ((i + 1) % 5 === j) return "生";
  if ((j + 1) % 5 === i) return "被生";
  if ((i + 2) % 5 === j) return "克";
  return "被克";
}

export function sancai(w: Wuge) {
  const t = numberElement(w.tian);
  const r = numberElement(w.ren);
  const d = numberElement(w.di);
  const rel = (x: ReturnType<typeof relation>) => (x === "生" || x === "被生" ? 1 : x === "同" ? 0.5 : 0);
  const a = relation(t, r);
  const b = relation(r, d);
  const score = rel(a) + rel(b); // 0..2
  const luck: Luck = score >= 1.5 ? "吉" : score >= 1 ? "半吉" : "凶";
  const word = (x: ReturnType<typeof relation>) =>
    ({ 生: "相生", 被生: "相生", 同: "比和", 克: "相克", 被克: "相克" })[x];
  return {
    elements: [t, r, d] as [Element, Element, Element],
    label: `${ELEMENT_INFO[t].zh}${ELEMENT_INFO[r].zh}${ELEMENT_INFO[d].zh}`,
    luck,
    text: `天格与人格${word(a)}，人格与地格${word(b)}。`,
    score,
  };
}

// ---------- overall ----------

const LUCK_POINTS: Record<Luck, number> = { 吉: 100, 半吉: 65, 凶: 30 };

export function nameScore(w: Wuge) {
  const keys: GridKey[] = ["ren", "di", "wai", "zong"];
  const gridPart = keys.reduce((sum, k) => sum + (LUCK_POINTS[numberInfo(w[k]).luck] * GRID_INFO[k].weight) / 100, 0);
  // grids are 85% of the score, 三才 15%
  const sc = sancai(w);
  return Math.round(gridPart * 0.85 + (sc.score / 2) * 15);
}

export const COMPOUND_SURNAMES = [
  "欧阳", "司马", "上官", "诸葛", "东方", "皇甫", "尉迟", "公孙", "慕容", "长孙", "宇文", "司徒", "夏侯",
  "轩辕", "令狐", "端木", "独孤", "南宫", "西门", "百里", "呼延", "闻人", "东郭", "申屠", "太史",
  "公羊", "澹台", "公冶", "宗政", "濮阳", "淳于", "单于", "仲孙", "赫连", "鲜于",
];
