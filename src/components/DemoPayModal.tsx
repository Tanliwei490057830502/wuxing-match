"use client";

import { useState } from "react";
import { Bi, BiInline } from "@/components/Bi";

/** Simulated checkout. Clearly labelled demo — nothing is charged. */
export default function DemoPayModal({
  title,
  price,
  onPaid,
  onClose,
}: {
  title: string;
  price: string;
  onPaid: () => void;
  onClose: () => void;
}) {
  const [paying, setPaying] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid="pay-modal"
    >
      <div className="w-full max-w-sm rounded-[2rem] border-4 border-white bg-white p-5 shadow-xl">
        <p className="mb-3 rounded-xl bg-[#fff3cd] px-3 py-2 text-center text-xs font-bold text-[#8a6d00]">
          <Bi en="⚠️ Demo only — no real money is charged" zh="⚠️ 演示付款 · 不会真的扣钱" />
        </p>
        <p className="text-center text-sm text-[#8a7aa3]">{title}</p>
        <p className="my-2 text-center text-4xl font-black text-[#ff5c93]">{price}</p>
        <div className="my-4 flex flex-col gap-2 text-sm">
          {[
            { en: "💳 Credit card", zh: "💳 信用卡" },
            { en: "📱 Touch 'n Go eWallet", zh: "" },
            { en: "🏦 FPX online banking", zh: "🏦 FPX 网银" },
          ].map((m, i) => (
            <label key={m.en} className="flex items-center gap-2 rounded-2xl border-2 border-[#eee6fb] px-3 py-2">
              <input type="radio" name="method" defaultChecked={i === 0} />
              {m.zh ? <BiInline en={m.en} zh={m.zh} /> : m.en}
            </label>
          ))}
        </div>
        <button
          type="button"
          data-testid="pay-confirm"
          disabled={paying}
          onClick={() => {
            setPaying(true);
            setTimeout(() => {
              onPaid();
              setPaying(false);
            }, 700);
          }}
          className="w-full rounded-full bg-[#ff8fb1] px-6 py-4 text-lg font-extrabold text-white shadow-[0_6px_0_#e06690] disabled:opacity-60"
        >
          {paying ? (
            <BiInline en="Processing…" zh="处理中…" />
          ) : (
            <BiInline en={`Pay ${price} (demo)`} zh={`确认支付 ${price}（演示）`} />
          )}
        </button>
        <button type="button" onClick={onClose} className="mt-3 w-full text-sm font-bold text-[#8a7aa3] underline">
          <BiInline en="Cancel" zh="取消" />
        </button>
      </div>
    </div>
  );
}
