import { ELEMENTS, ELEMENT_INFO, type Chart, type Element } from "@/lib/bazi";

export function chartPercents(chart: Chart): Record<Element, number> {
  return percents(chart);
}

export type PentagonSeries = {
  name: string;
  values: Record<Element, number>; // percentages
  color: string;
  dashed?: boolean;
  dash?: string; // custom dash pattern, e.g. "2 3"
};

// Two-person colours (validated for colour-blind separation)
export const SERIES_COLORS = ["#e0457b", "#3d8fe0"];

const SIZE = 260;
const C = SIZE / 2;
const R = 88; // outer radius

// Vertices go round the 相生 cycle: 木 → 火 → 土 → 金 → 水
function point(i: number, r: number) {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  return [C + r * Math.cos(angle), C + r * Math.sin(angle)] as const;
}

function percents(chart: Chart): Record<Element, number> {
  const total = ELEMENTS.reduce((s, el) => s + chart.counts[el], 0) || 1;
  const out = {} as Record<Element, number>;
  for (const el of ELEMENTS) out[el] = Math.round((chart.counts[el] / total) * 100);
  return out;
}

export default function ElementPentagon({
  series,
  compact = false,
  scaleMax: fixedMax,
}: {
  series: PentagonSeries[];
  compact?: boolean;
  scaleMax?: number;
}) {
  const data = series.map((s) => ({ ...s, pct: s.values }));
  const maxPct = Math.max(...data.flatMap((d) => ELEMENTS.map((el) => d.pct[el])));
  const scaleMax = fixedMax ?? Math.max(50, Math.ceil(maxPct / 10) * 10);
  const rings = [1 / 3, 2 / 3, 1];

  return (
    <figure className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={compact ? "w-full" : "w-full max-w-[280px]"}
        role="img"
        aria-label={`五行五角图 · Five elements chart: ${data
          .map((d) => `${d.name} ` + ELEMENTS.map((el) => `${ELEMENT_INFO[el].zh}${d.pct[el]}%`).join(" "))
          .join("; ")}`}
      >
        {/* grid */}
        {rings.map((f) => (
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

        {/* data shapes */}
        {data.map((d) => (
          <polygon
            key={d.name + d.color}
            points={ELEMENTS.map((el, i) => point(i, (R * d.pct[el]) / scaleMax).join(",")).join(" ")}
            fill={d.color}
            fillOpacity={data.length > 2 ? 0.08 : data.length > 1 ? 0.18 : 0.28}
            stroke={d.color}
            strokeWidth={compact ? 5 : 2}
            strokeDasharray={d.dash ?? (d.dashed ? "5 4" : undefined)}
            strokeLinejoin="round"
          />
        ))}
        {data.map((d) =>
          ELEMENTS.map((el, i) => {
            const [x, y] = point(i, (R * d.pct[el]) / scaleMax);
            return (
              <g key={d.name + d.color + el}>
                <circle cx={x} cy={y} r={compact ? 7 : 4} fill={d.color} stroke="#ffffff" strokeWidth={2} />
                {/* bigger invisible hover target with a tooltip */}
                <circle cx={x} cy={y} r={11} fill="transparent">
                  <title>{`${d.name} · ${ELEMENT_INFO[el].zh} ${ELEMENT_INFO[el].en}: ${d.pct[el]}%`}</title>
                </circle>
              </g>
            );
          }),
        )}

        {/* vertex labels */}
        {ELEMENTS.map((el, i) => {
          if (compact) {
            const [x, y] = point(i, R + 20);
            return (
              <text key={el} x={x} y={y + 9} textAnchor="middle" fontSize="28" fontWeight={800} fill="#4a3566">
                {ELEMENT_INFO[el].zh}
              </text>
            );
          }
          const [x, y] = point(i, R + 26);
          const info = ELEMENT_INFO[el];
          return (
            <g key={el}>
              <circle cx={x} cy={y} r={17} fill={info.soft} stroke="#ffffff" strokeWidth={2} />
              <text x={x} y={y - 2} textAnchor="middle" fontSize="13">
                {info.emoji}
              </text>
              <text x={x} y={y + 12} textAnchor="middle" fontSize="10" fontWeight={700} fill="#4a3566">
                {info.zh}
              </text>
            </g>
          );
        })}
      </svg>

      {/* legend + table view (numbers never colour-only) */}
      {!compact && (
      <figcaption className="mt-1 w-full">
        <table className="w-full text-center text-sm">
          <thead>
            <tr className="text-[#8a7aa3]">
              <th className="text-left font-bold"></th>
              {ELEMENTS.map((el) => (
                <th key={el} className="font-bold">
                  {ELEMENT_INFO[el].zh}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.name + d.color} className="text-[#4a3566]">
                <td className="max-w-[90px] truncate py-0.5 text-left font-bold">
                  <svg width="18" height="8" className="mr-1 inline-block align-middle" aria-hidden>
                    <line
                      x1="1"
                      y1="4"
                      x2="17"
                      y2="4"
                      stroke={d.color}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={d.dash ?? (d.dashed ? "4 3" : undefined)}
                    />
                  </svg>
                  {d.name}
                </td>
                {ELEMENTS.map((el) => (
                  <td key={el} className="tabular-nums">
                    {d.pct[el]}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
      )}
    </figure>
  );
}
