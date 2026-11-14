// 五行性格问卷 · a MBTI-style quiz built on the five elements.
// 15 题，每题四个选项，每个选项给一个主五行 +2、一个副五行 +1，并记一次阴阳倾向。
// 答完：主五行 + 阴阳 → 十天干里的一种（甲…癸），对应 10 种性格类型。
// 文案英文为主、中文小字（团队要求）。

import { ELEMENTS, type Element } from "@/lib/bazi";

export type QuizOption = {
  en: string;
  zh: string;
  el: Element; // 主五行 +2
  sub: Element; // 副五行 +1
  yang: boolean; // 阳明倾向
};

export type QuizQuestion = { en: string; zh: string; options: QuizOption[] };

export const QUIZ: QuizQuestion[] = [
  {
    en: "A free Friday night. What do you want to do?",
    zh: "周五晚上突然空出来，你更想：",
    options: [
      { en: "Call a group and go out. The louder the better.", zh: "叫上一群人出去，越热闹越好", el: "fire", sub: "wood", yang: true },
      { en: "Stay in and finish something you kept delaying.", zh: "一个人把拖了很久的事做完", el: "metal", sub: "earth", yang: true },
      { en: "Scroll on my phone and see where it goes.", zh: "窝着刷手机，想到什么算什么", el: "water", sub: "wood", yang: false },
      { en: "Meet one friend and talk until late.", zh: "约一个朋友慢慢聊到深夜", el: "earth", sub: "water", yang: false },
    ],
  },
  {
    en: "Your group project has a part nobody wants. You:",
    zh: "小组作业分到没人想做的部分，你会：",
    options: [
      { en: "Raise my hand and take it, so it gets done.", zh: "直接举手接下来，先把坑填了", el: "earth", sub: "metal", yang: true },
      { en: "Suggest a new split and make the rules clear.", zh: "提议重新分工，把规则说清楚", el: "metal", sub: "fire", yang: true },
      { en: "Ask privately who has ideas, then decide together.", zh: "私下问谁其实有想法，再一起定", el: "wood", sub: "water", yang: false },
      { en: "Start it and see how it goes.", zh: "先做着，边做边看情况", el: "water", sub: "earth", yang: false },
    ],
  },
  {
    en: "A friend says “I'm fine”. Your first move:",
    zh: "朋友说「我没事」，你第一反应是：",
    options: [
      { en: "I don't buy it. I keep asking.", zh: "不信，继续追问", el: "fire", sub: "wood", yang: true },
      { en: "Watch for a few days and see if anything changes.", zh: "观察几天，看他有没有变", el: "water", sub: "metal", yang: false },
      { en: "Take them out to eat.", zh: "直接带他去吃东西", el: "earth", sub: "fire", yang: false },
      { en: "Say “tell me when you need me” and stay around.", zh: "说「需要就说」，然后留着", el: "wood", sub: "metal", yang: false },
    ],
  },
  {
    en: "When deciding, you fear most:",
    zh: "做决定时你最怕：",
    options: [
      { en: "Thinking too long and missing the chance.", zh: "想太久，错过机会", el: "fire", sub: "wood", yang: true },
      { en: "Doing it wrong and being judged.", zh: "做错了被人说", el: "metal", sub: "earth", yang: false },
      { en: "Being tied down, losing freedom.", zh: "被绑住，不自由", el: "water", sub: "wood", yang: true },
      { en: "Letting someone down.", zh: "对不起别人", el: "earth", sub: "water", yang: false },
    ],
  },
  {
    en: "Your desk or room is usually:",
    zh: "你的桌子 / 房间通常是：",
    options: [
      { en: "Messy, but I know where everything is.", zh: "乱，但我知道东西在哪", el: "water", sub: "fire", yang: false },
      { en: "Sorted, every thing has a place.", zh: "分类清楚，位置固定", el: "metal", sub: "earth", yang: true },
      { en: "Clean, but food shows up fast.", zh: "干净，但随时会摆上吃的", el: "earth", sub: "wood", yang: false },
      { en: "Depends on my mood. Big clean every few weeks.", zh: "看心情，隔一阵大整理一次", el: "wood", sub: "fire", yang: true },
    ],
  },
  {
    en: "Someone @s you with a question you are not sure about:",
    zh: "有人在群里 @ 你问一个你也不确定的问题：",
    options: [
      { en: "Reply first, then check while typing.", zh: "先回一句，边查边答", el: "fire", sub: "water", yang: true },
      { en: "Check properly, then answer once.", zh: "查清楚再一次性回", el: "metal", sub: "earth", yang: true },
      { en: "Wait for others to answer, then add.", zh: "等其他人的答案再补", el: "water", sub: "earth", yang: false },
      { en: "DM them, ask more, then answer together.", zh: "私聊对方，问清楚再一起回", el: "wood", sub: "earth", yang: false },
    ],
  },
  {
    en: "Who attracts you more:",
    zh: "你更容易被哪种人吸引：",
    options: [
      { en: "Someone with strong ideas who leads the way.", zh: "很有想法、会带你走的人", el: "wood", sub: "fire", yang: false },
      { en: "Someone steady who keeps their word.", zh: "很稳、说到做到的人", el: "earth", sub: "metal", yang: false },
      { en: "Someone bright who lights up the room.", zh: "很亮、走到哪都热闹的人", el: "fire", sub: "wood", yang: true },
      { en: "Someone quiet who speaks and is always right.", zh: "很安静但一开口就准的人", el: "metal", sub: "water", yang: true },
    ],
  },
  {
    en: "When a plan falls apart, you:",
    zh: "计划被打乱时，你：",
    options: [
      { en: "Make a new version right away.", zh: "立刻改一版新的", el: "metal", sub: "fire", yang: true },
      { en: "Get annoyed, then go with it.", zh: "先烦一下，然后随便", el: "water", sub: "wood", yang: false },
      { en: "Calm everyone down first.", zh: "先安抚大家的情绪", el: "earth", sub: "fire", yang: false },
      { en: "Use it as an excuse to do what I wanted.", zh: "干脆借机做点更想做的", el: "fire", sub: "wood", yang: true },
    ],
  },
  {
    en: "You most often stay up late because:",
    zh: "你熬夜最常因为：",
    options: [
      { en: "Chatting or videos. I can't stop.", zh: "聊天 / 刷视频停不下来", el: "fire", sub: "water", yang: true },
      { en: "Rewriting something again and again.", zh: "一遍遍改东西", el: "metal", sub: "earth", yang: false },
      { en: "Thinking. The more I think, the more awake I am.", zh: "想事情，越想越清醒", el: "water", sub: "wood", yang: false },
      { en: "Keeping someone company. I can't leave first.", zh: "陪别人，不好意思先走", el: "earth", sub: "wood", yang: false },
    ],
  },
  {
    en: "When someone praises you, you want to hear:",
    zh: "别人夸你，你心里更想听：",
    options: [
      { en: "“You really bring the energy.”", zh: "「你真的很会带气氛」", el: "fire", sub: "wood", yang: true },
      { en: "“I trust you with anything.”", zh: "「交给你我最放心」", el: "earth", sub: "metal", yang: true },
      { en: "“You notice the small things.”", zh: "「你想得好细」", el: "metal", sub: "water", yang: false },
      { en: "“Talking to you is easy.”", zh: "「跟你聊天很舒服」", el: "wood", sub: "water", yang: false },
    ],
  },
  {
    en: "Someone you dislike. You:",
    zh: "遇到不喜欢的人，你：",
    options: [
      { en: "Stay polite on the surface, keep distance.", zh: "表面客气，私下远离", el: "water", sub: "metal", yang: false },
      { en: "Let them know directly.", zh: "直接让对方知道", el: "fire", sub: "metal", yang: true },
      { en: "Put up with it, then tell my friends.", zh: "忍着，但会跟朋友讲", el: "wood", sub: "earth", yang: false },
      { en: "Work with them anyway if needed.", zh: "该合作还是照做", el: "earth", sub: "metal", yang: true },
    ],
  },
  {
    en: "You trust more:",
    zh: "你更相信：",
    options: [
      { en: "Instinct. Do it first, then see.", zh: "直觉，先做了再说", el: "fire", sub: "wood", yang: true },
      { en: "Experience. I know it after I try.", zh: "经验，做过才知道", el: "earth", sub: "metal", yang: false },
      { en: "Logic. If it doesn't make sense, no.", zh: "逻辑，讲得通才做", el: "metal", sub: "water", yang: true },
      { en: "Feeling. Go where it feels right.", zh: "感觉，哪边舒服往哪边", el: "water", sub: "wood", yang: false },
    ],
  },
  {
    en: "A project just ended. You want to:",
    zh: "一个项目结束，你最想：",
    options: [
      { en: "Start the next one now.", zh: "马上开下一个", el: "fire", sub: "metal", yang: true },
      { en: "Sit down and review it.", zh: "好好总结一下", el: "metal", sub: "earth", yang: true },
      { en: "Lie down for a few days.", zh: "先躺几天", el: "water", sub: "earth", yang: false },
      { en: "Eat with the team.", zh: "跟队友吃一顿", el: "earth", sub: "fire", yang: false },
    ],
  },
  {
    en: "What you can't stand:",
    zh: "你最难忍的是：",
    options: [
      { en: "No efficiency, endless changes.", zh: "没效率、反复改", el: "metal", sub: "fire", yang: true },
      { en: "Being ignored, no reply.", zh: "被忽视、没人回应", el: "fire", sub: "wood", yang: true },
      { en: "Being controlled, no space.", zh: "被控制、没有空间", el: "water", sub: "wood", yang: false },
      { en: "Being misunderstood, unable to explain.", zh: "被误会、说不清", el: "wood", sub: "water", yang: false },
    ],
  },
  {
    en: "One line to introduce yourself:",
    zh: "如果要用一句话介绍自己：",
    options: [
      { en: "“I'm easy to be around.”", zh: "「我很好相处」", el: "earth", sub: "water", yang: false },
      { en: "“I know where the line is.”", zh: "「我很有分寸」", el: "metal", sub: "earth", yang: true },
      { en: "“I'm fun.”", zh: "「我很有意思」", el: "fire", sub: "wood", yang: true },
      { en: "“Easy to read, hard to know.”", zh: "「我很好懂，也很难懂」", el: "water", sub: "wood", yang: false },
    ],
  },
];

// 主五行 → 阳干序号（阴干 = +1）
const BASE_STEM: Record<Element, number> = { wood: 0, fire: 2, earth: 4, metal: 6, water: 8 };

export type QuizResult = {
  stem: number; // 0..9 甲..癸
  element: Element;
  yang: boolean;
  percent: Record<Element, number>; // 问卷得出的五行占比
};

/** 把选择题的答案换算成 → 五行占比 + 十天干之一 */
export function scoreQuiz(answers: (number | null)[]): QuizResult {
  const raw: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  let yangVotes = 0;
  let answered = 0;

  answers.forEach((choice, i) => {
    if (choice === null || choice === undefined) return;
    const opt = QUIZ[i]?.options[choice];
    if (!opt) return;
    raw[opt.el] += 2;
    raw[opt.sub] += 1;
    if (opt.yang) yangVotes += 1;
    answered += 1;
  });

  const total = ELEMENTS.reduce((s, el) => s + raw[el], 0) || 1;
  const percent = {} as Record<Element, number>;
  for (const el of ELEMENTS) percent[el] = Math.round((raw[el] / total) * 100);

  const element = ELEMENTS.reduce((a, el) => (raw[el] > raw[a] ? el : a), ELEMENTS[0]);
  const yang = yangVotes * 2 >= answered;
  const stem = BASE_STEM[element] + (yang ? 0 : 1);

  return { stem, element, yang, percent };
}

// ---------- 兜底报告（AI 没配/失败时用） ----------

export const ELEMENT_REPORT: Record<
  Element,
  { headline: string; summary: string; strength: string[]; blind: string[]; advice: string }
> = {
  wood: {
    headline: "Set the direction first",
    summary:
      "You decide the direction, then move. While others are still discussing, you already have a first version. You protect the people you keep close, even if you never say it out loud.",
    strength: ["You set the direction early", "You are patient with people", "You carry what you commit to"],
    blind: ["You expect others to meet your standard", "You never say you are tired, so nobody helps"],
    advice: "Say what you need sometimes. Nothing breaks.",
  },
  fire: {
    headline: "The room lights up when you walk in",
    summary:
      "You are the one who starts the energy. People talk to you everywhere, and you cannot stand a quiet room for long. The warmth is real, but it cools down fast.",
    strength: ["You save any awkward silence", "You chase what you promised", "You say ideas so people follow"],
    blind: ["You start hot and cool fast", "Silence hits you and your feelings lead"],
    advice: "Sleep on big decisions. Only do what still feels right tomorrow.",
  },
  earth: {
    headline: "When others panic, you don't",
    summary:
      "You are the one who stays calm. You don't talk much, but things land safely in your hands. You take care of people, and you often put yourself last.",
    strength: ["You stay steady under pressure", "You keep promises and details", "You hold the team together"],
    blind: ["You endure too long, then go quiet", "You put others before yourself"],
    advice: "Let people see the cost of your help, or they will take it for granted.",
  },
  metal: {
    headline: "You see the bone of the problem",
    summary:
      "You read situations fast and hate dragging things out. Your lines are clear and your promises are exact. The only problem: your words cut more than you mean.",
    strength: ["Sharp judgement", "Principled and reliable", "Fast and no waste"],
    blind: ["Straight talk can hurt", "You judge yourself too hard"],
    advice: "Start with “I'm not blaming you”. It changes everything.",
  },
  water: {
    headline: "Your mind never stops",
    summary:
      "You hear what people don't say, and ideas come faster than most. The problem is you have too many: you get stuck at “let me think one more time” and never start.",
    strength: ["Fast, flexible mind", "You read the room well", "You adapt anywhere"],
    blind: ["Overthinking keeps you still", "Feelings can flip your plans"],
    advice: "Set a 20-minute rule: start before you feel ready.",
  },
};

export function fallbackReport(result: QuizResult) {
  const r = ELEMENT_REPORT[result.element];
  return {
    headline: r.headline,
    summary: r.summary,
    strengths: r.strength,
    watch: r.blind,
    advice: r.advice,
  };
}
