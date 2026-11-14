"use client";

// 家居分析 · 方位那一条：罗盘读朝向 → 九宫格摆房间 → 八宅推演出分数和解释。
// 罗盘只在浏览器里算，不上传；读不到就手动选坐向，功能不堵死。

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bi, BiInline } from "@/components/Bi";
import {
  GUAS,
  analyze,
  cellGua,
  guaInfo,
  houseFromSitting,
  houseOf,
  roomInfo,
  type Gua,
  type HouseInfo,
  type RoomKey,
} from "@/lib/bazhai";

type CompassStatus = "off" | "asking" | "on" | "denied" | "unsupported";

type OriEvt = DeviceOrientationEvent & { webkitCompassHeading?: number; absolute?: boolean };

function headingOf(e: OriEvt): number | null {
  const w = e.webkitCompassHeading;
  if (typeof w === "number" && Number.isFinite(w)) return ((w % 360) + 360) % 360;
  if (typeof e.alpha === "number" && e.absolute !== false) return ((360 - e.alpha) % 360 + 360) % 360;
  return null;
}

function median(list: number[]): number | null {
  if (!list.length) return null;
  const s = [...list].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function spread(list: number[]): number {
  if (list.length < 2) return 0;
  let min = 360;
  let max = 0;
  for (const d of list) {
    min = Math.min(min, d);
    max = Math.max(max, d);
  }
  return Math.min(max - min, 360 - (max - min));
}

const ROOM_ORDER: RoomKey[] = ["door", "bedroom", "living", "kitchen", "study", "dining", "bath", "balcony"];

export default function BazhaiClient() {
  const [status, setStatus] = useState<CompassStatus>("off");
  const [samples, setSamples] = useState<number[]>([]);
  const [manual, setManual] = useState<Gua | null>(null);
  const [picked, setPicked] = useState<RoomKey>("door");
  // 房间按「真实方位」记，不按格子记：改了坐向，房间还在原来那个方向
  const [placed, setPlaced] = useState<Partial<Record<Gua, RoomKey>>>({});
  const [showResult, setShowResult] = useState(false);
  const samplesRef = useRef<number[]>([]);
  const listenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  const stopCompass = useCallback(() => {
    if (listenerRef.current) {
      window.removeEventListener("deviceorientationabsolute", listenerRef.current);
      window.removeEventListener("deviceorientation", listenerRef.current);
      listenerRef.current = null;
    }
    setStatus("off");
  }, []);

  useEffect(() => () => stopCompass(), [stopCompass]);

  const startCompass = useCallback(async () => {
    setStatus("asking");
    setManual(null);
    samplesRef.current = [];
    setSamples([]);

    const DOE = window.DeviceOrientationEvent as unknown as
      | { requestPermission?: () => Promise<"granted" | "denied"> }
      | undefined;
    if (!DOE) {
      setStatus("unsupported");
      return;
    }
    if (typeof DOE.requestPermission === "function") {
      try {
        const r = await DOE.requestPermission();
        if (r !== "granted") {
          setStatus("denied");
          return;
        }
      } catch {
        setStatus("denied");
        return;
      }
    }

    const handler = (evt: DeviceOrientationEvent) => {
      const deg = headingOf(evt as OriEvt);
      if (deg === null) return;
      const next = [...samplesRef.current, deg].slice(-9);
      samplesRef.current = next;
      setSamples(next);
    };
    listenerRef.current = handler;
    window.addEventListener("deviceorientationabsolute", handler as EventListener);
    window.addEventListener("deviceorientation", handler as EventListener);
    setStatus("on");

    // 三秒还没读数，说明这台机器没有磁力计：提示手动
    window.setTimeout(() => {
      if (samplesRef.current.length === 0) setStatus((s) => (s === "on" ? "unsupported" : s));
    }, 3000);
  }, []);

  const heading = median(samples);
  const jitter = spread(samples);
  const lowAccuracy = samples.length >= 4 && jitter > 20;

  const house: HouseInfo | null = useMemo(() => {
    if (manual) return houseFromSitting(manual);
    if (heading !== null) return houseOf(heading);
    return null;
  }, [manual, heading]);

  const placedList = useMemo(
    () =>
      (Object.entries(placed) as [Gua, RoomKey][])
        .filter(([, key]) => Boolean(key))
        .map(([dir, key]) => ({ key, dir })),
    [placed],
  );

  const result = useMemo(() => (house ? analyze(house, placedList) : null), [house, placedList]);
  const hasDoor = placedList.some((p) => p.key === "door");

  function tapCell(dir: Gua) {
    setPlaced((prev) => {
      const next = { ...prev };
      if (next[dir] === picked) {
        delete next[dir]; // 再点一次拿走
        return next;
      }
      // 同一间房只能在一个方位：先把旧位置清掉
      for (const k of Object.keys(next) as Gua[]) if (next[k] === picked) delete next[k];
      next[dir] = picked;
      return next;
    });
    setShowResult(false);
  }

  const cell = (i: number) => (house ? cellGua(i, house.sitting) : null);

  return (
    <div className="flex flex-col gap-4">
      {/* ---------- 1 · 罗盘 ---------- */}
      <section className="rounded-[2rem] border-4 border-white bg-white p-4 shadow-[0_8px_24px_rgba(155,140,255,0.2)]">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-extrabold text-[#6b4f8f]">
            <Bi en="1 · Which way does the door face?" zh="1 · 大门朝哪个方向？" />
          </p>
          <span className="text-[11px] font-bold text-[#b9aed0]">
            {status === "on" ? (
              <BiInline en="Compass on" zh="罗盘已开" />
            ) : status === "asking" ? (
              <BiInline en="Asking…" zh="正在读…" />
            ) : (
              <BiInline en="Optional" zh="可跳过" />
            )}
          </span>
        </div>

        <p className="mt-1 text-[11px] leading-relaxed text-[#8a7aa3]">
          <Bi
            en="Stand in the middle of the home and point the phone at your front door. The compass never leaves your browser."
            zh="站在房屋中心，手机水平指向大门。罗盘只在浏览器里算，不会上传。"
          />
        </p>

        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#f8f4ff] p-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-white bg-white text-center shadow-inner">
            <span className="text-[10px] font-bold text-[#b9aed0]">N</span>
            <span className="text-lg font-black leading-none text-[#6b4f8f]">
              {heading === null ? "—" : Math.round(heading)}°
            </span>
          </div>
          <div className="min-w-0 flex-1">
            {house ? (
              <>
                <p className="text-sm font-extrabold text-[#4a3566]">{house.lineZh}</p>
                <p className="text-[11px] text-[#8a7aa3]">
                  {house.lineEn} · {house.groupZh}
                </p>
              </>
            ) : (
              <p className="text-sm font-bold text-[#8a7aa3]">
                <BiInline en="No reading yet — start the compass or pick a direction below." zh="还没读数——开罗盘，或者在下面手选。" />
              </p>
            )}
            {lowAccuracy && (
              <p className="mt-1 text-[11px] font-bold text-[#c0392b]">
                <BiInline en="Shaky reading. Wave the phone in a figure 8." zh="读数有点跳，拿着手机画几个 8 字。" />
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 flex gap-2">
          <button
            type="button"
            data-testid="compass-start"
            onClick={() => void startCompass()}
            className="flex-1 rounded-full bg-[#b48cff] px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_4px_0_#8f66e0] active:translate-y-0.5 active:shadow-[0_1px_0_#8f66e0]"
          >
            {status === "on" ? <BiInline en="Re-read" zh="重读一次" /> : <BiInline en="🧭 Start compass" zh="🧭 开罗盘" />}
          </button>
          {status === "on" && (
            <button
              type="button"
              onClick={stopCompass}
              className="rounded-full border-2 border-[#e6d7ff] bg-white px-3 py-2 text-xs font-bold text-[#6b4f8f]"
            >
              <BiInline en="Stop" zh="停" />
            </button>
          )}
        </div>

        {(status === "denied" || status === "unsupported" || status === "off") && manual === null && (
          <div className="mt-2">
            <p className="text-[11px] font-bold text-[#8a7aa3]">
              {status === "denied" ? (
                <BiInline en="Permission denied — pick the sitting direction instead." zh="没给权限？直接手选坐向。" />
              ) : status === "unsupported" ? (
                <BiInline en="This device has no compass — pick the sitting direction." zh="这台机器读不到罗盘，手选坐向。" />
              ) : (
                <BiInline en="Or pick the sitting direction yourself:" zh="也可以自己选坐向：" />
              )}
            </p>
            <div className="mt-1 grid grid-cols-4 gap-1.5">
              {GUAS.map((g) => (
                <button
                  key={g.gua}
                  type="button"
                  data-testid={`sitting-${g.gua}`}
                  onClick={() => {
                    setManual(g.gua);
                    stopCompass();
                    setShowResult(false);
                  }}
                  className={`rounded-xl border-2 px-1 py-1.5 text-[11px] font-bold ${
                    manual === g.gua
                      ? "border-[#b48cff] bg-[#f3eefc] text-[#6b4f8f]"
                      : "border-[#e6d7ff] bg-white text-[#8a7aa3]"
                  }`}
                >
                  坐{g.dirZh}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ---------- 2 · 九宫格 ---------- */}
      <section className="rounded-[2rem] border-4 border-white bg-[#fff5fb] p-4 shadow-[0_8px_24px_rgba(255,143,177,0.25)]">
        <p className="text-sm font-extrabold text-[#6b4f8f]">
          <Bi en="2 · Put each room in its corner" zh="2 · 把房间放进对应的格子" />
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-[#8a7aa3]">
          <Bi
            en="Upper edge is the back of the house, lower edge is the door side. Tap a room below, then tap its cell."
            zh="格子上边是「坐」（房子背面），下边是「向」（大门那侧）。先选房间，再点格子。"
          />
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5" data-testid="room-palette">
          {ROOM_ORDER.map((key) => {
            const r = roomInfo(key);
            const used = placedList.some((p) => p.key === key);
            const active = picked === key;
            return (
              <button
                key={key}
                type="button"
                data-testid={`room-chip-${key}`}
                aria-pressed={active}
                onClick={() => setPicked(key)}
                className={`rounded-full border-2 px-2.5 py-1 text-[11px] font-bold ${
                  active
                    ? "border-[#ff8fb1] bg-[#ff8fb1] text-white"
                    : used
                      ? "border-[#c9e9d7] bg-[#eafaf0] text-[#2e7d4f]"
                      : "border-[#e6d7ff] bg-white text-[#6b4f8f]"
                }`}
              >
                {r.emoji} {r.zh}
                <span className="ml-1 text-[9px] opacity-70">{r.en}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5" data-testid="bazhai-grid">
          {Array.from({ length: 9 }).map((_, i) => {
            const dir = cell(i);
            if (!dir) {
              return (
                <div
                  key={i}
                  className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-[#e6d7ff] bg-white/70 text-center"
                >
                  <span className="text-[10px] font-bold leading-tight text-[#b9aed0]">
                    {house ? (
                      <>
                        中心
                        <br />
                        <span className="text-[9px]">center</span>
                      </>
                    ) : (
                      "?"
                    )}
                  </span>
                </div>
              );
            }
            const g = guaInfo(dir);
            const room = placed[dir] ? roomInfo(placed[dir]!) : null;
            return (
              <button
                key={i}
                type="button"
                data-testid={`grid-${i}`}
                onClick={() => tapCell(dir)}
                className={`flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl border-2 p-1 text-center transition ${
                  room
                    ? "border-[#ffb3c9] bg-white shadow-[0_2px_8px_rgba(255,143,177,0.25)]"
                    : "border-[#e6d7ff] bg-white/80"
                }`}
              >
                <span className="text-[10px] font-black text-[#6b4f8f]">{g.dirZh}</span>
                {room ? (
                  <>
                    <span className="text-lg leading-none">{room.emoji}</span>
                    <span className="text-[10px] font-bold text-[#4a3566]">{room.zh}</span>
                  </>
                ) : (
                  <span className="text-[9px] text-[#b9aed0]">＋</span>
                )}
              </button>
            );
          })}
        </div>

        {!hasDoor && (
          <p className="mt-2 rounded-xl bg-[#fff3cd] px-3 py-1.5 text-[11px] font-bold text-[#8a6d00]" data-testid="door-hint">
            <Bi en="Front door is required — pick it, then tap the correct cell." zh="大门是必填的：先选「大门」，再点它所在的格子。" />
          </p>
        )}
      </section>

      <button
        type="button"
        data-testid="bazhai-run"
        disabled={!house || !hasDoor}
        onClick={() => setShowResult(true)}
        className="rounded-full bg-[#ff8fb1] px-6 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#e06690] active:translate-y-1 active:shadow-[0_2px_0_#e06690] disabled:opacity-40"
      >
        <BiInline en="🔍 Read this home" zh="🔍 看这套房" />
      </button>

      {/* ---------- 3 · 结果 ---------- */}
      {showResult && result && (
        <section
          data-testid="bazhai-result"
          className="flex flex-col gap-3 rounded-[2rem] border-4 border-white bg-white p-5 shadow-[0_8px_24px_rgba(155,140,255,0.2)]"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-[#f3eefc] px-3 py-1 text-xs font-extrabold text-[#6b4f8f]">
              {result.house.lineZh}
            </span>
            <span className="text-right text-[11px] font-bold text-[#b9aed0]">
              <Bi en={result.house.groupEn} zh={result.house.groupZh} zhClassName="opacity-80" />
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-[#fff5fb] p-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border-4 border-white bg-white shadow-inner">
              <span className="text-xl font-black text-[#ff5c93]" data-testid="bazhai-index">
                {result.index}%
              </span>
            </div>
            <div className="min-w-0 flex-1 text-[11px] leading-relaxed text-[#6b4f8f]">
              <p className="font-bold">{result.summaryZh}</p>
              <p className="mt-0.5 text-[#8a7aa3]">{result.summaryEn}</p>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {result.rooms.map((r) => {
              const room = roomInfo(r.key);
              const tone =
                r.tone === "good" ? "bg-[#eafaf0]" : r.tone === "ok" ? "bg-[#f8f4ff]" : "bg-[#fff1e6]";
              return (
                <li key={r.key} className={`rounded-2xl p-3 ${tone}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-extrabold text-[#4a3566]">
                      {room.emoji} {room.zh}
                      <span className="ml-1 text-[10px] font-bold text-[#8a7aa3]">{r.dirZh}</span>
                    </p>
                    <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-black text-[#6b4f8f]">
                      {r.star} · {r.score}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#4a3566]">{r.textEn}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#8a7aa3]">{r.textZh}</p>
                </li>
              );
            })}
          </ul>

          <p className="text-[11px] leading-relaxed text-[#b9aed0]">
            <Bi
              en="Scores are how well each room fits its corner, not how strong the corner is on its own. Traditional eight-house rules, treated as a fun cultural reading — not advice about health, money or safety."
              zh="分数是「这间房放在这里合不合适」，不是那一格本身的旺衰。按传统八宅的说法推的，当文化解读看，别当成健康、钱财、安全的建议。"
            />
          </p>
        </section>
      )}

      <p className="text-center text-[10px] leading-relaxed text-[#b9aed0]">
        <Bi
          en="Sitting direction decides the house type (八宅明镜). Compass accuracy ±5–15°, so we only use 45° sectors."
          zh="以坐山论宅（八宅明镜）。手机罗盘误差 ±5–15°，所以只分 45° 的大方位。"
        />
      </p>
    </div>
  );
}
