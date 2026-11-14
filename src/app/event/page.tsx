"use client";

// 现场破冰模式 · the projector screen.
// Big QR on the left, judges' element cards popping up on the right.

import { useEffect, useState } from "react";
import CharacterAvatar from "@/components/CharacterAvatar";
import QrCode from "@/components/QrCode";
import { ELEMENTS, ELEMENT_INFO, STEMS, computeChart } from "@/lib/bazi";
import { STAGE_ROOM, fetchStage, joinUrl, type StageEntry } from "@/lib/event";
import { useOrigin } from "@/lib/useClientValues";

const FALLBACK_NAMES = ["Jia Hui", "Mei Ling", "Arif", "Siew Wen", "Daniel", "Nur Aina"];
const FALLBACK_DATES = [
  "2004-03-12",
  "2003-08-27",
  "2005-01-09",
  "2002-11-30",
  "2004-06-18",
  "2006-02-14",
  "2003-04-05",
];

export default function EventPage() {
  const origin = useOrigin();
  const [entries, setEntries] = useState<StageEntry[]>([]);
  const [demo, setDemo] = useState<StageEntry[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const list = await fetchStage(STAGE_ROOM);
        if (!cancelled) {
          setEntries(list);
          setError("");
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "大屏连不上");
      }
    };
    void tick();
    const timer = setInterval(() => void tick(), 2000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const all = [...demo, ...entries];
  const count = all.length;
  const link = origin ? joinUrl(origin, STAGE_ROOM) : "";

  function addDemo() {
    const i = demo.length;
    setDemo((d) => [
      {
        id: `demo-${Date.now()}`,
        name: FALLBACK_NAMES[(i + d.length) % FALLBACK_NAMES.length],
        date: FALLBACK_DATES[(i + d.length) % FALLBACK_DATES.length],
        hour: String((i * 5) % 12),
        gender: "f",
        t: Date.now(),
      },
      ...d,
    ]);
  }

  const elements = all
    .map((e) => computeChart({ name: e.name, gender: e.gender === "m" ? "m" : "f", date: e.date, hour: e.hour })?.element)
    .filter(Boolean);

  return (
    <main className="min-h-[100svh] w-full bg-[#120b24] bg-[radial-gradient(circle_at_15%_10%,rgba(180,140,255,0.35),transparent_45%),radial-gradient(circle_at_85%_15%,rgba(255,143,177,0.3),transparent_45%),radial-gradient(circle_at_50%_100%,rgba(120,200,255,0.25),transparent_50%)] px-5 py-8 text-white">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.35em] text-[#ffb3cc]">WUXING ENGINE · LIVE</p>
          <h1 className="mt-1 text-3xl font-black md:text-5xl">现场破冰 · 扫码看你的五行</h1>
          <p className="mt-1 text-sm text-white/60">
            扫码 → 输入生日 → 大屏立刻弹出你的入场卡 · Scan, type your birthday, watch the screen
          </p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-center">
          <p className="text-3xl font-black tabular-nums">{count}</p>
          <p className="text-[10px] tracking-widest text-white/60">ALREADY IN</p>
        </div>
      </header>

      <div className="mx-auto mt-6 grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <section className="flex flex-col items-center gap-3 rounded-[2rem] border border-white/15 bg-white/8 p-5 backdrop-blur">
          <div className="rounded-3xl bg-white p-3 shadow-[0_0_60px_rgba(255,143,177,0.45)]">
            {link ? <QrCode value={link} size={280} /> : <div className="h-[280px] w-[280px]" />}
          </div>
          <p className="text-center text-lg font-black">📱 用手机相机扫我</p>
          <p className="break-all text-center text-xs text-white/50">{link || "…"}</p>
          <div className="mt-1 flex flex-wrap justify-center gap-1">
            {ELEMENTS.map((el) => (
              <span key={el} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white/70">
                {ELEMENT_INFO[el].emoji} {ELEMENT_INFO[el].zh} {elements.filter((x) => x === el).length}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/15 bg-white/8 p-4 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black">刚刚入场</h2>
            <button
              type="button"
              onClick={addDemo}
              className="rounded-full border border-dashed border-white/30 px-3 py-1 text-xs font-bold text-white/60"
            >
              🧪 模拟一位评委
            </button>
          </div>
          {error && (
            <p className="mb-3 rounded-xl bg-red-500/20 px-3 py-2 text-xs text-red-200">
              {error} — 需要把 database.rules.json 贴进 Firebase 控制台（README 有步骤）。
            </p>
          )}
          {count === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-white/15 text-center text-white/40">
              <p className="text-4xl">✨</p>
              <p className="text-sm">等第一位评委扫码…</p>
              <p className="text-xs">还没人进来时，点右上角「模拟一位评委」。</p>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {all.slice(0, 12).map((e) => {
                const c = computeChart({
                  name: e.name,
                  gender: e.gender === "m" ? "m" : "f",
                  date: e.date,
                  hour: e.hour,
                });
                const info = c ? ELEMENT_INFO[c.element] : null;
                return (
                  <li
                    key={e.id}
                    className="pop-in overflow-hidden rounded-2xl border border-white/15 p-2 text-center"
                    style={{ background: info ? `${info.color}22` : "rgba(255,255,255,0.06)" }}
                  >
                    {c ? (
                      <CharacterAvatar index={c.dayMaster} className="mx-auto h-16 w-auto rounded-lg" />
                    ) : (
                      <span className="text-3xl">🙂</span>
                    )}
                    <p className="mt-1 truncate text-sm font-black">{e.name}</p>
                    {info && c && (
                      <p className="text-[11px] font-bold" style={{ color: info.color }}>
                        {info.emoji} {info.zh} · {STEMS[c.dayMaster]}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <p className="mx-auto mt-6 max-w-6xl text-center text-[11px] text-white/35">
        WuXing Engine 五行引擎 · 现场模式 · 仅供娱乐
      </p>
    </main>
  );
}
