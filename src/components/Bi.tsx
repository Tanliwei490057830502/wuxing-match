import type { ReactNode } from "react";

/**
 * 双语显示：英文在上、中文小字在下（团队定的「英文为主体」）。
 * Bilingual: English first, smaller Chinese underneath.
 */
export function Bi({
  en,
  zh,
  className = "",
  zhClassName = "",
}: {
  en: ReactNode;
  zh: ReactNode;
  className?: string;
  zhClassName?: string;
}) {
  return (
    <span className={`block ${className}`}>
      <span className="block">{en}</span>
      <span className={`mt-0.5 block text-[0.78em] font-normal text-[#8a7aa3] ${zhClassName}`}>{zh}</span>
    </span>
  );
}

/** 同一行：英文 + 后面跟小字中文，适合按钮和很窄的标签 */
export function BiInline({ en, zh, className = "" }: { en: ReactNode; zh: ReactNode; className?: string }) {
  return (
    <span className={className}>
      {en}
      <span className="ml-1 text-[0.8em] font-normal opacity-70">{zh}</span>
    </span>
  );
}
