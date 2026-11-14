"use client";

// 家居分析：两条腿。
// 「方位八宅」= 罗盘 + 九宫格 + 八宅查表（确定性的）；
// 「拍照看布置」= 拍房间照片让 AI 看（只说看得见的）。
// 两个 tab 各渲染各的，外层只负责标题和切换。

import Link from "next/link";
import { useState } from "react";
import { Bi, BiInline } from "@/components/Bi";
import BazhaiClient from "./BazhaiClient";
import FengshuiClient from "./FengshuiClient";

export default function FengshuiTabs() {
  const [tab, setTab] = useState<"bazhai" | "photo">("bazhai");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <header className="flex items-center gap-3">
        <Link href="/" className="text-sm font-bold text-[#8a7aa3] underline">
          <BiInline en="← Back" zh="返回" />
        </Link>
        <h1 className="flex-1 text-center text-xl font-extrabold text-[#6b4f8f]">
          <Bi en="🏠 Home analysis" zh="家居分析" />
        </h1>
        <span className="w-10" />
      </header>

      <div className="grid grid-cols-2 gap-1 rounded-full bg-[#f6f1ff] p-1" role="tablist">
        <button
          type="button"
          role="tab"
          data-testid="tab-bazhai"
          aria-selected={tab === "bazhai"}
          onClick={() => setTab("bazhai")}
          className={`rounded-full px-3 py-2 text-sm font-extrabold transition ${
            tab === "bazhai" ? "bg-white text-[#6b4f8f] shadow" : "text-[#8a7aa3]"
          }`}
        >
          🧭 <BiInline en="Direction" zh="方位八宅" />
        </button>
        <button
          type="button"
          role="tab"
          data-testid="tab-photo"
          aria-selected={tab === "photo"}
          onClick={() => setTab("photo")}
          className={`rounded-full px-3 py-2 text-sm font-extrabold transition ${
            tab === "photo" ? "bg-white text-[#6b4f8f] shadow" : "text-[#8a7aa3]"
          }`}
        >
          📷 <BiInline en="Photos" zh="拍照看布置" />
        </button>
      </div>

      {tab === "bazhai" ? <BazhaiClient /> : <FengshuiClient />}
    </main>
  );
}
