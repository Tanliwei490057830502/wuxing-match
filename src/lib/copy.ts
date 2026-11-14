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
  titleEn: string; // English persona title
  bars: [
    { label: string; labelEn: string; value: number },
    { label: string; labelEn: string; value: number },
  ]; // 反差属性条
  souls: [string, string]; // 灵魂一击 (picked by day-branch parity)
  soulsEn: [string, string]; // English soul lines
  partner: number; // 最佳拍档日主 (天干五合)
  nemesis: number; // 天敌避雷日主 (七杀)
};

export const PERSONAS: Persona[] = [
  {
    code: "WOOD-JIA",
    title: "甲木 · 人间靠山型参天大树",
    titleEn: "Jia Wood · The human mountain",
    bars: [
      { label: "表面稳重度", labelEn: "Surface steadiness", value: 88 },
      { label: "内心倔强度", labelEn: "Inner stubbornness", value: 92 },
    ],
    souls: [
      "表面上什么都扛得住，其实只是不好意思说累。",
      "给别人建议头头是道，轮到自己就开始“再看看吧”。",
    ],
    soulsEn: [
      "Carries everything, but never says “I'm tired”.",
      "Full of advice for friends, but “let's see” for yourself.",
    ],
    partner: 5,
    nemesis: 6,
  },
  {
    code: "WOOD-YI",
    title: "乙木 · 社交变色龙",
    titleEn: "Yi Wood · Social chameleon",
    bars: [
      { label: "表面随和度", labelEn: "Surface easygoingness", value: 90 },
      { label: "内心小算盘", labelEn: "Inner calculations", value: 86 },
    ],
    souls: [
      "谁都聊得来，但真正的心里话只告诉 1.5 个人。",
      "看起来很佛，其实已经默默记住了每个人的生日和雷点。",
    ],
    soulsEn: [
      "Everyone's friend, but only 1.5 people know the real you.",
      "Looks chill; still quietly memorises everyone's birthdays.",
    ],
    partner: 6,
    nemesis: 7,
  },
  {
    code: "FIRE-BING",
    title: "丙火 · 人形充电宝",
    titleEn: "Bing Fire · Human power bank",
    bars: [
      { label: "表面热情度", labelEn: "Surface warmth", value: 95 },
      { label: "内心求夸度", labelEn: "Need for praise", value: 88 },
    ],
    souls: [
      "群里最先回复的是你，最后一个睡的也是你。",
      "热情到让人害怕，三分钟就能跟陌生人约好下次一起去吃 mamak。",
    ],
    soulsEn: [
      "First to reply in the group chat, last to sleep.",
      "So warm it's scary: 3 minutes and you have a mamak plan.",
    ],
    partner: 7,
    nemesis: 8,
  },
  {
    code: "FIRE-DING",
    title: "丁火 · 深夜暖心电台",
    titleEn: "Ding Fire · Late-night warm radio",
    bars: [
      { label: "表面温柔度", labelEn: "Surface gentleness", value: 87 },
      { label: "内心戏丰富度", labelEn: "Inner drama level", value: 93 },
    ],
    souls: [
      "别人一句“没事”，你能脑补出三集连续剧。",
      "朋友难过你第一个发现，自己难过却只会发一张没配字的夕阳。",
    ],
    soulsEn: [
      "A friend says “I'm fine” and you picture three episodes.",
      "You spot sadness first, but only post a sunset, no words.",
    ],
    partner: 8,
    nemesis: 9,
  },
  {
    code: "EARTH-WU",
    title: "戊土 · 情绪稳定天花板",
    titleEn: "Wu Earth · Calm under any storm",
    bars: [
      { label: "表面淡定度", labelEn: "Surface calmness", value: 94 },
      { label: "内心焦虑度", labelEn: "Inner anxiety", value: 71 },
    ],
    souls: [
      "天塌下来你会先拍张照，然后说“问题不大”。",
      "看起来什么都无所谓，其实冰箱里的东西放哪都有规定。",
    ],
    soulsEn: [
      "Sky falls? You take a photo first, then say “no big deal”.",
      "Looks like nothing matters; the fridge has strict rules.",
    ],
    partner: 9,
    nemesis: 0,
  },
  {
    code: "EARTH-JI",
    title: "己土 · 宿舍老妈子",
    titleEn: "Ji Earth · Dorm mum",
    bars: [
      { label: "表面好说话", labelEn: "Surface easy to talk to", value: 91 },
      { label: "内心记账本", labelEn: "Inner ledger", value: 84 },
    ],
    souls: [
      "嘴上说“随便”，心里早就有标准答案了。",
      "帮全宿舍带饭，结果忘了买自己的。",
    ],
    soulsEn: [
      "“Anything is fine” — but you already have the answer.",
      "You buy food for the whole dorm and forget your own.",
    ],
    partner: 0,
    nemesis: 1,
  },
  {
    code: "METAL-GENG",
    title: "庚金 · 人间清醒人形兵器",
    titleEn: "Metal-Geng · The clear-eyed blade",
    bars: [
      { label: "表面高冷度", labelEn: "Surface coolness", value: 90 },
      { label: "内心戏丰富度", labelEn: "Inner drama level", value: 85 },
    ],
    souls: [
      "嘴硬心软第一名，表面上对谁都无所谓，背地里连明年的退路都想好了。",
      "说话像刀，做事像尺，唯一的弱点是路边的小猫。",
    ],
    soulsEn: [
      "Tough talk, soft heart — with next year's backup plan ready.",
      "Words like a knife, work like a ruler; weakness: cats.",
    ],
    partner: 1,
    nemesis: 2,
  },
  {
    code: "METAL-XIN",
    title: "辛金 · 精致完美主义者",
    titleEn: "Metal-Xin · Polished perfectionist",
    bars: [
      { label: "表面精致度", labelEn: "Surface polish", value: 93 },
      { label: "内心玻璃心", labelEn: "Glass heart", value: 80 },
    ],
    souls: [
      "可以接受作业迟交，不能接受 PPT 字体不统一。",
      "外表是限量版，内心是易碎品，请轻拿轻放。",
    ],
    soulsEn: [
      "Late homework is fine; mismatched slide fonts are not.",
      "Limited edition outside, fragile inside. Handle with care.",
    ],
    partner: 2,
    nemesis: 3,
  },
  {
    code: "WATER-REN",
    title: "壬水 · 脑洞永动机",
    titleEn: "Ren Water · Idea machine",
    bars: [
      { label: "表面自由度", labelEn: "Surface freedom", value: 92 },
      { label: "内心计划度", labelEn: "Inner planning", value: 58 },
    ],
    souls: [
      "一天有八百个新点子，真正执行的是第八百零一个。",
      "说走就走的是你，走到一半问“我们要去哪”的也是你。",
    ],
    soulsEn: [
      "800 ideas a day; the one you actually do is number 801.",
      "You leave with no plan, then ask: “where are we going?”",
    ],
    partner: 3,
    nemesis: 4,
  },
  {
    code: "WATER-GUI",
    title: "癸水 · 人形读心雷达",
    titleEn: "Gui Water · Human mind-reader",
    bars: [
      { label: "表面安静度", labelEn: "Surface quietness", value: 85 },
      { label: "内心弹幕量", labelEn: "Inner comment track", value: 95 },
    ],
    souls: [
      "表面在发呆，其实已经把全场每个人的关系图谱分析完了。",
      "最会安慰别人，自己 emo 时只会把同一首歌循环 50 遍。",
    ],
    soulsEn: [
      "Looks spaced out; already mapped everyone in the room.",
      "Great at comforting; when sad, one song on loop 50 times.",
    ],
    partner: 4,
    nemesis: 5,
  },
];

// ---------- 2. 合盘报告 · Pair report (by the two day-master ELEMENTS) ----------

export type PairCopy = {
  tag: string; // 关系定位标签
  tagEn: string; // English tag
  teaser: string; // 解锁前的悬念预览
  teaserEn: string; // English teaser
  roast: string; // 毒舌锐评模式
  roastEn: string; // English roast
  heart: string; // 走心模式
  heartEn: string; // English heart mode
};

const pairKey = (a: Element, b: Element) => [a, b].sort().join("+");

const PAIRS: Record<string, PairCopy> = {
  // same element
  [pairKey("wood", "wood")]: {
    tag: "互相催更的学习搭子",
    tagEn: "Study buddies who push each other",
    teaser: "两棵树站在一起，到底谁先开花？",
    teaserEn: "Two trees side by side — who blooms first?",
    roast: "两棵树站一起，谁也不让谁先开花。一起做 Group Assignment，最后会出现两个版本的 final draft。",
    roastEn:
      "Two trees, and neither lets the other bloom first. Do a group assignment together and you end up with two final drafts.",
    heart: "你们价值观很接近，适合一起定长期目标。分工时先说好谁拍板，避免两个人都在等对方点头。",
    heartEn:
      "You share similar values, so long-term goals work well. Decide who makes the final call, or both of you just wait for a nod.",
  },
  [pairKey("fire", "fire")]: {
    tag: "一点就着的烟花双人组",
    tagEn: "Instant-spark fireworks duo",
    teaser: "两团火凑在一起，是烟花还是火灾？",
    teaserEn: "Two fires together: fireworks or a house fire?",
    roast: "两个都想当主角，聊天三分钟能吵五个话题，吵完又一起去吃火锅。建议火锅店直接给你们办会员。",
    roastEn:
      "Both want the lead role. Three minutes of chat, five topics, one fight — then hotpot together. Just get a membership card.",
    heart: "你们能量都很高，一起做事效率爆表。记得轮流当“降温的那一个”，不要同时上头。",
    heartEn:
      "You both run on high energy, so work gets done fast. Take turns being the one who cools down.",
  },
  [pairKey("earth", "earth")]: {
    tag: "沙发上的稳重二人组",
    tagEn: "Steady sofa duo",
    teaser: "两座山放在一起，会不会一动也不动？",
    teaserEn: "Two mountains together — will anything move at all?",
    roast: "两个人约饭从“都可以”讨论到餐厅打烊，最后决定回宿舍吃泡面。",
    roastEn:
      "You spend an hour on “anything is fine” until the shop closes, then go back to the dorm for instant noodles.",
    heart: "你们是彼此最安心的存在。偶尔逼自己跳出舒适圈，一起试一件新鲜事，感情会更有火花。",
    heartEn:
      "You are each other's safest place. Once in a while, try one new thing together.",
  },
  [pairKey("metal", "metal")]: {
    tag: "人形双刃剑组合",
    tagEn: "Double-edged sword combo",
    teaser: "两把刀放在一起，谁先收鞘？",
    teaserEn: "Two blades on the table — who sheathes first?",
    roast: "两个人都觉得自己是对的，所以吵架从来不会结束，只会中场休息。",
    roastEn:
      "Both of you are always right, so the argument never ends — it only takes a break.",
    heart: "你们都讲原则、讲效率。合作前先对齐标准，就能变成最可靠的执行团队。",
    heartEn:
      "You both care about rules and speed. Agree on the standards first and you become the most reliable team.",
  },
  [pairKey("water", "water")]: {
    tag: "脑洞宇宙双人电台",
    tagEn: "Two-mind idea radio",
    teaser: "两片海洋相遇，会不会淹掉所有 deadline？",
    teaserEn: "Two oceans meet — will every deadline drown?",
    roast: "一起开会两小时，产出了十个新点子和零个结论。",
    roastEn: "Two hours of meeting: ten new ideas, zero decisions.",
    heart: "你们特别懂彼此的情绪。做决定时约好一个收尾时间，灵感才能真正落地。",
    heartEn:
      "You really get each other's moods. Set a finish time, so the ideas actually land.",
  },
  // generating 相生
  [pairKey("wood", "fire")]: {
    tag: "点火助燃好拍档",
    tagEn: "Spark and fuel partners",
    teaser: "一个负责点子，一个负责点火……",
    teaserEn: "One makes the idea, one lights it up…",
    roast: "木负责出点子，火负责到处宣传，结果点子还没想完，火已经在 IG 发了预告。",
    roastEn:
      "Wood makes the idea, fire announces it everywhere. Fire has already posted a teaser on IG before the idea is done.",
    heart: "木给火方向，火给木动力，是最适合一起做项目的组合。火要记得别把木烧干，给对方喘息的空间。",
    heartEn:
      "Wood gives direction, fire gives drive — a great project pair. Fire, leave wood some room to breathe.",
  },
  [pairKey("fire", "earth")]: {
    tag: "热情冲锋 + 人形保险",
    tagEn: "Full-speed charge + human insurance",
    teaser: "一个负责冲，一个负责……收拾残局？",
    teaserEn: "One charges ahead, one cleans up…",
    roast: "火每天都在冲，土每天都在帮火收拾残局，堪称人形保险公司。",
    roastEn:
      "Fire charges ahead every day, earth cleans up every day. A human insurance company.",
    heart: "火带来热情，土把热情变成成果。土也要学会说“不”，不要一直默默善后。",
    heartEn:
      "Fire brings the heat, earth turns it into results. Earth, learn to say no.",
  },
  [pairKey("earth", "metal")]: {
    tag: "搞钱绝配",
    tagEn: "Money-making dream team",
    teaser: "这个组合，钱包会越来越鼓……",
    teaserEn: "This pair's wallet only gets fatter…",
    roast: "一个会存钱一个会算账，出去吃 mamak 都要 AA 到小数点后两位。",
    roastEn:
      "One saves, one counts. Even mamak gets split to two decimal places.",
    heart: "土稳住大局，金精准执行，是理财和做生意的最佳组合。偶尔也一起乱花一次钱，人生才有乐趣。",
    heartEn:
      "Earth holds the big picture, metal executes. Once in a while, spend on something silly together.",
  },
  [pairKey("metal", "water")]: {
    tag: "智商在线的军师联盟",
    tagEn: "Smart strategist alliance",
    teaser: "一个写计划，一个……不看计划？",
    teaserEn: "One writes the plan, one… ignores it?",
    roast: "金说“按计划来”，水说“计划是什么”，最后金一个人写了 Plan A 到 Plan F。",
    roastEn:
      "Metal says “follow the plan”, water says “what plan”. Metal ends up writing Plan A to Plan F alone.",
    heart: "金的逻辑配上水的灵感，适合一起做需要创意又要细节的事。金多一点耐心，水多一点交代。",
    heartEn:
      "Metal's logic plus water's ideas — good for work that needs both. Metal, be patient; water, give updates.",
  },
  [pairKey("water", "wood")]: {
    tag: "温柔浇灌系",
    tagEn: "Gentle watering type",
    teaser: "一个默默付出，另一个……知道吗？",
    teaserEn: "One quietly gives — does the other know?",
    roast: "水一直默默照顾木，木一直以为自己是自然长大的。",
    roastEn:
      "Water quietly looks after wood. Wood thinks it just grew on its own.",
    heart: "水给木滋养，木给水方向，非常适合长期相处。木要记得说谢谢，水也要说出自己的需要。",
    heartEn:
      "Water feeds wood, wood gives direction — great long term. Wood, say thanks; water, say what you need.",
  },
  // controlling 相克
  [pairKey("wood", "earth")]: {
    tag: "欢喜冤家",
    tagEn: "Bickering sweethearts",
    teaser: "一个想改变世界，一个只想……",
    teaserEn: "One wants to change the world, one just wants…",
    roast: "木想改变世界，土只想改变今天的午餐，讨论半天，世界和午餐都没改变。",
    roastEn:
      "Wood wants to change the world, earth wants to change today's lunch. One hour later, neither changed.",
    heart: "木会推着土前进，土会让木脚踏实地。起冲突时先听完对方，再决定。",
    heartEn:
      "Wood pushes earth forward, earth keeps wood grounded. Hear each other out first.",
  },
  [pairKey("earth", "water")]: {
    tag: "塑料饭搭子",
    tagEn: "Fair-weather food buddies",
    teaser: "约好的饭局，真的会准时开始吗？",
    teaserEn: "Will the meal you planned start on time?",
    roast: "土想定规矩，水想随心所欲，约好的饭局总是在最后一刻改地点。",
    roastEn:
      "Earth wants rules, water wants freedom, so the meeting spot changes at the last minute. Every time.",
    heart: "土给水安全感，水让土更灵活。把“弹性”写进计划里，就不会互相嫌弃。",
    heartEn:
      "Earth gives water safety, water makes earth flexible. Write “flexible” into the plan.",
  },
  [pairKey("water", "fire")]: {
    tag: "冰火两重天",
    tagEn: "Ice and fire",
    teaser: "一个一点就着，一个冷静到……",
    teaserEn: "One explodes fast, one stays calm as…",
    roast: "一个火气太旺一点就着，一个冷静到像在看纪录片。建议只一起吃火锅，千万别一起做 Group Assignment！",
    roastEn:
      "Fire burns hot and fast, water watches like a documentary. Hotpot only — never a group assignment together!",
    heart: "火让水更有行动力，水让火冷静下来。吵架时约定先冷静 10 分钟再谈。",
    heartEn:
      "Fire gives water action, water cools fire down. Agree on a 10-minute cool-off when you fight.",
  },
  [pairKey("fire", "metal")]: {
    tag: "互相淬炼的对手",
    tagEn: "Rivals who sharpen each other",
    teaser: "嫌弃对方，却总在关键时刻……",
    teaserEn: "You judge each other, yet always show up…",
    roast: "火觉得金太冷，金觉得火太吵，但每次 deadline 前熬夜救场的，都是这两个人。",
    roastEn:
      "Fire thinks metal is cold, metal thinks fire is loud. But before every deadline, these two stay up to save it.",
    heart: "火能融化金的冷硬，金能给火的热情一个形状。欣赏彼此的不同，就是最强组合。",
    heartEn:
      "Fire melts metal's cold edge, metal gives fire a shape. Enjoy the difference.",
  },
  [pairKey("metal", "wood")]: {
    tag: "砍树式友情",
    tagEn: "Tree-chopping friendship",
    teaser: "聊天的时候，好像有人在挥刀……",
    teaserEn: "Chatting feels like someone is swinging a blade…",
    roast: "金说话太直，木又太倔，聊天像在砍树，一刀下去两个人都受伤。",
    roastEn:
      "Metal is too direct, wood is too stubborn. The chat is like chopping a tree — one cut and both get hurt.",
    heart: "金帮木修剪多余的枝叶，木让金学会温柔。批评对方之前，先说一句好话。",
    heartEn:
      "Metal trims wood's extra branches, wood teaches metal to be gentle. Say one nice thing first.",
  },
};

export function pairCopy(a: Element, b: Element): PairCopy {
  return PAIRS[pairKey(a, b)];
}

// ---------- 3. 五行小队 · Squad diagnosis ----------

export const SQUAD_MISSING: Record<
  Element,
  { title: string; titleEn: string; warning: string; warningEn: string }
> = {
  wood: {
    title: "全员没主见队",
    titleEn: "Team No Direction",
    warning: "警告！本群缺少「木属性」，没人负责出主意和定方向，急需拉一位木属性朋友当方向盘！",
    warningEn:
      "Warning! No Wood in this group, so nobody brings ideas or sets the direction. Grab a Wood friend as your steering wheel!",
  },
  fire: {
    title: "全员佛系躺平队",
    titleEn: "Team Peak Chill",
    warning: "警告！本群行动力严重不足，急需拉一位「火属性」朋友入伙点火！",
    warningEn:
      "Warning! Action power is seriously low here. You need a Fire friend to start the engine!",
  },
  earth: {
    title: "全员漂泊无根队",
    titleEn: "Team No Roots",
    warning: "警告！本群缺少「土属性」，没人管细节和后勤，急需一位土属性朋友当定海神针！",
    warningEn:
      "Warning! No Earth here, so nobody handles details or logistics. Find an Earth friend to be your anchor!",
  },
  metal: {
    title: "全员心软拖延队",
    titleEn: "Team Soft-Hearted Procrastinators",
    warning: "警告！本群缺少「金属性」，没人敢拍板做决定，急需一位金属性朋友当执行官！",
    warningEn:
      "Warning! No Metal here, so nobody dares to decide. You need a Metal friend as the enforcer!",
  },
  water: {
    title: "全员脑袋打结队",
    titleEn: "Team Tangled Brains",
    warning: "警告！本群缺少「水属性」，大家想法都太死板，急需一位水属性朋友带来灵感！",
    warningEn:
      "Warning! No Water here, so every idea is stiff and safe. Invite a Water friend for fresh ideas!",
  },
};

export const SQUAD_MULTI_MISSING = {
  title: "五行残缺冒险队",
  titleEn: "Team Missing Pieces",
  warning: "警告！本群同时缺少好几种五行，赶快把链接丢进群里，拉人补齐！",
  warningEn:
    "Warning! Several elements are missing at once. Drop the link in your group chat and recruit fast!",
};

export const SQUAD_SAME = {
  title: "复制粘贴小分队",
  titleEn: "Copy-Paste Squad",
  warning: "你们的日主全都是同一种五行！想法太像容易一起钻牛角尖，急需不同属性的朋友加入。",
  warningEn:
    "Everyone here has the same element! Similar minds can spiral together, so invite friends of other elements.",
};

export const SQUAD_COMPLETE = {
  title: "五行圆满 · 天选创业天团",
  titleEn: "All Five Elements · The Chosen Startup Team",
  message: "隐藏金卡已解锁！五行齐全，每个人都有自己的位置。以下是专属团队分工建议：",
  messageEn:
    "Hidden gold card unlocked! All five elements are here, and everyone has a place. Here is your team role plan:",
};

/** Team role by a member's day-master element */
export const SQUAD_ROLES: Record<
  Element,
  { role: string; roleEn: string; why: string; whyEn: string }
> = {
  fire: {
    role: "👑 Leader / 气氛担当",
    roleEn: "👑 Leader / hype master",
    why: "火属性最有感染力，适合站在前面带大家冲。",
    whyEn:
      "Fire is the most infectious, so it is best up front, pushing everyone forward.",
  },
  wood: {
    role: "🧭 策划 / 方向盘",
    roleEn: "🧭 Planner / steering wheel",
    why: "木属性擅长定目标、想长远，适合规划路线。",
    whyEn:
      "Wood is good at setting goals and thinking long term, so it plans the route.",
  },
  earth: {
    role: "🛡️ 后勤 / 定海神针",
    roleEn: "🛡️ Logistics / the anchor",
    why: "土属性稳重可靠，适合管进度、照顾大家。",
    whyEn:
      "Earth is steady and reliable, so it tracks progress and looks after people.",
  },
  metal: {
    role: "💰 管钱 / 执行官",
    roleEn: "💰 Money / enforcer",
    why: "金属性精准果断，适合管预算、盯 deadline。",
    whyEn:
      "Metal is sharp and decisive, so it handles the budget and the deadlines.",
  },
  water: {
    role: "💡 创意 / 军师",
    roleEn: "💡 Ideas / strategist",
    why: "水属性脑洞最大，适合出点子、想策略。",
    whyEn:
      "Water has the wildest ideas, so it brings options and strategy.",
  },
};

// ---------- 4. 每日宜忌 · Daily do's & don'ts (by today's 十神 category) ----------

export type GodKey = "peer" | "resource" | "output" | "wealth" | "officer";

export const DAILY_YIJI: Record<
  GodKey,
  { yi: string[]; yiEn: string[]; ji: string[]; jiEn: string[] }
> = {
  peer: {
    yi: ["约同学一起去图书馆", "组队做 Group Assignment", "跟朋友分享好吃的店", "参加社团活动"],
    yiEn: ["Group study session", "Group assignment day", "Share food finds", "Join a club event"],
    ji: ["冲动消费买同款", "跟朋友抢风头", "借钱给别人", "在群里吵架"],
    jiEn: ["Impulse buying", "Steal the spotlight", "Lend money away", "Argue in group chat"],
  },
  resource: {
    yi: ["找导师套近乎", "早点睡觉补眠", "复习上周的笔记", "看一本闲书"],
    yiEn: ["Talk to your tutor", "Sleep early tonight", "Review old notes", "Read a book for fun"],
    ji: ["熬夜改代码", "什么都依赖别人", "一整天躺平滑手机", "拖延回 email"],
    jiEn: ["Code all night", "Depend on others", "Bed-rot on the phone", "Delay your emails"],
  },
  output: {
    yi: ["做 presentation", "发 IG / 小红书", "写报告、做设计", "勇敢表达意见"],
    yiEn: ["Do a presentation", "Post on IG / XHS", "Write or design", "Say what you think"],
    ji: ["说话太直伤人", "在课堂上顶撞老师", "深夜发长文", "答应太多事情"],
    jiEn: ["Be too blunt", "Argue with lecturer", "Late-night long post", "Say yes to too much"],
  },
  wealth: {
    yi: ["整理记账本", "找兼职、谈价钱", "去超市补货", "规划这个月的预算"],
    yiEn: ["Update your budget", "Find part-time work", "Restock groceries", "Budget for the month"],
    ji: ["贪小便宜", "网购清空购物车", "跟朋友算太清楚", "借钱买奢侈品"],
    jiEn: ["Chase cheap deals", "Shopping cart spree", "Split bills exactly", "Loan for luxury"],
  },
  officer: {
    yi: ["喝冰美式提神", "按时交作业", "整理房间和桌面", "跟上司/老师确认需求"],
    yiEn: ["Coffee for focus", "Submit work on time", "Tidy room and desk", "Confirm the brief"],
    ji: ["正面顶撞上司", "迟到", "考试前临时抱佛脚", "情绪化做决定"],
    jiEn: ["Talk back to boss", "Be late", "Last-minute cramming", "Decide when upset"],
  },
};

// ---------- 5. 赛博解压小玩具 · Daily toy ----------

export const DAILY_TOYS = {
  ice: {
    name: "赛博降温冰块",
    nameEn: "Cyber cooling ice cube",
    reason: "今日火气偏旺，容易暴躁。",
    reasonEn: "Fire energy is high today, so tempers run hot.",
    hint: "狂点屏幕，把冰块敲碎！",
    hintEn: "Tap fast and smash the ice!",
    done: "暴躁值 -10，冷静 +1 ❄️",
    doneEn: "Temper -10, calm +1 ❄️",
    taps: 12,
  },
  fish: {
    name: "赛博招财木鱼",
    nameEn: "Cyber lucky wooden fish",
    reason: "今日财运偏弱，容易破财。",
    reasonEn: "Wealth energy is low today, so money slips away.",
    hint: "敲 10 下木鱼，为钱包充能！",
    hintEn: "Tap the fish 10 times to charge your wallet!",
    done: "功德 +1，财气已充能 💰",
    doneEn: "Merit +1, wallet charged 💰",
    taps: 10,
  },
} as const;
