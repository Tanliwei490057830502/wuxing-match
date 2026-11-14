// 文案库 · Copy library
// Pre-written by AI (Claude) in advance and matched by Bazi rules — NOT generated live.
// Everything here is chosen deterministically: same person / pair / day → same text.
//
// Team: edit freely. Keep the shape (fields) the same so the site keeps working.

import type { Element } from "@/lib/bazi";

// ---------- 1. 日主人设卡 · Persona cards (index = stem 0..9: 甲..癸) ----------

export type Persona = {
  code: string; // MBTI-style code
  title: string; // 人设称号
  bars: [{ label: string; value: number }, { label: string; value: number }]; // 反差属性条
  souls: [string, string]; // 灵魂一击 (picked by day-branch parity)
  partner: number; // 最佳拍档日主 (天干五合)
  nemesis: number; // 天敌避雷日主 (七杀)
};

export const PERSONAS: Persona[] = [
  {
    code: "WOOD-JIA",
    title: "甲木 · 人间靠山型参天大树",
    bars: [
      { label: "表面稳重度", value: 88 },
      { label: "内心倔强度", value: 92 },
    ],
    souls: [
      "表面上什么都扛得住，其实只是不好意思说累。",
      "给别人建议头头是道，轮到自己就开始“再看看吧”。",
    ],
    partner: 5,
    nemesis: 6,
  },
  {
    code: "WOOD-YI",
    title: "乙木 · 社交变色龙",
    bars: [
      { label: "表面随和度", value: 90 },
      { label: "内心小算盘", value: 86 },
    ],
    souls: [
      "谁都聊得来，但真正的心里话只告诉 1.5 个人。",
      "看起来很佛，其实已经默默记住了每个人的生日和雷点。",
    ],
    partner: 6,
    nemesis: 7,
  },
  {
    code: "FIRE-BING",
    title: "丙火 · 人形充电宝",
    bars: [
      { label: "表面热情度", value: 95 },
      { label: "内心求夸度", value: 88 },
    ],
    souls: [
      "群里最先回复的是你，最后一个睡的也是你。",
      "热情到让人害怕，三分钟就能跟陌生人约好下次一起去吃 mamak。",
    ],
    partner: 7,
    nemesis: 8,
  },
  {
    code: "FIRE-DING",
    title: "丁火 · 深夜暖心电台",
    bars: [
      { label: "表面温柔度", value: 87 },
      { label: "内心戏丰富度", value: 93 },
    ],
    souls: [
      "别人一句“没事”，你能脑补出三集连续剧。",
      "朋友难过你第一个发现，自己难过却只会发一张没配字的夕阳。",
    ],
    partner: 8,
    nemesis: 9,
  },
  {
    code: "EARTH-WU",
    title: "戊土 · 情绪稳定天花板",
    bars: [
      { label: "表面淡定度", value: 94 },
      { label: "内心焦虑度", value: 71 },
    ],
    souls: [
      "天塌下来你会先拍张照，然后说“问题不大”。",
      "看起来什么都无所谓，其实冰箱里的东西放哪都有规定。",
    ],
    partner: 9,
    nemesis: 0,
  },
  {
    code: "EARTH-JI",
    title: "己土 · 宿舍老妈子",
    bars: [
      { label: "表面好说话", value: 91 },
      { label: "内心记账本", value: 84 },
    ],
    souls: [
      "嘴上说“随便”，心里早就有标准答案了。",
      "帮全宿舍带饭，结果忘了买自己的。",
    ],
    partner: 0,
    nemesis: 1,
  },
  {
    code: "METAL-GENG",
    title: "庚金 · 人间清醒人形兵器",
    bars: [
      { label: "表面高冷度", value: 90 },
      { label: "内心戏丰富度", value: 85 },
    ],
    souls: [
      "嘴硬心软第一名，表面上对谁都无所谓，背地里连明年的退路都想好了。",
      "说话像刀，做事像尺，唯一的弱点是路边的小猫。",
    ],
    partner: 1,
    nemesis: 2,
  },
  {
    code: "METAL-XIN",
    title: "辛金 · 精致完美主义者",
    bars: [
      { label: "表面精致度", value: 93 },
      { label: "内心玻璃心", value: 80 },
    ],
    souls: [
      "可以接受作业迟交，不能接受 PPT 字体不统一。",
      "外表是限量版，内心是易碎品，请轻拿轻放。",
    ],
    partner: 2,
    nemesis: 3,
  },
  {
    code: "WATER-REN",
    title: "壬水 · 脑洞永动机",
    bars: [
      { label: "表面自由度", value: 92 },
      { label: "内心计划度", value: 58 },
    ],
    souls: [
      "一天有八百个新点子，真正执行的是第八百零一个。",
      "说走就走的是你，走到一半问“我们要去哪”的也是你。",
    ],
    partner: 3,
    nemesis: 4,
  },
  {
    code: "WATER-GUI",
    title: "癸水 · 人形读心雷达",
    bars: [
      { label: "表面安静度", value: 85 },
      { label: "内心弹幕量", value: 95 },
    ],
    souls: [
      "表面在发呆，其实已经把全场每个人的关系图谱分析完了。",
      "最会安慰别人，自己 emo 时只会把同一首歌循环 50 遍。",
    ],
    partner: 4,
    nemesis: 5,
  },
];

// ---------- 2. 合盘报告 · Pair report (by the two day-master ELEMENTS) ----------

export type PairCopy = {
  tag: string; // 关系定位标签
  teaser: string; // 解锁前的悬念预览
  roast: string; // 毒舌锐评模式
  heart: string; // 走心模式
};

const pairKey = (a: Element, b: Element) => [a, b].sort().join("+");

const PAIRS: Record<string, PairCopy> = {
  // same element
  [pairKey("wood", "wood")]: {
    tag: "互相催更的学习搭子",
    teaser: "两棵树站在一起，到底谁先开花？",
    roast: "两棵树站一起，谁也不让谁先开花。一起做 Group Assignment，最后会出现两个版本的 final draft。",
    heart: "你们价值观很接近，适合一起定长期目标。分工时先说好谁拍板，避免两个人都在等对方点头。",
  },
  [pairKey("fire", "fire")]: {
    tag: "一点就着的烟花双人组",
    teaser: "两团火凑在一起，是烟花还是火灾？",
    roast: "两个都想当主角，聊天三分钟能吵五个话题，吵完又一起去吃火锅。建议火锅店直接给你们办会员。",
    heart: "你们能量都很高，一起做事效率爆表。记得轮流当“降温的那一个”，不要同时上头。",
  },
  [pairKey("earth", "earth")]: {
    tag: "沙发上的稳重二人组",
    teaser: "两座山放在一起，会不会一动也不动？",
    roast: "两个人约饭从“都可以”讨论到餐厅打烊，最后决定回宿舍吃泡面。",
    heart: "你们是彼此最安心的存在。偶尔逼自己跳出舒适圈，一起试一件新鲜事，感情会更有火花。",
  },
  [pairKey("metal", "metal")]: {
    tag: "人形双刃剑组合",
    teaser: "两把刀放在一起，谁先收鞘？",
    roast: "两个人都觉得自己是对的，所以吵架从来不会结束，只会中场休息。",
    heart: "你们都讲原则、讲效率。合作前先对齐标准，就能变成最可靠的执行团队。",
  },
  [pairKey("water", "water")]: {
    tag: "脑洞宇宙双人电台",
    teaser: "两片海洋相遇，会不会淹掉所有 deadline？",
    roast: "一起开会两小时，产出了十个新点子和零个结论。",
    heart: "你们特别懂彼此的情绪。做决定时约好一个收尾时间，灵感才能真正落地。",
  },
  // generating 相生
  [pairKey("wood", "fire")]: {
    tag: "点火助燃好拍档",
    teaser: "一个负责点子，一个负责点火……",
    roast: "木负责出点子，火负责到处宣传，结果点子还没想完，火已经在 IG 发了预告。",
    heart: "木给火方向，火给木动力，是最适合一起做项目的组合。火要记得别把木烧干，给对方喘息的空间。",
  },
  [pairKey("fire", "earth")]: {
    tag: "热情冲锋 + 人形保险",
    teaser: "一个负责冲，一个负责……收拾残局？",
    roast: "火每天都在冲，土每天都在帮火收拾残局，堪称人形保险公司。",
    heart: "火带来热情，土把热情变成成果。土也要学会说“不”，不要一直默默善后。",
  },
  [pairKey("earth", "metal")]: {
    tag: "搞钱绝配",
    teaser: "这个组合，钱包会越来越鼓……",
    roast: "一个会存钱一个会算账，出去吃 mamak 都要 AA 到小数点后两位。",
    heart: "土稳住大局，金精准执行，是理财和做生意的最佳组合。偶尔也一起乱花一次钱，人生才有乐趣。",
  },
  [pairKey("metal", "water")]: {
    tag: "智商在线的军师联盟",
    teaser: "一个写计划，一个……不看计划？",
    roast: "金说“按计划来”，水说“计划是什么”，最后金一个人写了 Plan A 到 Plan F。",
    heart: "金的逻辑配上水的灵感，适合一起做需要创意又要细节的事。金多一点耐心，水多一点交代。",
  },
  [pairKey("water", "wood")]: {
    tag: "温柔浇灌系",
    teaser: "一个默默付出，另一个……知道吗？",
    roast: "水一直默默照顾木，木一直以为自己是自然长大的。",
    heart: "水给木滋养，木给水方向，非常适合长期相处。木要记得说谢谢，水也要说出自己的需要。",
  },
  // controlling 相克
  [pairKey("wood", "earth")]: {
    tag: "欢喜冤家",
    teaser: "一个想改变世界，一个只想……",
    roast: "木想改变世界，土只想改变今天的午餐，讨论半天，世界和午餐都没改变。",
    heart: "木会推着土前进，土会让木脚踏实地。起冲突时先听完对方，再决定。",
  },
  [pairKey("earth", "water")]: {
    tag: "塑料饭搭子",
    teaser: "约好的饭局，真的会准时开始吗？",
    roast: "土想定规矩，水想随心所欲，约好的饭局总是在最后一刻改地点。",
    heart: "土给水安全感，水让土更灵活。把“弹性”写进计划里，就不会互相嫌弃。",
  },
  [pairKey("water", "fire")]: {
    tag: "冰火两重天",
    teaser: "一个一点就着，一个冷静到……",
    roast: "一个火气太旺一点就着，一个冷静到像在看纪录片。建议只一起吃火锅，千万别一起做 Group Assignment！",
    heart: "火让水更有行动力，水让火冷静下来。吵架时约定先冷静 10 分钟再谈。",
  },
  [pairKey("fire", "metal")]: {
    tag: "互相淬炼的对手",
    teaser: "嫌弃对方，却总在关键时刻……",
    roast: "火觉得金太冷，金觉得火太吵，但每次 deadline 前熬夜救场的，都是这两个人。",
    heart: "火能融化金的冷硬，金能给火的热情一个形状。欣赏彼此的不同，就是最强组合。",
  },
  [pairKey("metal", "wood")]: {
    tag: "砍树式友情",
    teaser: "聊天的时候，好像有人在挥刀……",
    roast: "金说话太直，木又太倔，聊天像在砍树，一刀下去两个人都受伤。",
    heart: "金帮木修剪多余的枝叶，木让金学会温柔。批评对方之前，先说一句好话。",
  },
};

export function pairCopy(a: Element, b: Element): PairCopy {
  return PAIRS[pairKey(a, b)];
}

// ---------- 3. 五行小队 · Squad diagnosis ----------

export const SQUAD_MISSING: Record<Element, { title: string; warning: string }> = {
  wood: {
    title: "全员没主见队",
    warning: "警告！本群缺少「木属性」，没人负责出主意和定方向，急需拉一位木属性朋友当方向盘！",
  },
  fire: {
    title: "全员佛系躺平队",
    warning: "警告！本群行动力严重不足，急需拉一位「火属性」朋友入伙点火！",
  },
  earth: {
    title: "全员漂泊无根队",
    warning: "警告！本群缺少「土属性」，没人管细节和后勤，急需一位土属性朋友当定海神针！",
  },
  metal: {
    title: "全员心软拖延队",
    warning: "警告！本群缺少「金属性」，没人敢拍板做决定，急需一位金属性朋友当执行官！",
  },
  water: {
    title: "全员脑袋打结队",
    warning: "警告！本群缺少「水属性」，大家想法都太死板，急需一位水属性朋友带来灵感！",
  },
};

export const SQUAD_MULTI_MISSING = {
  title: "五行残缺冒险队",
  warning: "警告！本群同时缺少好几种五行，赶快把链接丢进群里，拉人补齐！",
};

export const SQUAD_SAME = {
  title: "复制粘贴小分队",
  warning: "你们的日主全都是同一种五行！想法太像容易一起钻牛角尖，急需不同属性的朋友加入。",
};

export const SQUAD_COMPLETE = {
  title: "五行圆满 · 天选创业天团",
  message: "隐藏金卡已解锁！五行齐全，每个人都有自己的位置。以下是专属团队分工建议：",
};

/** Team role by a member's day-master element */
export const SQUAD_ROLES: Record<Element, { role: string; why: string }> = {
  fire: { role: "👑 Leader / 气氛担当", why: "火属性最有感染力，适合站在前面带大家冲。" },
  wood: { role: "🧭 策划 / 方向盘", why: "木属性擅长定目标、想长远，适合规划路线。" },
  earth: { role: "🛡️ 后勤 / 定海神针", why: "土属性稳重可靠，适合管进度、照顾大家。" },
  metal: { role: "💰 管钱 / 执行官", why: "金属性精准果断，适合管预算、盯 deadline。" },
  water: { role: "💡 创意 / 军师", why: "水属性脑洞最大，适合出点子、想策略。" },
};

// ---------- 4. 每日宜忌 · Daily do's & don'ts (by today's 十神 category) ----------

export type GodKey = "peer" | "resource" | "output" | "wealth" | "officer";

export const DAILY_YIJI: Record<GodKey, { yi: string[]; ji: string[] }> = {
  peer: {
    yi: ["约同学一起去图书馆", "组队做 Group Assignment", "跟朋友分享好吃的店", "参加社团活动"],
    ji: ["冲动消费买同款", "跟朋友抢风头", "借钱给别人", "在群里吵架"],
  },
  resource: {
    yi: ["找导师套近乎", "早点睡觉补眠", "复习上周的笔记", "看一本闲书"],
    ji: ["熬夜改代码", "什么都依赖别人", "一整天躺平滑手机", "拖延回 email"],
  },
  output: {
    yi: ["做 presentation", "发 IG / 小红书", "写报告、做设计", "勇敢表达意见"],
    ji: ["说话太直伤人", "在课堂上顶撞老师", "深夜发长文", "答应太多事情"],
  },
  wealth: {
    yi: ["整理记账本", "找兼职、谈价钱", "去超市补货", "规划这个月的预算"],
    ji: ["贪小便宜", "网购清空购物车", "跟朋友算太清楚", "借钱买奢侈品"],
  },
  officer: {
    yi: ["喝冰美式提神", "按时交作业", "整理房间和桌面", "跟上司/老师确认需求"],
    ji: ["正面顶撞上司", "迟到", "考试前临时抱佛脚", "情绪化做决定"],
  },
};

// ---------- 5. 赛博解压小玩具 · Daily toy ----------

export const DAILY_TOYS = {
  ice: {
    name: "赛博降温冰块",
    reason: "今日火气偏旺，容易暴躁。",
    hint: "狂点屏幕，把冰块敲碎！",
    done: "暴躁值 -10，冷静 +1 ❄️",
    taps: 12,
  },
  fish: {
    name: "赛博招财木鱼",
    reason: "今日财运偏弱，容易破财。",
    hint: "敲 10 下木鱼，为钱包充能！",
    done: "功德 +1，财气已充能 💰",
    taps: 10,
  },
} as const;
