"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ELEMENT_INFO, HOURS, computeChart, parseTypedDate, readChart, type Chart } from "@/lib/bazi";
import { suggestNames, type Gender, type Length } from "@/lib/namePool";
import { useSavedProfile } from "@/lib/useClientValues";
import { COMPOUND_SURNAMES, numberInfo } from "@/lib/wuge";

const HAN = /^[㐀-鿿]+$/;
type BirthMode = "none" | "mine" | "other";

function Pills<T extends string | number>({
  value,
  options,
  onChange,
  testid,
}: {
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
  testid: string;
}) {
  return (
    <div className="grid gap-2 text-sm font-bold" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map(([v, label]) => (
        <button
          key={String(v)}
          type="button"
          data-testid={`${testid}-${v}`}
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`rounded-2xl border-2 px-2 py-2 ${
            value === v ? "border-[#b48cff] bg-[#f3eefc] text-[#6b4f8f]" : "border-[#e6d7ff] bg-white text-[#8a7aa3]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function NamingPage() {
  const saved = useSavedProfile();
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState<Gender>("any");
  const [length, setLength] = useState<Length>("both");
  const [mustUse, setMustUse] = useState("");
  const [mode, setMode] = useState<BirthMode>("none");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");
  const [query, setQuery] = useState<{
    surname: string;
    gender: Gender;
    length: Length;
    mustUse: string;
    chart: Chart | null;
    birth: string;
  } | null>(null);
  const [error, setError] = useState("");

  const result = useMemo(
    () =>
      query
        ? suggestNames({
            surname: query.surname,
            gender: query.gender,
            length: query.length,
            mustUse: query.mustUse,
            chart: query.chart,
            limit: 12,
          })
        : null,
    [query],
  );

  function submit() {
    const s = surname.trim();
    const m = mustUse.trim();
    if (!HAN.test(s) || s.length > 2) return setError("姓要输入 1–2 个汉字，例如：陈、欧阳");
    if (m && (!HAN.test(m) || m.length !== 1)) return setError("指定用字只能填 1 个汉字（例如字辈）");
    let chart: Chart | null = null;
    let birth = "";
    if (mode === "mine" && saved) {
      chart = computeChart(saved);
      birth = saved.date;
    }
    if (mode === "other") {
      const d = parseTypedDate(date);
      if (!d) return setError("生日看不懂，试试 2024-08-15，或者选「不填」");
      chart = computeChart({ name: "", gender: gender === "any" ? "" : gender, date: d, hour });
      birth = d;
    }
    setError("");
    setQuery({ surname: s, gender, length, mustUse: m, chart, birth });
  }

  const reading = query?.chart ? readChart(query.chart) : null;
  const compoundHint = surname.trim().length === 2 && !COMPOUND_SURNAMES.includes(surname.trim());
  const mustOnlySecond =
    query?.mustUse &&
    result &&
    result.list.length > 0 &&
    result.list.every((r) => r.given.length === 2 && r.given[1] === query.mustUse);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
      <header className="flex items-center gap-3">
        <Link href="/" className="text-sm font-bold text-[#8a7aa3] underline">
          ← 返回
        </Link>
        <h1 className="flex-1 text-center text-2xl font-extrabold text-[#6b4f8f]">🍼 帮我取名</h1>
        <span className="w-10" />
      </header>
      <p className="-mt-3 text-center text-xs text-[#8a7aa3]">
        从常用好名里挑出五格最好的；填了生日，还会优先选能补八字喜用神的名字
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
            <span className="text-sm font-bold text-[#6b4f8f]">指定用字 / 字辈（选填）</span>
            <input
              name="must"
              value={mustUse}
              maxLength={1}
              onChange={(e) => setMustUse(e.target.value)}
              placeholder="例如：子"
              className="w-full min-w-0 rounded-2xl border-2 border-[#e6d7ff] bg-white px-4 py-3 text-lg outline-none focus:border-[#b48cff]"
            />
          </label>
        </div>
        {compoundHint && (
          <p className="-mt-2 text-xs text-[#8a6d00]">「{surname.trim()}」会当成复姓来算。如果是单姓，只填第一个字。</p>
        )}

        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-[#6b4f8f]">性别</span>
          <Pills<Gender>
            testid="gender"
            value={gender}
            onChange={setGender}
            options={[
              ["m", "👦 男孩"],
              ["f", "👧 女孩"],
              ["any", "🤝 不限"],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-[#6b4f8f]">名字长度</span>
          <Pills<Length>
            testid="length"
            value={length}
            onChange={setLength}
            options={[
              [1, "单名"],
              [2, "双名"],
              ["both", "都可以"],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-[#6b4f8f]">生日（选填）</span>
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
          {mode === "none" && <p className="text-xs text-[#8a7aa3]">宝宝还没出生也可以，先按五格挑。出生后再填生日，结果会更准。</p>}
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
          data-testid="naming-submit"
          onClick={submit}
          className="rounded-full bg-[#ff8fb1] px-6 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#e06690] active:translate-y-1 active:shadow-[0_2px_0_#e06690]"
        >
          🍼 帮我取名
        </button>
      </section>

      {reading && (
        <p className="rounded-2xl bg-white/80 p-3 text-center text-sm text-[#6b4f8f]">
          八字喜用神：<b>{ELEMENT_INFO[reading.lucky].emoji} {ELEMENT_INFO[reading.lucky].zh}</b>
          {reading.missing.length > 0 && (
            <>
              　缺：<b>{reading.missing.map((m) => ELEMENT_INFO[m].zh).join("、")}</b>
            </>
          )}
          <br />
          <span className="text-xs text-[#8a7aa3]">名字会优先补这些五行</span>
        </p>
      )}

      {result && !result.surnameOk && (
        <p className="rounded-2xl bg-[#fff3cd] p-3 text-sm text-[#8a6d00]">这个姓或指定用字不在常用字典里，暂时没办法算笔画。</p>
      )}
      {result && result.surnameOk && result.list.length === 0 && (
        <p className="rounded-2xl bg-[#fff3cd] p-3 text-sm text-[#8a6d00]" data-testid="naming-empty">
          找不到五格合格的组合。{query?.mustUse && `「${query.mustUse}」和这个姓搭配时，人格或总格都落在凶数，可以换个用字，或改成「都可以」长度。`}
        </p>
      )}
      {mustOnlySecond && (
        <p className="-mb-2 rounded-2xl bg-white/80 p-3 text-xs text-[#6b4f8f]">
          💡「{query!.mustUse}」放在名字第一个字时，人格会落在凶数，所以推荐的都是放在第二个字。
        </p>
      )}

      {result && result.list.length > 0 && (
        <section className="flex flex-col gap-3" data-testid="naming-results">
          {result.list.map((s, i) => (
            <Link
              key={s.given}
              href={`/name?s=${encodeURIComponent(query!.surname)}&g=${encodeURIComponent(s.given)}${
                query!.birth ? `&d=${query!.birth}` : ""
              }`}
              data-testid="naming-item"
              className="flex items-center gap-3 rounded-[1.6rem] border-4 border-white bg-white p-4 shadow-[0_6px_18px_rgba(155,140,255,0.18)]"
            >
              <span className="w-6 text-center text-sm font-black text-[#b48cff]">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-2xl font-black tracking-widest text-[#4a3566]">
                  {query!.surname}
                  {s.given}
                </span>
                <span className="block text-xs text-[#6b4f8f]">{s.meaning}</span>
                <span className="mt-1 flex flex-wrap gap-1 text-[10px]">
                  {s.chars.map((c) =>
                    c.mean ? (
                      <span key={c.ch} className="rounded-full px-2 py-0.5" style={{ background: ELEMENT_INFO[c.el].soft }}>
                        {c.ch} {ELEMENT_INFO[c.el].zh}
                      </span>
                    ) : null,
                  )}
                  <span className="rounded-full bg-[#f8f4ff] px-2 py-0.5 text-[#6b4f8f]">
                    人格 {s.ren} {numberInfo(s.ren).luck} · 总格 {s.zong} {numberInfo(s.zong).luck}
                  </span>
                </span>
              </span>
              <span className="shrink-0 text-center">
                <span className="block text-2xl font-black text-[#ff5c93]">{s.score}</span>
                <span className="text-[10px] text-[#8a7aa3]">{s.buyun !== null ? `补运 ${s.buyun}` : "五格分"}</span>
              </span>
            </Link>
          ))}
          <p className="text-center text-xs text-[#8a7aa3]">点任何一个名字，看完整五格测算 ›</p>
        </section>
      )}

      <p className="mt-auto text-center text-xs text-[#b9aed0]">
        字的五行按部首和字义判断，各派说法不一。以上结果仅供娱乐，正式取名请自行斟酌 🎉
      </p>
    </main>
  );
}
