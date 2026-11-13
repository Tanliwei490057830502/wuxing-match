"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QrCode({ value }: { value: string }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { margin: 1, width: 240, color: { dark: "#4a3566", light: "#ffffff" } })
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setSrc("");
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  if (!src) {
    return <div className="h-[200px] w-[200px] animate-pulse rounded-2xl bg-[#f3eefc]" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="配对二维码 · Match QR code" width={200} height={200} className="rounded-2xl" />;
}
