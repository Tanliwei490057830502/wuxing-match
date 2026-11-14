import CharacterAvatar from "@/components/CharacterAvatar";
import FourPillars from "@/components/FourPillars";
import LayeredPentagons from "@/components/LayeredPentagons";
import {
  DAY_MASTER_TYPES,
  ELEMENT_INFO,
  GENDER_INFO,
  stemText,
  type Chart,
  type Gender,
} from "@/lib/bazi";

export default function ElementCard({
  name,
  gender,
  chart,
}: {
  name: string;
  gender: Gender | "";
  chart: Chart;
}) {
  const info = ELEMENT_INFO[chart.element];
  const type = DAY_MASTER_TYPES[chart.dayMaster];
  return (
    <section
      data-testid="element-card"
      className="rounded-[2rem] border-4 border-white p-5 shadow-[0_8px_24px_rgba(155,140,255,0.25)]"
      style={{ background: info.soft }}
    >
      <p className="text-sm font-bold text-[#8a7aa3]">{name} 的五行类型 · Your element type</p>
      <CharacterAvatar
        index={chart.dayMaster}
        priority
        className="mx-auto mt-3 block h-auto w-full max-w-[240px] drop-shadow-[0_6px_14px_rgba(155,140,255,0.3)]"
      />
      <h2 className="mt-4 text-center text-2xl font-extrabold" style={{ color: info.color }}>
        {stemText(chart.dayMaster)}{info.zh} · {type.title}
      </h2>
      <p className="text-center text-sm font-bold text-[#6b4f8f]">
        {info.en} · {type.en}
      </p>
      <p className="mt-3 text-center text-base">{type.traits}</p>
      <p className="text-center text-sm text-[#8a7aa3]">{type.traitsEn}</p>

      <div className="mt-4 flex flex-col items-center gap-2">
        {gender && (
          <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-[#6b4f8f]">
            {GENDER_INFO[gender].emoji} {GENDER_INFO[gender].chart} · {GENDER_INFO[gender].en}
          </span>
        )}
        <FourPillars pillars={chart.pillars} />
      </div>

      <div className="mt-4 rounded-2xl bg-white/70 p-2">
        <LayeredPentagons chart={chart} />
      </div>
    </section>
  );
}
