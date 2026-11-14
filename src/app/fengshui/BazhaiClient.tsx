"use client";

// 家居分析 · 方位那一条：罗盘读朝向 → 九宫格摆房间 → 八宅推演出分数和解释。
// 有照片的话，每间房可以配一张：方位/星由前端查表给定，模型只补「照片里看得见的」。
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
  starAt,
  type Gua,
  type HouseInfo,
  type RoomKey,
} from "@/lib/bazhai";
import type { AiHomeGrid, AiResponse } from "@/lib/aiShared";
import { fileToSmallJpeg, fitBudget } from "@/lib/photo";

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
  // 每间房最多一张照片：键是房间，不是格子 —— 房间挪了，照片跟着走
  const [photos, setPhotos] = useState<Partial<Record<RoomKey, string>>>({});
  const [photoTarget, setPhotoTarget] = useState<RoomKey | null>(null);
  const [ai, setAi] = useState<AiHomeGrid | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiRoomById, setAiRoomById] = useState<Record<number, RoomKey>>({});
  const fileRef = useRef<HTMLInputElement | null>(null);
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

  async function takePhoto(file: File | null | undefined, key: RoomKey) {
    if (!file) return;
    setAiError("");
    try {
      const url = await fileToSmallJpeg(file);
      setPhotos((p) => ({ ...p, [key]: url }));
      setShowResult(false);
      setAi(null);
    } catch {
      setAiError("这张照片读不出来，换一张。 · Could not read that photo.");
    }
  }

  async function run() {
    setShowResult(true);
    setAi(null);
    setAiError("");
    if (!house) return;

    // 只发「已经摆了房间 + 有照片」的那几间
    const withPhoto = placedList.filter((p) => photos[p.key]);
    if (!withPhoto.length) return;

    setAiBusy(true);
    try {
      const raw = withPhoto.map((p) => photos[p.key]!);
      const images = await fitBudget(raw);
      const cells = withPhoto.map((p, i) => ({
        id: i,
        room: p.key,
        dirZh: guaInfo(p.dir).dirZh,
        dirEn: guaInfo(p.dir).dirEn,
        star: starAt(house.house, p.dir),
      }));
      setAiRoomById(Object.fromEntries(cells.map((c) => [c.id, c.room as RoomKey])));

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "homegrid", cells, images }),
      });
      const json = (await res.json()) as AiResponse;
      if (json.ok && json.data) {
        setAi(json.data as AiHomeGrid);
      } else {
        setAiError(
          res.status === 429
            ? "这台网络今天用太多了，等一下再试。 · Too many requests, try again in a bit."
            : "照片那部分这次没回上话，先看方位结论。 · Photo reading did not come back.",
        );
      }
    } catch {
      setAiError("网络断了，照片那部分先跳过。 · Network lost, skipping the photo part.");
    } finally {
      setAiBusy(false);
    }
  }

  const cell = (i: number) => (house ? cellGua(i, house.sitting) : null);

  const aiCellFor = (key: RoomKey) => (ai ? ai.cells.find((c) => aiRoomById[c.id] === key) : undefined);

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

      {/* ---------- 2.5 · 每间房一张照片（可选） ---------- */}
      {placedList.length > 0 && (
        <section className="rounded-[2rem] border-4 border-white bg-white p-4 shadow-[0_8px_24px_rgba(155,140,255,0.2)]">
          <p className="text-sm font-extrabold text-[#6b4f8f]">
            <Bi en="3 · One photo per room (optional)" zh="3 · 每间房一张照片（可选）" />
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#8a7aa3]">
            <Bi
              en="Photos only add what is visible. Direction and star come from the grid, so the model will not guess the compass."
              zh="照片只补「看得见的」，方位和星来自九宫格，模型不会去猜朝向。"
            />
          </p>

          <ul className="mt-2 flex flex-col gap-1.5" data-testid="photo-rows">
            {placedList.map((p) => {
              const room = roomInfo(p.key);
              const url = photos[p.key];
              return (
                <li key={p.key} className="flex items-center gap-2 rounded-xl bg-[#faf7ff] p-1.5">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-base">
                      {room.emoji}
                    </span>
                  )}
                  <span className="flex-1 truncate text-xs font-bold text-[#4a3566]">
                    {room.zh}
                    <span className="ml-1 font-normal text-[#8a7aa3]">
                      {room.en} · {guaInfo(p.dir).dirZh}
                    </span>
                  </span>
                  <button
                    type="button"
                    data-testid={`photo-${p.key}`}
                    onClick={() => {
                      setPhotoTarget(p.key);
                      fileRef.current?.click();
                    }}
                    className="shrink-0 rounded-full border-2 border-[#e6d7ff] bg-white px-2.5 py-1 text-[11px] font-bold text-[#6b4f8f]"
                  >
                    {url ? <BiInline en="Retake" zh="换一张" /> : <BiInline en="📷 Add photo" zh="📷 加照片" />}
                  </button>
                  {url && (
                    <button
                      type="button"
                      aria-label="Remove photo"
                      onClick={() => {
                        setPhotos((prev) => {
                          const next = { ...prev };
                          delete next[p.key];
                          return next;
                        });
                        setAi(null);
                      }}
                      className="shrink-0 text-xs font-black text-[#b9aed0]"
                    >
                      ✕
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            data-testid="bazhai-photo-input"
            className="hidden"
            onChange={(e) => {
              const key = photoTarget;
              const file = e.target.files?.[0];
              e.target.value = "";
              if (key) void takePhoto(file, key);
            }}
          />
        </section>
      )}

      <button
        type="button"
        data-testid="bazhai-run"
        disabled={!house || !hasDoor || aiBusy}
        onClick={() => void run()}
        className="rounded-full bg-[#ff8fb1] px-6 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#e06690] active:translate-y-1 active:shadow-[0_2px_0_#e06690] disabled:opacity-40"
      >
        {aiBusy ? (
          <BiInline en="👀 Reading photos and grid…" zh="👀 正在看照片和格子…" />
        ) : placedList.some((p) => photos[p.key]) ? (
          <BiInline en="🔍 Read this home (with photos)" zh="🔍 看这套房（含照片）" />
        ) : (
          <BiInline en="🔍 Read this home" zh="🔍 看这套房" />
        )}
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
                  {aiCellFor(r.key) && (
                    <div className="mt-2 rounded-xl bg-white/75 p-2">
                      <p className="text-[10px] font-black text-[#b48cff]">
                        📷 <BiInline en="From your photo" zh="照片里看到的" />
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[#4a3566]">{aiCellFor(r.key)!.en}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-[#8a7aa3]">{aiCellFor(r.key)!.zh}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {aiBusy && (
            <p className="rounded-xl bg-[#f3eefc] px-3 py-2 text-center text-[11px] font-bold text-[#6b4f8f]" data-testid="homegrid-busy">
              <BiInline en="👀 Reading your photos… (10–30s)" zh="👀 正在看照片…（10–30 秒）" />
            </p>
          )}
          {aiError && (
            <p className="rounded-xl bg-[#ffe0e0] px-3 py-2 text-[11px] font-bold text-[#c0392b]" data-testid="homegrid-error">
              {aiError}
            </p>
          )}

          {ai && (
            <div className="flex flex-col gap-2" data-testid="homegrid-ai">
              <div className="rounded-2xl bg-[#f8f4ff] p-3">
                <p className="mb-1 text-xs font-black text-[#6b4f8f]">
                  <BiInline en="Whole home · from the photos" zh="整屋 · 按照片看" />
                </p>
                <p className="text-[11px] leading-relaxed text-[#4a3566]">{ai.overall.en}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[#8a7aa3]">{ai.overall.zh}</p>
              </div>

              {ai.keep.length > 0 && (
                <div className="rounded-2xl bg-[#eafaf0] p-3">
                  <p className="mb-1 text-xs font-extrabold text-[#2e7d4f]">
                    <Bi en="✅ Keep these" zh="这几个可以留" />
                  </p>
                  <ul className="flex flex-col gap-1">
                    {ai.keep.map((k) => (
                      <li key={k.en} className="text-[11px] leading-snug text-[#2f5c44]">
                        {k.en}
                        <span className="mt-0.5 block text-[10px] text-[#6b8a78]">{k.zh}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ai.change.length > 0 && (
                <div className="rounded-2xl bg-[#fff7e0] p-3">
                  <p className="mb-1 text-xs font-extrabold text-[#8a6d00]">
                    <Bi en="🔧 Change these" zh="这几个可以改" />
                  </p>
                  <ul className="flex flex-col gap-1">
                    {ai.change.map((k) => (
                      <li key={k.en} className="text-[11px] leading-snug text-[#6b5518]">
                        {k.en}
                        <span className="mt-0.5 block text-[10px] text-[#a08a4f]">{k.zh}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl bg-[#fff5fb] p-3">
                <p className="mb-1 text-[10px] font-black text-[#6b4f8f]">
                  <BiInline en="👉 If you only do one thing tonight" zh="今晚只做一件事" />
                </p>
                <p className="text-[11px] font-bold leading-snug text-[#4a3566]">{ai.focus.en}</p>
                <p className="mt-0.5 text-[10px] text-[#8a7aa3]">{ai.focus.zh}</p>
              </div>
            </div>
          )}

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
