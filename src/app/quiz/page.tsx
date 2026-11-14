"use client";

import Link from "next/link";
import { useState } from "react";
import CharacterAvatar from "@/components/CharacterAvatar";
import { useAiText } from "@/lib/aiClient";
import type { AiQuiz } from "@/lib/aiShared";
import { ELEMENTS, ELEMENT_INFO, STEMS, STEM_ELEMENT, type Element } from "@/lib/bazi";
import { PERSONAS } from "@/lib/copy";
import { QUIZ, fallbackReport, scoreQuiz, type QuizResult } from "@/lib/quiz";

const EMPTY: AiQuiz = { headline: "", summary: "", strengths: [], watch: [], advice: "" };

/** 每次都换一个顺序，重测不会一路点同一个位置 */
function shuffled(n: number) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizPage() {
  const [step, setStep] = useState(-1); // -1 = 还没开始
  const [order, setOrder] = useState<number[]>(() => QUIZ.map((_, i) => i)); // 首次渲染固定，点开始时才打乱
  const [answers, setAnswers] = useState<(number | null)[]>(() => QUIZ.map(() => null));
  const [busy, setBusy] = useState(false); // 防连点：一次点击只算一题

  const answered = answers.filter((a) => a !== null).length;
  const result = step >= QUIZ.length ? scoreQuiz(answers) : null;
  const current = step >= 0 && step < QUIZ.length ? QUIZ[order[step]] : null;

  const fallback = result ? fallbackReport(result) : EMPTY;
  const ai = useAiText(
    result ? `quiz:${answers.join("")}` : "quiz:none",
    result
      ? JSON.stringify({ kind: "quiz", quiz: { stem: result.stem, yang: result.yang, percent: result.percent } })
      : "",
    fallback,
  );

  function choose(qi: number, oi: number) {
    if (busy) return;
    setBusy(true);
    setAnswers((prev) => {
      const next = [...prev];
      next[qi] = oi;
      return next;
    });
    setStep((s) => s + 1);
    // 手机上双击很容易被当成两次点击，那样会跳过一题、答案变空
    setTimeout(() => setBusy(false), 220);
  }

  function start() {
    setOrder(shuffled(QUIZ.length));
    setAnswers(QUIZ.map(() => null));
    setStep(0);
  }

  function restart() {
    start();
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <header className="flex items-center gap-3">
        <Link href="/" className="text-sm font-bold text-[#8a7aa3] underline">
          ← 首页
        </Link>
        <h1 className="flex-1 text-center text-lg font-extrabold text-[#6b4f8f]">🧪 五行性格测试</h1>
        <span className="w-12" />
      </header>

      {step === -1 && (
        <section className="flex flex-col items-center gap-3 rounded-[2rem] border-4 border-white bg-white/85 p-6 text-center shadow-[0_8px_24px_rgba(155,140,255,0.25)]">
          <p className="text-5xl">🌿🔥⛰️🪙💧</p>
          <h2 className="text-xl font-black text-[#4a3566]">不用生日，也能测</h2>
          <p className="text-sm leading-relaxed text-[#8a7aa3]">
            15 道题，2 分钟。按你的选择算出五行比例与阴阳倾向，
            <br />
            对应到十天干里的<b>一种人格类型</b>。
          </p>
          <button
            type="button"
            data-testid="quiz-start"
            onClick={start}
            className="mt-1 w-full rounded-full bg-[#ff8fb1] px-6 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#e06690] active:translate-y-1 active:shadow-[0_2px_0_#e06690]"
          >
            🚀 开始 · 第 1 题
          </button>          <p className="text-[11px] text-[#b9aed0]">想看更准的？回去填真实出生时间，那个是排盘算的。</p>
        </section>
      )}

      {step >= 0 && step < QUIZ.length && current && (
        <section className="flex flex-col gap-4" data-testid="quiz-question">
          <div>
            <div className="mb-1 flex justify-between text-xs font-bold text-[#8a7aa3]">
              <span>
                第 {step + 1} / {QUIZ.length} 题
              </span>
              <span>{Math.round((answered / QUIZ.length) * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#f3eefc]">
              <div
                className="h-full rounded-full bg-[#ff8fb1] transition-all"
                style={{ width: `${(answered / QUIZ.length) * 100}%` }}
              />
            </div>
          </div>

          <h2 className="rounded-[1.6rem] border-4 border-white bg-[#fff5fb] p-5 text-lg leading-relaxed font-black text-[#4a3566]">
            {current.q}
          </h2>

          <div className="flex flex-col gap-2">
            {current.options.map((o, i) => (
              <button
                key={o.text}
                type="button"
                data-testid={`option-${i}`}
                onClick={() => choose(order[step], i)}
                disabled={busy}
                className="rounded-2xl border-2 border-white bg-white px-4 py-3.5 text-left text-[15px] font-bold text-[#4a3566] shadow-[0_4px_12px_rgba(155,140,255,0.16)] transition active:translate-y-0.5 active:shadow-none disabled:opacity-70"
              >
                {o.text}
              </button>
            ))}
          </div>

          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="mx-auto text-xs font-bold text-[#b9aed0] underline"
            >
              上一题
            </button>
          )}
        </section>
      )}

      {result && (
        <QuizResultView
          result={result}
          report={ai.data}
          live={ai.live}
          loading={ai.loading}
          onRestart={restart}
        />
      )}

      <p className="mt-auto text-center text-xs text-[#b9aed0]">仅供娱乐 · Just for fun 🎉</p>
    </main>
  );
}

function QuizResultView({
  result,
  report,
  live,
  loading,
  onRestart,
}: {
  result: QuizResult;
  report: AiQuiz;
  live: boolean;
  loading: boolean;
  onRestart: () => void;
}) {
  const persona = PERSONAS[result.stem];
  const el = ELEMENT_INFO[result.element];
  const stemEl = ELEMENT_INFO[STEM_ELEMENT[result.stem]];

  return (
    <div className="flex flex-col gap-3" data-testid="quiz-result">
      <section
        className="relative overflow-hidden rounded-[2.2rem] border-[3px] border-white shadow-[0_16px_36px_rgba(155,140,255,0.32)]"
        style={{ background: `linear-gradient(160deg,#ffffff 0%, ${stemEl.soft} 58%, #efe4ff 100%)` }}
      >
        <div className="relative p-5">
          <div className="flex items-center justify-between gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-black tracking-[0.12em] text-white"
              style={{ background: stemEl.color }}
            >
              {persona.code}
            </span>
            <span className="rounded-full bg-white/85 px-3 py-1 text-[11px] font-bold text-[#8a7aa3]">
              问卷结果 · Quiz
            </span>
          </div>

          <div className="relative mt-2 flex justify-center">
            <CharacterAvatar index={result.stem} priority className="block h-auto w-[58%] max-w-[210px]" />
          </div>

          <h2 className="mt-2 text-center text-2xl leading-tight font-black text-[#4a3566]">{persona.title}</h2>
          <p className="mt-1 text-center text-sm font-bold text-[#8a7aa3]">
            {STEMS[result.stem]}
            {stemEl.zh} · 偏{result.yang ? "阳" : "阴"} · {el.zh}
            {el.en}
          </p>

          <div className="mt-3 flex flex-col gap-2.5">
            {persona.bars.map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex items-baseline justify-between text-xs font-extrabold text-[#6b4f8f]">
                  <span>{bar.label}</span>
                  <span className="tabular-nums" style={{ color: stemEl.color }}>
                    {bar.value}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-white/90">
                  <div
                    className="bar-fill h-full rounded-full"
                    style={{ width: `${bar.value}%`, background: `linear-gradient(90deg, ${stemEl.color}, #b48cff)` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <blockquote className="mt-3 rounded-3xl bg-white/90 p-4 text-[15px] leading-relaxed font-bold text-[#4a3566]">
            <span className="mr-1 text-xl text-[#ff5c93]">“</span>
            {persona.souls[0]}
            <span className="ml-1 text-xl text-[#ff5c93]">”</span>
          </blockquote>

          <div className="mt-3">
            <p className="mb-1 text-[10px] font-black tracking-wider text-[#8a7aa3]">你的五行比例 · Your mix</p>
            <div className="flex h-3 overflow-hidden rounded-full">
              {ELEMENTS.map((e) => (
                <span
                  key={e}
                  style={{ width: `${result.percent[e as Element]}%`, background: ELEMENT_INFO[e as Element].color }}
                  aria-hidden
                />
              ))}
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {ELEMENTS.map((e) => (
                <span key={e} className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-bold text-[#6b4f8f]">
                  {ELEMENT_INFO[e as Element].zh} {result.percent[e as Element]}%
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border-4 border-white bg-white p-5 shadow-[0_8px_24px_rgba(155,140,255,0.22)]">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-lg font-extrabold text-[#6b4f8f]">📝 你的人物报告</h2>
          <span className="text-[10px] font-bold text-[#b9aed0]">
            {live ? "✦ AI 现场生成" : loading ? "AI 正在想…" : "预设文案"}
          </span>
        </div>
        <p className="mt-1 text-lg font-black text-[#4a3566]" data-testid="quiz-headline">
          {report.headline}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[#6b4f8f]">{report.summary}</p>

        <div className="mt-3 grid grid-cols-1 gap-2">
          <div className="rounded-2xl bg-[#e9f7ef] p-3">
            <p className="text-xs font-black text-[#2e7d4f]">💪 你的优势</p>
            <ul className="mt-1 flex flex-col gap-0.5 text-sm text-[#2e5d43]">
              {report.strengths.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-[#fff1f1] p-3">
            <p className="text-xs font-black text-[#c0392b]">🪞 要小心的地方</p>
            <ul className="mt-1 flex flex-col gap-0.5 text-sm text-[#8a3b32]">
              {report.watch.map((s) => (
                <li key={s}>· {s}</li>
              ))}
            </ul>
          </div>
          {report.advice && (
            <div className="rounded-2xl bg-[#f8f4ff] p-3 text-sm font-bold text-[#4a3566]">💡 {report.advice}</div>
          )}
        </div>
      </section>

      <div className="flex flex-col gap-2">
        <Link
          href="/?start=1"
          className="rounded-full bg-[#b48cff] px-5 py-3 text-center font-extrabold text-white shadow-[0_5px_0_#8f66e0]"
        >
          🎂 用真实生日再算一次（更准）
        </Link>
        <button type="button" onClick={onRestart} className="text-sm font-bold text-[#8a7aa3] underline">
          🔁 重新测一次
        </button>
      </div>
    </div>
  );
}
