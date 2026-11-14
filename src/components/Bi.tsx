import type { ReactNode } from "react";

/**
 * 双语（团队最终定的方向）：英文为主体，中文小字在下。
 * Bilingual: English first, smaller Chinese underneath.
 */
export function Bi({
  en,
  zh,
  className = "",
  zhClassName = "",
}: {
  en: ReactNode;
  zh?: ReactNode;
  className?: string;
  zhClassName?: string;
}) {
  return (
    <span className={`block ${className}`}>
      <span className="block">{en}</span>
      {zh ? (
        <span className={`mt-0.5 block text-[0.78em] font-normal text-[#8a7aa3] ${zhClassName}`}>{zh}</span>
      ) : null}
    </span>
  );
}

/** 同一行：英文 + 中文小字 */
export function BiInline({ en, zh, className = "" }: { en: ReactNode; zh?: ReactNode; className?: string }) {
  return (
    <span className={className}>
      {en}
      {zh ? <span className="ml-1 text-[0.8em] font-normal opacity-70">{zh}</span> : null}
    </span>
  );
}
