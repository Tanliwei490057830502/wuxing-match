// 八宅 · 九宫格家居分析（方位那一条）
// 坐向 → 宅卦 → 每个方位的游年星 → 叠上「这间房适合吉位还是压凶位」→ 分数 + 双语解释。
// 全是查表，不调模型：同一组输入永远同一份结果，演示时不会翻车。
// 口径：传统八宅的说法，仅供娱乐；语气克制，不写「改运 / 化煞 / 招财」。

export type Gua = "坎" | "艮" | "震" | "巽" | "离" | "坤" | "兑" | "乾";

export type Star = "生气" | "天医" | "延年" | "伏位" | "祸害" | "六煞" | "五鬼" | "绝命";

/** 后天八卦的八个方位，按顺时针排（北 → 西北），游年歌就是顺着这个圈走的 */
export const GUAS: {
  gua: Gua;
  pinyin: string;
  dirZh: string;
  dirEn: string;
  deg: number;
  element: string;
  elementEn: string;
}[] = [
  { gua: "坎", pinyin: "Kan", dirZh: "北", dirEn: "North", deg: 0, element: "水", elementEn: "Water" },
  { gua: "艮", pinyin: "Gen", dirZh: "东北", dirEn: "Northeast", deg: 45, element: "土", elementEn: "Earth" },
  { gua: "震", pinyin: "Zhen", dirZh: "东", dirEn: "East", deg: 90, element: "木", elementEn: "Wood" },
  { gua: "巽", pinyin: "Xun", dirZh: "东南", dirEn: "Southeast", deg: 135, element: "木", elementEn: "Wood" },
  { gua: "离", pinyin: "Li", dirZh: "南", dirEn: "South", deg: 180, element: "火", elementEn: "Fire" },
  { gua: "坤", pinyin: "Kun", dirZh: "西南", dirEn: "Southwest", deg: 225, element: "土", elementEn: "Earth" },
  { gua: "兑", pinyin: "Dui", dirZh: "西", dirEn: "West", deg: 270, element: "金", elementEn: "Metal" },
  { gua: "乾", pinyin: "Qian", dirZh: "西北", dirEn: "Northwest", deg: 315, element: "金", elementEn: "Metal" },
];

// 大游年歌：每卦从自己（伏位）起，按顺时针把后面七方依次配星。
// 例：乾宅 → 坎六煞、艮天医、震五鬼、巽祸害、离绝命、坤延年、兑生气。
const VERSE: Record<Gua, string> = {
  乾: "六天五祸绝延生",
  坎: "五天生延绝祸六",
  艮: "六绝祸生延天五",
  震: "延生祸绝五天六",
  巽: "天五六祸生绝延",
  离: "六五绝延祸生天",
  坤: "天延绝生祸五六",
  兑: "生祸延绝六五天",
};

const STAR_CHAR: Record<string, Star> = {
  生: "生气",
  天: "天医",
  延: "延年",
  伏: "伏位",
  祸: "祸害",
  六: "六煞",
  五: "五鬼",
  绝: "绝命",
};

/** 宅卦 → 每个卦位的游年星 */
const TABLE: Record<Gua, Record<Gua, Star>> = (() => {
  const out = {} as Record<Gua, Record<Gua, Star>>;
  for (const house of GUAS.map((g) => g.gua)) {
    const start = GUAS.findIndex((g) => g.gua === house);
    const row = { [house]: "伏位" } as Record<Gua, Star>;
    for (let i = 1; i <= 7; i++) {
      const gua = GUAS[(start + i) % 8].gua;
      row[gua] = STAR_CHAR[VERSE[house][i - 1]];
    }
    out[house] = row;
  }
  return out;
})();

export type StarInfo = {
  star: Star;
  pinyin: string;
  en: string;
  grade: "great" | "good" | "mixed" | "bad";
  base: number;
  meaningZh: string;
  meaningEn: string;
};

export const STARS: Record<Star, StarInfo> = {
  生气: {
    star: "生气",
    pinyin: "Sheng Qi",
    en: "growth",
    grade: "great",
    base: 95,
    meaningZh: "八宅里最旺的一格，传统说法主机会、活力、财气。",
    meaningEn: "The liveliest corner in the old eight-house system: growth, energy, money coming in.",
  },
  天医: {
    star: "天医",
    pinyin: "Tian Yi",
    en: "health",
    grade: "great",
    base: 88,
    meaningZh: "传统上主健康、看病有贵人、身体恢复。",
    meaningEn: "The healing corner: health, recovery, and getting help when something is wrong.",
  },
  延年: {
    star: "延年",
    pinyin: "Yan Nian",
    en: "harmony",
    grade: "good",
    base: 84,
    meaningZh: "传统上主感情稳定、家人和睦、日子长久。",
    meaningEn: "The harmony corner: steady relationships and a calm household.",
  },
  伏位: {
    star: "伏位",
    pinyin: "Fu Wei",
    en: "stability",
    grade: "good",
    base: 76,
    meaningZh: "本卦所在的方位，主安稳、读书、慢慢积累。",
    meaningEn: "The steady corner: stability, study, slow and quiet progress.",
  },
  祸害: {
    star: "祸害",
    pinyin: "Huo Hai",
    en: "friction",
    grade: "mixed",
    base: 46,
    meaningZh: "传统上说容易有小摩擦、小病小痛、事情拖着。",
    meaningEn: "The friction corner: small arguments, small illnesses, things dragging on.",
  },
  六煞: {
    star: "六煞",
    pinyin: "Liu Sha",
    en: "distraction",
    grade: "mixed",
    base: 40,
    meaningZh: "传统上主是非、桃花纠纷、心神不宁。",
    meaningEn: "The distraction corner: gossip, messy feelings, trouble concentrating.",
  },
  五鬼: {
    star: "五鬼",
    pinyin: "Wu Gui",
    en: "conflict",
    grade: "bad",
    base: 34,
    meaningZh: "传统上主口舌、小人、火气大。",
    meaningEn: "The conflict corner: arguments, backbiting, short tempers.",
  },
  绝命: {
    star: "绝命",
    pinyin: "Jue Ming",
    en: "drain",
    grade: "bad",
    base: 26,
    meaningZh: "八宅里最弱的一格，传统上主耗损、睡不好。",
    meaningEn: "The weakest corner here: drained energy and poor sleep.",
  },
};

export type RoomKey = "door" | "bedroom" | "living" | "kitchen" | "study" | "dining" | "bath" | "balcony";

export type RoomInfo = {
  key: RoomKey;
  zh: string;
  en: string;
  emoji: string;
  /** 权重：大门决定整屋进气，算两份 */
  weight: number;
  /** 这间房要吉位（true）还是要压凶位（false） */
  wantsGood: boolean;
  whyZh: string;
  whyEn: string;
};

export const ROOMS: RoomInfo[] = [
  {
    key: "door",
    zh: "大门",
    en: "Front door",
    emoji: "🚪",
    weight: 2,
    wantsGood: true,
    whyZh: "大门是进气口，全家能量都从这里进来，所以最看重吉位。",
    whyEn: "The front door is where energy enters, so it matters most.",
  },
  {
    key: "bedroom",
    zh: "卧室",
    en: "Bedroom",
    emoji: "🛏️",
    weight: 1.5,
    wantsGood: true,
    whyZh: "卧室占掉人生三分之一，宜安稳，伏位、延年、天医最合适。",
    whyEn: "You spend a third of your life here, so calm corners work best.",
  },
  {
    key: "living",
    zh: "客厅",
    en: "Living room",
    emoji: "🛋️",
    weight: 1.2,
    wantsGood: true,
    whyZh: "客厅是待客和全家聚集的地方，旺一点没关系。",
    whyEn: "The shared room: a lively corner is fine here.",
  },
  {
    key: "kitchen",
    zh: "厨房",
    en: "Kitchen",
    emoji: "🍳",
    weight: 1,
    wantsGood: false,
    whyZh: "厨房属火，传统做法是「灶压凶方」，把火气放在弱位。",
    whyEn: "Kitchens are fire. The old rule is to put the stove on a weak corner.",
  },
  {
    key: "study",
    zh: "书房",
    en: "Study",
    emoji: "📚",
    weight: 1,
    wantsGood: true,
    whyZh: "书房要静要专注，生气、天医、伏位都合适。",
    whyEn: "A study needs focus, so lively or steady corners both work.",
  },
  {
    key: "dining",
    zh: "餐厅",
    en: "Dining area",
    emoji: "🍽️",
    weight: 1,
    wantsGood: true,
    whyZh: "餐厅一家人一起吃饭，宜和气，延年、天医最配。",
    whyEn: "Everyone eats together here, so harmony corners fit.",
  },
  {
    key: "bath",
    zh: "卫生间",
    en: "Bathroom",
    emoji: "🚿",
    weight: 1,
    wantsGood: false,
    whyZh: "卫生间是排污的地方，传统上压在凶位反而合适。",
    whyEn: "Bathrooms are for waste, so a weak corner is actually fine.",
  },
  {
    key: "balcony",
    zh: "阳台",
    en: "Balcony",
    emoji: "🌿",
    weight: 0.8,
    wantsGood: false,
    whyZh: "阳台主要看采光和通风，方位只算参考。",
    whyEn: "A balcony is mostly about light and air, so direction matters less.",
  },
];

export function roomInfo(key: RoomKey): RoomInfo {
  return ROOMS.find((r) => r.key === key) ?? ROOMS[0];
}

/** 度数落在哪个卦位（每卦 45°，坎从 337.5 起） */
export function guaOf(deg: number): Gua {
  const d = ((deg % 360) + 360) % 360;
  return GUAS[Math.round(d / 45) % 8].gua;
}

export function guaInfo(gua: Gua) {
  return GUAS.find((g) => g.gua === gua)!;
}

const EAST_HOUSES: Gua[] = ["坎", "离", "震", "巽"];

export type HouseInfo = {
  house: Gua;
  sitting: Gua;
  facing: Gua;
  groupZh: string;
  groupEn: string;
  lineZh: string;
  lineEn: string;
};

/** 直接给坐方卦位；给了 heading 就用真实度数判断向，没给就取正对的方位 */
export function houseFromSitting(sitting: Gua, headingDeg?: number): HouseInfo {
  const facing = headingDeg === undefined ? guaOf(guaInfo(sitting).deg + 180) : guaOf(headingDeg);
  const east = EAST_HOUSES.includes(sitting);
  return {
    house: sitting,
    sitting,
    facing,
    groupZh: east ? "东四宅" : "西四宅",
    groupEn: east ? "East-four house" : "West-four house",
    lineZh: `坐${guaInfo(sitting).dirZh}向${guaInfo(facing).dirZh} · ${sitting}宅`,
    lineEn: `Sits ${guaInfo(sitting).dirEn.toLowerCase()}, faces ${guaInfo(facing).dirEn.toLowerCase()} · ${guaInfo(sitting).pinyin} house`,
  };
}

/** heading = 手机对着大门的方向（向）；坐 = 反方向 */
export function houseOf(headingDeg: number): HouseInfo {
  return houseFromSitting(guaOf(headingDeg + 180), headingDeg);
}

export function starAt(house: Gua, dir: Gua): Star {
  return TABLE[house][dir];
}

export type RoomReading = {
  key: RoomKey;
  dir: Gua;
  dirZh: string;
  dirEn: string;
  star: Star;
  score: number;
  gradeZh: string;
  gradeEn: string;
  tone: "good" | "ok" | "pay-attention";
  textZh: string;
  textEn: string;
};

export type Analysis = {
  house: HouseInfo;
  rooms: RoomReading[];
  index: number;
  summaryZh: string;
  summaryEn: string;
};

function gradeOf(score: number) {
  if (score >= 90) return { gradeZh: "大吉", gradeEn: "Very good", tone: "good" as const };
  if (score >= 72) return { gradeZh: "吉利", gradeEn: "Good", tone: "good" as const };
  if (score >= 55) return { gradeZh: "平", gradeEn: "Neutral", tone: "ok" as const };
  if (score >= 40) return { gradeZh: "偏弱", gradeEn: "Weak", tone: "pay-attention" as const };
  return { gradeZh: "不理想", gradeEn: "Not ideal", tone: "pay-attention" as const };
}

/**
 * 分数 = 「这间房放在这里合不合适」，不是「这一格本身有多旺」。
 * 要吉位的房间（大门/卧室/客厅…）顺着星走；要压凶位的房间（厨房/厕所）反过来算。
 */
function scoreFor(room: RoomInfo, star: Star): number {
  const info = STARS[star];
  const good = info.grade === "great" || info.grade === "good";
  let fit = room.wantsGood ? info.base : 100 - info.base;

  if (room.key === "bedroom" && (star === "伏位" || star === "延年" || star === "天医")) fit += 5;
  else if (room.key === "study" && (star === "生气" || star === "天医" || star === "伏位")) fit += 5;
  else if (room.key === "living" && (star === "生气" || star === "延年" || star === "天医")) fit += 4;
  else if (room.key === "dining" && (star === "延年" || star === "天医")) fit += 4;
  else if (room.key === "balcony") fit = 60 + (fit - 60) * 0.5; // 阳台看采光，往中间收
  else if (room.key === "door" && good) fit += 3;

  return Math.max(10, Math.min(99, Math.round(fit)));
}

function roomText(room: RoomInfo, star: Star, score: number): { zh: string; en: string } {
  const info = STARS[star];
  const good = info.grade === "great" || info.grade === "good";
  const fits = room.wantsGood ? good : !good;

  const headZh = `${room.zh}落在${info.star}：${info.meaningZh}`;
  const headEn = `${room.en} sits on the ${info.pinyin} (${info.en}) corner. ${info.meaningEn}`;

  const fitZh = fits
    ? `这和${room.zh}该待的位置对得上——${room.whyZh}`
    : room.wantsGood
      ? `问题是${room.zh}该放在吉位，这一格偏弱，能挪就挪。`
      : `吉位放了${room.zh}，传统上不划算（火烧吉位、吉气被压住），但问题不大。`;

  const fitEn = fits
    ? `That fits: ${room.whyEn}`
    : room.wantsGood
      ? `A ${room.en.toLowerCase()} does better on a strong corner, so move it if you can.`
      : `A good corner spent on a ${room.en.toLowerCase()} — the old rules would rather keep it clear.`;

  const tailZh =
    score >= 82
      ? "保持干净、灯亮就行，不用动。"
      : score >= 60
        ? "不用大动：把杂物清掉、灯换亮点，感觉会差很多。"
        : "短期做法：少堆东西、常开窗、加一盏灯，别在这里久坐。";

  const tailEn =
    score >= 82
      ? "Nothing to fix. Keep it clean and well lit."
      : score >= 60
        ? "No big change: clear the clutter and brighten the light."
        : "For now: fewer things, open the window, add a lamp, and don't sit here too long.";

  return { zh: `${headZh}${fitZh}${tailZh}`, en: `${headEn} ${fitEn} ${tailEn}` };
}

export function analyze(house: HouseInfo, placed: { key: RoomKey; dir: Gua }[]): Analysis {
  const rooms: RoomReading[] = placed.map((p) => {
    const room = roomInfo(p.key);
    const star = starAt(house.house, p.dir);
    const score = scoreFor(room, star);
    const g = gradeOf(score);
    const t = roomText(room, star, score);
    const d = guaInfo(p.dir);
    return {
      key: p.key,
      dir: p.dir,
      dirZh: d.dirZh,
      dirEn: d.dirEn,
      star,
      score,
      gradeZh: g.gradeZh,
      gradeEn: g.gradeEn,
      tone: g.tone,
      textZh: t.zh,
      textEn: t.en,
    };
  });

  let sum = 0;
  let wsum = 0;
  for (const r of rooms) {
    const w = roomInfo(r.key).weight;
    sum += r.score * w;
    wsum += w;
  }
  const index = wsum ? Math.round(sum / wsum) : 0;

  const best = [...rooms].sort((a, b) => b.score - a.score)[0];
  const worst = [...rooms].sort((a, b) => a.score - b.score)[0];
  const bestZh = best ? `${best.dirZh}的${roomInfo(best.key).zh}（${best.star}）` : "";
  const worstZh = worst ? `${worst.dirZh}的${roomInfo(worst.key).zh}（${worst.star}）` : "";
  const bestEn = best ? `${roomInfo(best.key).en.toLowerCase()} on the ${STARS[best.star].pinyin} corner` : "";
  const worstEn = worst ? `${roomInfo(worst.key).en.toLowerCase()} on the ${STARS[worst.star].pinyin} corner` : "";

  const summaryZh =
    rooms.length === 0
      ? "还没放房间，先在九宫格里点几个。"
      : `${house.lineZh}，${house.groupZh}。整体居家指数 ${index}%，最好是${bestZh}${
          rooms.length > 1 ? `，最弱是${worstZh}` : ""
        }。`;
  const summaryEn =
    rooms.length === 0
      ? "No rooms placed yet. Tap a few cells in the grid."
      : `${house.lineEn}, ${house.groupEn}. Overall home index ${index}%; strongest is the ${bestEn}${
          rooms.length > 1 ? `, weakest is the ${worstEn}` : ""
        }.`;

  return { house, rooms, index, summaryZh, summaryEn };
}

/** 九宫格：上为「坐」，格子里放的是真实方位（坐向不同，标签跟着转） */
export const GRID_OFFSETS = [-45, 0, 45, -90, 0, 90, -135, 180, 135] as const;

/** 第 i 格对应的卦位（i=4 是中心，返回 null） */
export function cellGua(i: number, sitting: Gua): Gua | null {
  if (i === 4) return null;
  return guaOf(guaInfo(sitting).deg + GRID_OFFSETS[i]);
}
