"use client";

import { useState } from "react";
import { GENDER_INFO, HOURS, parseTypedDate, type Gender, type Profile } from "@/lib/bazi";

export default function ProfileForm({
  submitLabel,
  submitLabelEn,
  initial,
  onSubmit,
}: {
  submitLabel?: string;
  submitLabelEn?: string;
  initial?: Profile | null;
  onSubmit: (p: Profile) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [gender, setGender] = useState<Gender | "">(initial?.gender ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [hour, setHour] = useState(initial?.hour ?? "");
  const [error, setError] = useState("");
  const preview = parseTypedDate(date);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim())
          return setError("Please enter a nickname · 请输入昵称");
        if (!gender) return setError("Please pick male or female · 请选择性别");
        const parsed = parseTypedDate(date);
        if (!parsed)
          return setError("Try a date like 2000-01-01 (year 1900–2100) · 日期看不懂，试试 2000-01-01");
        setError("");
        onSubmit({ name: name.trim().slice(0, 20), gender, date: parsed, hour });
      }}
    >
      <label className="flex flex-col gap-1">
        <span className="text-sm font-bold text-[#6b4f8f]">
          Nickname <span className="text-xs font-normal text-[#8a7aa3]">昵称</span>
        </span>
        <span className="text-xs text-[#8a7aa3]">
          Display only. It does not change your chart.
          <span className="ml-1 text-[10px]">只用来显示，不影响八字</span>
        </span>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ming"
          maxLength={20}
          className="rounded-2xl border-2 border-[#e6d7ff] bg-white px-4 py-3 text-lg outline-none focus:border-[#b48cff]"
        />
      </label>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-bold text-[#6b4f8f]">
          Gender <span className="text-xs font-normal text-[#8a7aa3]">性别</span>
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {(["m", "f"] as Gender[]).map((g) => {
            const info = GENDER_INFO[g];
            const active = gender === g;
            return (
              <button
                key={g}
                type="button"
                data-testid={`gender-${g}`}
                aria-pressed={active}
                onClick={() => setGender(g)}
                className={`rounded-2xl border-2 px-4 py-3 text-lg font-bold transition ${
                  active
                    ? g === "m"
                      ? "border-[#4aa8ff] bg-[#dcefff] text-[#2f7fd1]"
                      : "border-[#ff8fb1] bg-[#ffe3ee] text-[#d9507f]"
                    : "border-[#e6d7ff] bg-white text-[#8a7aa3]"
                }`}
              >
                {info.emoji} {info.en}
                <span className="ml-1 text-sm opacity-70">{info.zh}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-bold text-[#6b4f8f]">
          Birth date <span className="text-xs font-normal text-[#8a7aa3]">出生日期</span>
        </span>
        <span className="text-xs text-[#8a7aa3]">
          Just type it: 2000-01-01, 2000/1/1 or 20000101.
          <span className="ml-1 text-[10px]">直接输入就行</span>
        </span>
        <input
          name="date"
          type="text"
          inputMode="numeric"
          autoComplete="bday"
          placeholder="2000-01-01"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-2xl border-2 border-[#e6d7ff] bg-white px-4 py-3 text-lg outline-none focus:border-[#b48cff]"
        />
        {date.trim() !== "" && (
          <span
            data-testid="date-preview"
            className={`text-sm font-bold ${preview ? "text-[#2e9e63]" : "text-[#c0392b]"}`}
          >
            {preview
              ? `✓ ${Number(preview.slice(0, 4))}-${preview.slice(5, 7)}-${preview.slice(8, 10)}`
              : "… not a valid date yet · 还看不懂这个日期"}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-bold text-[#6b4f8f]">
          Birth hour <span className="text-xs font-normal text-[#8a7aa3]">出生时辰（可选）</span>
        </span>
        <select
          name="hour"
          value={hour}
          onChange={(e) => setHour(e.target.value)}
          className="rounded-2xl border-2 border-[#e6d7ff] bg-white px-4 py-3 text-lg outline-none focus:border-[#b48cff]"
        >
          {HOURS.map((h) => (
            <option key={h.value} value={h.value}>
              {h.value === "" ? "Not sure · 不知道" : h.label}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="rounded-xl bg-[#ffe0e0] px-3 py-2 text-sm text-[#c0392b]">{error}</p>}

      <button
        type="submit"
        className="mt-1 rounded-full bg-[#ff8fb1] px-6 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#e06690] transition active:translate-y-1 active:shadow-[0_2px_0_#e06690]"
      >
        {submitLabelEn ?? "Show my element"}
        <span className="mt-0.5 block text-[11px] font-bold opacity-85">
          {submitLabel ?? "看我的五行"}
        </span>
      </button>
    </form>
  );
}
