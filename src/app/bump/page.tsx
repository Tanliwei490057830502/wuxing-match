"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import CharacterAvatar from "@/components/CharacterAvatar";
import { computeChart, resultUrl } from "@/lib/bazi";
import { listenForBump, motionSupported, requestMotionPermission, sendBumpAndWait } from "@/lib/bump";
import { firebaseReady } from "@/lib/firebase";
import { useOrigin, useSavedProfile } from "@/lib/useClientValues";

type Phase = "idle" | "armed" | "sending" | "none" | "error";

export default function BumpPage() {
  const router = useRouter();
  const profile = useSavedProfile();
  const origin = useOrigin();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const stopRef = useRef<(() => void) | null>(null);
  const busy = useRef(false);

  useEffect(() => () => stopRef.current?.(), []);

  const chart = profile ? computeChart(profile) : null;

  async function bump() {
    if (!profile || busy.current) return;
    busy.current = true;
    if (navigator.vibrate) navigator.vibrate(80);
    setPhase("sending");
    try {
      const partner = await sendBumpAndWait(profile);
      if (partner) {
        stopRef.current?.();
        router.push(resultUrl(origin, partner, profile) + "&via=bump");
        return;
      }
      setPhase("none");
    } catch {
      setError("连不上服务器，请检查网络。· Can't reach the server.");
      setPhase("error");
    } finally {
      busy.current = false;
    }
  }

  async function arm() {
    const ok = await requestMotionPermission();
    if (!ok) {
      setError("没有动作感应权限，请用下面的「一起按」按钮。· Motion access denied — use the button below.");
      setPhase("error");
      return;
    }
    stopRef.current?.();
    stopRef.current = listenForBump(() => void bump());
    setPhase("armed");
  }

  if (!profile || !chart) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <p className="text-5xl">💥</p>
        <p className="font-bold text-[#6b4f8f]">
          先输入你的生日，才能对对碰。
          <br />
          Enter your birthday first.
        </p>
        <Link href="/" className="rounded-full bg-[#ff8fb1] px-6 py-3 font-extrabold text-white">
          去输入 · Go
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6 text-center">
      <header className="flex items-center gap-3">
        <Link href="/" className="text-sm font-bold text-[#8a7aa3] underline">
          ← 返回
        </Link>
        <h1 className="flex-1 text-2xl font-extrabold text-[#6b4f8f]">💥 对对碰 · Bump to match</h1>
        <span className="w-10" />
      </header>

      {!firebaseReady && (
        <p className="rounded-2xl bg-[#fff3cd] p-3 text-sm font-bold text-[#8a6d00]" data-testid="firebase-missing">
          ⚠️ Firebase 还没设置好（src/lib/firebase.ts）。· Firebase is not configured yet.
        </p>
      )}

      <section className="flex flex-col items-center gap-3 rounded-[2rem] border-4 border-white bg-[#fff5fb] p-5 shadow-[0_8px_24px_rgba(255,143,177,0.25)]">
        <CharacterAvatar
          index={chart.dayMaster}
          className={`h-auto w-40 rounded-3xl ${phase === "armed" ? "animate-bounce" : ""}`}
        />
        <p className="font-bold text-[#6b4f8f]">{profile.name}</p>

        {phase === "idle" && (
          <>
            <p className="text-sm text-[#8a7aa3]">
              两个人都打开这一页，按下面的按钮，然后把手机<b>头对头碰一下</b>！
              <br />
              Both open this page, tap the button, then knock phone tops together!
            </p>
            <button
              type="button"
              data-testid="arm"
              disabled={!firebaseReady}
              onClick={() => void arm()}
              className="w-full rounded-full bg-[#ff8fb1] px-6 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#e06690] disabled:opacity-50"
            >
              💥 准备对对碰 · Ready
            </button>
          </>
        )}

        {phase === "armed" && (
          <p className="text-lg font-extrabold text-[#ff5c93]" data-testid="armed">
            📱💥📱 现在碰一下！
            <br />
            <span className="text-sm text-[#8a7aa3]">Knock the phones together now (like a high-five)</span>
          </p>
        )}

        {phase === "sending" && (
          <p className="text-lg font-extrabold text-[#6b4f8f]" data-testid="sending">
            🔍 正在找对方… · Looking for your partner…
          </p>
        )}

        {phase === "none" && (
          <>
            <p className="font-bold text-[#c0392b]" data-testid="no-partner">
              😅 没找到对方。两个人要同时碰哦！
              <br />
              <span className="text-sm">No partner found — bump at the same moment.</span>
            </p>
            <button
              type="button"
              onClick={() => setPhase(stopRef.current ? "armed" : "idle")}
              className="rounded-full bg-[#b48cff] px-6 py-3 font-extrabold text-white"
            >
              🔁 再试一次 · Try again
            </button>
          </>
        )}

        {phase === "error" && (
          <p className="rounded-xl bg-[#ffe0e0] px-3 py-2 text-sm text-[#c0392b]" data-testid="bump-error">
            {error}
          </p>
        )}
      </section>

      {/* fallback: both tap at the same time */}
      <section className="rounded-2xl border-2 border-dashed border-[#d9cfe6] p-3 text-sm text-[#8a7aa3]">
        <p className="mb-2">
          {motionSupported() ? "碰了没反应？" : "这台设备没有动作感应。"}两个人<b>同时</b>按这个按钮也可以：
          <br />
          No reaction? Both tap this at the same moment:
        </p>
        <button
          type="button"
          data-testid="tap-bump"
          disabled={!firebaseReady || phase === "sending"}
          onClick={() => void bump()}
          className="rounded-full border-2 border-[#b48cff] bg-white px-5 py-2 font-extrabold text-[#6b4f8f] disabled:opacity-50"
        >
          👆 一起按 · Tap together
        </button>
      </section>

      <p className="text-xs text-[#b9aed0]">
        生日只会在配对的几秒内经过服务器，之后自动删除。· Your birthday is only sent for a few seconds, then deleted.
      </p>
    </main>
  );
}
