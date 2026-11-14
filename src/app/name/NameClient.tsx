"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ELEMENT_INFO, HOURS, computeChart, parseTypedDate, readChart, type Chart, type Element } from "@/lib/bazi";
import { asPoolChar, scoreName } from "@/lib/namePool";
import { useSavedProfile } from "@/lib/useClientValues";
import {
  COMPOUND_SURNAMES,
  GRID_INFO,
  charInfo,
  computeWuge,
  numberElement,
  numberInfo,
  sancai,
  type GridKey,
  type Luck,
  type Wuge,
} from "@/lib/wuge";

const HAN = /^[㐀-鿿]+$/;
const LUCK_STYLE: Record<Luck, string> = {
  吉: "bg-[#dcf5e5] text-[#2e7d4f]",
  半吉: "bg-[#fff1c9] text-[#8a6d00]",
  凶: "bg-[#ffe0e0] text-[#c0392b]",
};
const GRIDS: GridKey[] = ["tian", "ren", "di", "wai", "zong"];

type BirthMode = "none" | "mine" | "other";

function splitNames(input: string) {
  return input
    .split(/[\s,，、;；/]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function buyun(w: Wuge, chars: string[], chart: Chart) {
  const r = readChart(chart);
  const ren = numberElement(w.ren);
  const di = numberElement(w.di);
  const zong = numberElement(w.zong);
  const given = chars.map(asPoolChar);
  const { buyun: score } = scoreName(w, given, chart);
  const filled = r.missing.filter((m) => [ren, di, zong].includes(m) || given.some((c) => c.mean && c.el === m));
  const L = ELEMENT_INFO[r.lucky];
  const charHit = given.filter((c) => c.mean && c.el === r.lucky).map((c) => c.ch);
  let text: string;
  if (ren === r.lucky) text = `人格五行是${L.zh}，正好是八字的喜用神，名字帮你补到了核心！`;
  else if (di === r.lucky || zong === r.lucky) text = `地格或总格带${L.zh}，补到了喜用神，但人格没有，算是部分补运。`;
  else text = `名字的主要五格没有补到喜用神「${L.zh}」，可以考虑人格（姓最后一字 + 名第一字）带${L.zh}的组合。`;
  if (charHit.length) text += `名字里的「${charHit.join("」「")}」字本身也属${L.zh}。`;
  return { score: score ?? 0, lucky: r.lucky, missing: r.missing, filled, text };
}

export default function NameClient({
  initialSurname = "",
  initialGiven = "",
  initialBirth = "",
}: {
  initialSurname?: string;
  initialGiven?: string;
  initialBirth?: string;
}) {
  const saved = useSavedProfile();
  const [surname, setSurname] = useState(initialSurname);
  const [given, setGiven] = useState(initialGiven);
  const [mode, setMode] = useState<BirthMode>(initialBirth ? "other" : "none");
  const [date, setDate] = useState(initialBirth);
  const [hour, setHour] = useState("");
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  // arriving from 取名 with a name filled in → show the result straight away
  const [submitted, setSubmitted] = useState<{ s: string; g: string[] } | null>(() =>
    HAN.test(initialSurname) && initialSurname.length <= 2 && splitNames(initialGiven).every((x) => HAN.test(x) && x.length <= 2) && splitNames(initialGiven).length
      ? { s: initialSurname, g: splitNames(initialGiven) }
      : null,
  );
  const [error, setError] = useState("");

  const chart: Chart | null = useMemo(() => {
    if (mode === "mine" && saved) return computeChart(saved);
    if (mode === "other") {
      const d = parseTypedDate(date);
      return d ? computeChart({ name: "", gender: "", date: d, hour }) : null;
    }
    return null;
  }, [mode, saved, date, hour]);

  const strokesOf = (ch: string) => overrides[ch] ?? charInfo(ch).strokes;

  const results = useMemo(() => {
    if (!submitted) return [];
    const s = Array.from(submitted.s);
    return submitted.g
      .map((g) => {
        const gs = Array.from(g);
        const chars = [...s, ...gs].map((ch) => ({ ...charInfo(ch), strokes: strokesOf(ch) }));
        const missing = chars.filter((c) => !c.strokes);
        if (missing.length) return { name: submitted.s + g, chars, missing, w: null, base: 0, by: null, score: -1 };
        const w = computeWuge(
          s.map((ch) => strokesOf(ch)!),
          gs.map((ch) => strokesOf(ch)!),
        );
        const { base, score } = scoreName(w, gs.map(asPoolChar), chart);
        const by = chart ? buyun(w, gs, chart) : null;
        return { name: submitted.s + g, chars, missing, w, base, by, score };
      })
      .sort((a, b) => b.score - a.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, overrides, chart]);

  function submit() {
    const s = surname.trim();
    const g = splitNames(given);
    if (!HAN.test(s) || s.length > 2) return setError("姓要输入 1–2 个汉字，例如：陈、欧阳");
    if (!g.length || g.some((x) => !HAN.test(x) || x.length > 2))
      return setError("名字每个 1–2 个汉字，多个候选用空格分开，例如：小明 子涵");
    if (mode === "other" && !parseTypedDate(date)) return setError("生日看不懂，试试 2024-08-15，或者选「不填」");
    setError("");
    setSubmitted({ s, g });
  }

  const isCompound = surname.trim().length === 2;
  const compoundHint = isCompound && !COMPOUND_SURNAMES.includes(surname.trim());

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
      <header className="flex items-center gap-3">
        <Link href="/" className="text-sm font-bold text-[#8a7aa3] underline">
          ← 返回
        </Link>
        <h1 className="flex-1 text-center text-2xl font-extrabold text-[#6b4f8f]">✍️ 名字五格测算</h1>
        <span className="w-10" />
      </header>
      <p className="-mt-3 text-center text-xs text-[#8a7aa3]">
        五格剖象法 · 康熙笔画 · 81 数理 · 三才配置
        <br />
        宝宝还没出生也能测，有生日的话还会看名字有没有补到八字喜用神
      </p>
      <p className="-mt-2 self-center rounded-full bg-[#fff3cd] px-3 py-1 text-xs font-black text-[#8a6d00]">⚠️ 仅供娱乐 · For fun only</p>

      <section className="flex flex-col gap-4 rounded-[2rem] border-4 border-white bg-[#fff5fb] p-5 shadow-[0_8px_24px_rgba(255,143,177,0.25)]">
        <div className="grid grid-cols-[5.5rem_1fr] gap-3">
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-bold text-[#6b4f8f]">姓</span>
            <input
              name="surname"
              value={surname}
              maxLength={2}
              onChange={(e) => setSurname(e.target.value)}
              placeholder="陈"
              className="w-full min-w-0 rounded-2xl border-2 border-[#e6d7ff] bg-white px-3 py-3 text-center text-lg outline-none focus:border-[#b48cff]"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-sm font-bold text-[#6b4f8f]">名（可填多个候选）</span>
            <input
              name="given"
              value={given}
              onChange={(e) => setGiven(e.target.value)}
              placeholder="小明 子涵 思远"
              className="w-full min-w-0 rounded-2xl border-2 border-[#e6d7ff] bg-white px-4 py-3 text-lg outline-none focus:border-[#b48cff]"
            />
          </label>
        </div>
        {compoundHint && (
          <p className="-mt-2 text-xs text-[#8a6d00]">
            「{surname.trim()}」会当成复姓（两个字的姓）来算。如果是单姓，只填第一个字。
          </p>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-[#6b4f8f]">生日（选填，用来看名字补不补运）</span>
          <div className="grid grid-cols-3 gap-2 text-sm font-bold">
            {(
              [
                ["none", "👶 不填"],
                ["mine", "🙋 用我的"],
                ["other", "📅 输入"],
              ] as [BirthMode, string][]
            ).map(([m, label]) => (
              <button
                key={m}
                type="button"
                data-testid={`birth-${m}`}
                disabled={m === "mine" && !saved}
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`rounded-2xl border-2 px-2 py-2 disabled:opacity-40 ${
                  mode === m ? "border-[#b48cff] bg-[#f3eefc] text-[#6b4f8f]" : "border-[#e6d7ff] bg-white text-[#8a7aa3]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === "none" && <p className="text-xs text-[#8a7aa3]">只看五格，适合宝宝还没出生、先挑候选名字。</p>}
          {mode === "mine" && saved && <p className="text-xs text-[#8a7aa3]">用你保存的生日：{saved.date}</p>}
          {mode === "other" && (
            <div className="grid grid-cols-2 gap-2">
              <input
                name="birth"
                value={date}
                inputMode="numeric"
                onChange={(e) => setDate(e.target.value)}
                placeholder="2024-08-15"
                className="w-full min-w-0 rounded-2xl border-2 border-[#e6d7ff] bg-white px-3 py-2 outline-none focus:border-[#b48cff]"
              />
              <select
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-full min-w-0 rounded-2xl border-2 border-[#e6d7ff] bg-white px-2 py-2 text-sm outline-none"
              >
                {HOURS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && <p className="rounded-xl bg-[#ffe0e0] px-3 py-2 text-sm text-[#c0392b]">{error}</p>}
        <button
          type="button"
          data-testid="name-submit"
          onClick={submit}
          className="rounded-full bg-[#ff8fb1] px-6 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#e06690] active:translate-y-1 active:shadow-[0_2px_0_#e06690]"
        >
          ✍️ 测算名字
        </button>
      </section>

      {chart && submitted && (
        <p className="rounded-2xl bg-white/80 p-3 text-center text-sm text-[#6b4f8f]">
          八字喜用神：<b>{ELEMENT_INFO[readChart(chart).lucky].emoji} {ELEMENT_INFO[readChart(chart).lucky].zh}</b>
          {readChart(chart).missing.length > 0 && (
            <>
              　缺：<b>{readChart(chart).missing.map((m) => ELEMENT_INFO[m].zh).join("、")}</b>
            </>
          )}
        </p>
      )}

      {results.map((r, idx) => (
        <section
          key={r.name}
          data-testid="name-result"
          className="flex flex-col gap-3 rounded-[2rem] border-4 border-white bg-white p-5 shadow-[0_8px_24px_rgba(155,140,255,0.2)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              {results.length > 1 && r.score >= 0 && (
                <p className="text-xs font-black text-[#b48cff]">{idx === 0 ? "🏆 第 1 名" : `第 ${idx + 1} 名`}</p>
              )}
              <p className="text-3xl font-black tracking-widest text-[#4a3566]">{r.name}</p>
              <p className="mt-1 flex flex-wrap gap-1 text-xs text-[#8a7aa3]">
                {r.chars.map((c, i) => (
                  <span key={i} className="rounded-full bg-[#f8f4ff] px-2 py-0.5">
                    {c.ch}
                    {c.trad !== c.ch && `（${c.trad}）`} {c.strokes ?? "?"} 画
                  </span>
                ))}
              </p>
            </div>
            {r.score >= 0 && (
              <div className="shrink-0 text-center">
                <p className="text-4xl font-black text-[#ff5c93]" data-testid="name-score">
                  {r.score}
                </p>
                <p className="text-[10px] font-bold text-[#8a7aa3]">{r.by ? "综合分" : "五格分"}</p>
              </div>
            )}
          </div>

          {r.missing.length > 0 ? (
            <div className="rounded-2xl bg-[#fff3cd] p-3 text-sm">
              <p className="mb-2 font-bold text-[#8a6d00]">这几个字不在常用字典里，请输入它的康熙笔画：</p>
              {r.missing.map((c) => (
                <label key={c.ch} className="mr-3 inline-flex items-center gap-2">
                  <span className="text-lg font-black">{c.ch}</span>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    className="w-16 rounded-xl border-2 border-[#e6d7ff] px-2 py-1"
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (v > 0) setOverrides((o) => ({ ...o, [c.ch]: v }));
                    }}
                  />
                </label>
              ))}
            </div>
          ) : (
            r.w && (
              <>
                <table className="w-full text-left text-sm">
                  <tbody>
                    {GRIDS.map((k) => {
                      const n = numberInfo(r.w![k]);
                      const el = ELEMENT_INFO[numberElement(r.w![k])];
                      return (
                        <tr key={k} className="border-b border-[#f3eefc] last:border-0">
                          <td className="py-1.5 pr-2 font-black whitespace-nowrap text-[#6b4f8f]">{GRID_INFO[k].zh}</td>
                          <td className="py-1.5 pr-2 font-black tabular-nums">{r.w![k]}</td>
                          <td className="py-1.5 pr-2 whitespace-nowrap">
                            {el.emoji}
                            {el.zh}
                          </td>
                          <td className="py-1.5 pr-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-black ${LUCK_STYLE[n.luck]}`}>{n.luck}</span>
                          </td>
                          <td className="py-1.5 text-xs text-[#6b4f8f]">
                            <b>{n.name}</b>
                            <br />
                            <span className="text-[#8a7aa3]">{n.meaning}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {(() => {
                  const sc = sancai(r.w!);
                  return (
                    <div className="rounded-2xl bg-[#f8f4ff] p-3 text-sm">
                      <p className="font-bold text-[#4a3566]">
                        三才配置：{sc.label}{" "}
                        <span className={`rounded-full px-2 py-0.5 text-xs font-black ${LUCK_STYLE[sc.luck]}`}>{sc.luck}</span>
                      </p>
                      <p className="text-xs text-[#8a7aa3]">{sc.text}</p>
                    </div>
                  );
                })()}
                {r.by && (
                  <div className="rounded-2xl p-3 text-sm" style={{ background: ELEMENT_INFO[r.by.lucky].soft }} data-testid="buyun">
                    <p className="font-bold text-[#4a3566]">
                      🍀 名字补运指数：<span className="text-lg font-black">{r.by.score}</span>
                    </p>
                    <p>{r.by.text}</p>
                    {r.by.filled.length > 0 && (
                      <p className="mt-1 text-xs">还补到了八字缺的：{r.by.filled.map((e: Element) => ELEMENT_INFO[e].zh).join("、")}</p>
                    )}
                  </div>
                )}
                <details className="text-xs text-[#8a7aa3]">
                  <summary className="cursor-pointer font-bold">五格各代表什么？</summary>
                  <ul className="mt-1 list-disc pl-4">
                    {GRIDS.map((k) => (
                      <li key={k}>
                        <b>{GRID_INFO[k].zh}</b>：{GRID_INFO[k].about}
                      </li>
                    ))}
                    <li>数字的五行看尾数：1、2 木 · 3、4 火 · 5、6 土 · 7、8 金 · 9、0 水</li>
                  </ul>
                </details>
              </>
            )
          )}
        </section>
      ))}

      <p className="mt-auto text-center text-xs text-[#b9aed0]">
        笔画来自 Unicode 汉字数据库（康熙笔画规则）。五格是传统姓名学，各派数理略有不同，仅供娱乐 🎉
      </p>
    </main>
  );
}

