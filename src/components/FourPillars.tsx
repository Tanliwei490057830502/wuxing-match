import { BRANCHES, BRANCH_ELEMENT, ELEMENT_INFO, STEMS, STEM_ELEMENT, type Pillar } from "@/lib/bazi";

/** 四柱排成田字格 · the four pillars in a 2×2 田字格 */
export default function FourPillars({
  pillars,
}: {
  pillars: { label: string; pillar: Pillar }[];
}) {
  const zh = (label: string) => label.split(" ")[0]; // "年 Year" -> "年"

  return (
    <div
      data-testid="four-pillars"
      className="mx-auto grid w-full max-w-[300px] grid-cols-2 overflow-hidden rounded-3xl border-2 border-[#e0d3f7] bg-white/90"
    >
      {pillars.map(({ label, pillar }, i) => {
        const stemEl = STEM_ELEMENT[pillar.stem];
        const branchEl = BRANCH_ELEMENT[pillar.branch];
        const isDay = zh(label) === "日";
        return (
          <div
            key={label}
            className={`relative aspect-square ${i % 2 === 0 ? "border-r-2" : ""} ${i < 2 ? "border-b-2" : ""} border-[#e0d3f7] ${
              isDay ? "bg-[#fff5fb]" : ""
            }`}
          >
            {/* 田字格的虚线十字 */}
            <span aria-hidden className="absolute inset-x-3 top-1/2 border-t border-dashed border-[#eadff9]" />
            <span aria-hidden className="absolute inset-y-3 left-1/2 border-l border-dashed border-[#eadff9]" />

            <span className="absolute top-1.5 left-2 text-[11px] font-black tracking-wider text-[#b9aed0]">
              {zh(label)}
            </span>
            {isDay && (
              <span className="absolute top-1.5 right-2 rounded-full bg-[#ff5c93] px-1.5 py-0.5 text-[9px] font-black text-white">
                我
              </span>
            )}

            <div className="relative z-10 flex h-full flex-col items-center justify-center leading-none">
              <span className="text-[34px] font-black" style={{ color: ELEMENT_INFO[stemEl].color }}>
                {STEMS[pillar.stem]}
              </span>
              <span className="mt-2 text-[34px] font-black" style={{ color: ELEMENT_INFO[branchEl].color }}>
                {BRANCHES[pillar.branch]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
