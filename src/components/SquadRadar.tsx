import { ELEMENTS, ELEMENT_INFO, type Element } from "@/lib/bazi";

const SIZE = 300;
const C = SIZE / 2;
const R = 96;

function point(i: number, r: number) {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  return [C + r * Math.cos(angle), C + r * Math.sin(angle)] as const;
}

/** 团队五行雷达 · team element radar (count of people per element) */
export default function SquadRadar({ elements }: { elements: Element[] }) {
  const counts = ELEMENTS.reduce(
    (acc, el) => ({ ...acc, [el]: elements.filter((e) => e === el).length }),
    {} as Record<Element, number>,
  );
  const max = Math.max(2, ...ELEMENTS.map((el) => counts[el]));

  return (
    <figure className="flex flex-col items-center">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[300px]" role="img" aria-label="Team element radar · 团队五行雷达图">
        <defs>
          <radialGradient id="squadGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#b48cff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#b48cff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={R + 12} fill="url(#squadGlow)" />
        {[1 / 3, 2 / 3, 1].map((f) => (
          <polygon
            key={f}
            points={ELEMENTS.map((_, i) => point(i, R * f).join(",")).join(" ")}
            fill={f === 1 ? "#ffffff" : "none"}
            stroke="#e9e1f7"
            strokeWidth={1}
          />
        ))}
        {ELEMENTS.map((_, i) => {
          const [x, y] = point(i, R);
          return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="#e9e1f7" strokeWidth={1} />;
        })}

        <polygon
          points={ELEMENTS.map((el, i) => point(i, (R * Math.max(0.12, counts[el] / max)) as number).join(",")).join(" ")}
          fill="#ff8fb1"
          fillOpacity={0.28}
          stroke="#ff5c93"
          strokeWidth={3}
          strokeLinejoin="round"
          style={{ transition: "all 600ms cubic-bezier(.2,.8,.2,1)" }}
        />

        {ELEMENTS.map((el, i) => {
          const [x, y] = point(i, R + 30);
          const info = ELEMENT_INFO[el];
          const n = counts[el];
          return (
            <g key={el}>
              <circle
                cx={x}
                cy={y}
                r={19}
                fill={n > 0 ? info.soft : "#f6f1ff"}
                stroke={n > 0 ? "none" : "#e0d3f7"}
                strokeDasharray={n > 0 ? undefined : "4 3"}
                strokeWidth={2}
              />
              <text x={x} y={y - 1} textAnchor="middle" fontSize="14">
                {info.emoji}
              </text>
              <text x={x} y={y + 13} textAnchor="middle" fontSize="10" fontWeight={800} fill="#4a3566">
                {info.zh}
                {n > 0 ? ` ${n}` : ""}
              </text>
              {n === 0 && (
                <text x={x} y={y + 30} textAnchor="middle" fontSize="9" fontWeight={700} fill="#c0392b">
                  缺
                </text>
              )}
            </g>
          );
        })}

        <text x={C} y={C - 4} textAnchor="middle" fontSize="26" fontWeight={900} fill="#6b4f8f">
          {elements.length}
        </text>
        <text x={C} y={C + 18} textAnchor="middle" fontSize="11" fontWeight={700} fill="#8a7aa3">
          members · 人
        </text>
      </svg>
      <figcaption className="mt-1 flex flex-wrap justify-center gap-1">
        {ELEMENTS.filter((el) => !elements.includes(el)).map((el) => (
          <span key={el} className="rounded-full bg-[#ffe9e9] px-2 py-0.5 text-[11px] font-bold text-[#c0392b]">
            Missing {ELEMENT_INFO[el].en} · 缺{ELEMENT_INFO[el].zh}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
