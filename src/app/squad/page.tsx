"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bi, BiInline } from "@/components/Bi";
import { computeChart } from "@/lib/bazi";
import { createRoom, roomExists, validCode } from "@/lib/squad";
import { useSavedProfile } from "@/lib/useClientValues";

export default function SquadPage() {
  const router = useRouter();
  const profile = useSavedProfile();
  const chart = profile ? computeChart(profile) : null;
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState("");

  if (!profile || !chart) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-10 text-center">
        <p className="text-5xl">🧑‍🚀</p>
        <p className="font-bold text-[#6b4f8f]">
          <Bi en="Enter your birthday first." zh="先输入生日，才能组五行小队。" />
        </p>
        <Link href="/" className="rounded-full bg-[#ff8fb1] px-6 py-3 font-extrabold text-white">
          <BiInline en="Go" zh="去输入" />
        </Link>
      </main>
    );
  }

  async function create() {
    if (busy) return;
    setBusy("create");
    setError("");
    try {
      const room = await createRoom(profile!.name);
      router.push(`/squad/${room}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the room · 创建失败");
      setBusy(null);
    }
  }

  async function join() {
    if (busy) return;
    if (!validCode(code)) {
      setError("The room code is 4 digits · 房间号是 4 位数字");
      return;
    }
    setBusy("join");
    setError("");
    try {
      const ok = await roomExists(code);
      if (!ok) {
        setError("Room not found · 找不到这个房间，检查一下号码");
        setBusy(null);
        return;
      }
      router.push(`/squad/${code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Join failed · 加入失败");
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-4 py-6">
      <header className="flex items-center gap-3">
        <Link href="/" className="text-sm font-bold text-[#8a7aa3] underline">
          <BiInline en="← Back" zh="← 返回" />
        </Link>
        <h1 className="flex-1 text-center text-xl font-extrabold text-[#6b4f8f]">
          <Bi en="🧑‍🚀 Five-Element Squad" zh="🧑‍🚀 五行小队" />
        </h1>
        <span className="w-10" />
      </header>

      <p className="text-center text-sm text-[#8a7aa3]">
        <Bi en="Team up with 3–5 friends and check your element mix." zh="3–5 个人组一队，看你们的五行齐不齐。" />
      </p>

      <section className="rounded-[2rem] border-4 border-white bg-[#fff5fb] p-5 shadow-[0_8px_24px_rgba(255,143,177,0.25)]">
        <h2 className="text-lg font-extrabold text-[#6b4f8f]">
          <Bi en="🆕 Create a room" zh="🆕 创建房间" />
        </h2>
        <p className="mt-1 text-xs text-[#8a7aa3]">
          <Bi
            en="Get a 4-digit room code and a group QR code. Friends can scan it to join."
            zh="生成 4 位房间号 + 群二维码，朋友扫码就能加入。"
          />
        </p>
        <button
          type="button"
          data-testid="create-room"
          onClick={() => void create()}
          disabled={busy !== null}
          className="mt-3 w-full rounded-full bg-[#ff8fb1] px-5 py-4 font-extrabold text-white shadow-[0_6px_0_#e06690] active:translate-y-1 active:shadow-[0_2px_0_#e06690] disabled:opacity-60"
        >
          {busy === "create" ? (
            <BiInline en="⏳ Opening the room…" zh="⏳ 正在开房…" />
          ) : (
            <BiInline en="🚀 Create a five-element squad" zh="🚀 创建五行小队" />
          )}
        </button>
      </section>

      <section className="rounded-[2rem] border-4 border-white bg-white p-5 shadow-[0_8px_24px_rgba(155,140,255,0.25)]">
        <h2 className="text-lg font-extrabold text-[#6b4f8f]">
          <Bi en="🔢 Join someone else's room" zh="🔢 加入别人的房间" />
        </h2>
        <div className="mt-3 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            placeholder="1234"
            data-testid="room-code-input"
            className="w-full rounded-2xl border-2 border-[#e6d7ff] bg-white px-4 py-3 text-center text-2xl font-black tracking-[0.3em] outline-none focus:border-[#b48cff]"
          />
          <button
            type="button"
            data-testid="join-room"
            onClick={() => void join()}
            disabled={busy !== null}
            className="shrink-0 rounded-2xl bg-[#b48cff] px-5 font-extrabold text-white shadow-[0_5px_0_#8f66e0] active:translate-y-1 active:shadow-[0_2px_0_#8f66e0] disabled:opacity-60"
          >
            <BiInline en="Join" zh="加入" />
          </button>
        </div>
      </section>

      {error && (
        <p className="rounded-xl bg-[#ffe0e0] px-3 py-2 text-sm font-bold text-[#c0392b]" data-testid="squad-error">
          {error}
        </p>
      )}

      <p className="mt-auto text-center text-xs text-[#b9aed0]">
        <BiInline en="Just for fun 🎉" zh="仅供娱乐" />
      </p>
    </main>
  );
}
