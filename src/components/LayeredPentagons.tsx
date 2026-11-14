import ElementPentagon from "@/components/ElementPentagon";
import { computeLayers, type Chart } from "@/lib/bazi";

const LAYER_COLORS = ["#7a5bd1", "#a8710f", "#e0457b"]; // purple, amber, red
const LAYER_DASH = [undefined, "6 4", "2 3"]; // solid, dashed, dotted
const LAYER_NAMES = ["第一层", "第二层", "第三层"];

export default function LayeredPentagons({ chart }: { chart: Chart }) {
  const layers = computeLayers(chart);
  const changes = layers[2].events;

  return (
    <div className="flex flex-col gap-2" data-testid="layered-pentagons">
      <p className="text-center text-sm font-bold text-[#6b4f8f]">五行分布 · Element balance</p>
      <ElementPentagon
        series={layers.map((l, i) => ({
          name: LAYER_NAMES[i],
          values: l.percent,
          color: LAYER_COLORS[i],
          dash: LAYER_DASH[i],
        }))}
      />
      <ul className="flex flex-col gap-1 text-sm" data-testid="layer-events">
        {changes.map((e) => (
          <li key={e} className="rounded-xl bg-[#f8f4ff] px-3 py-1.5">
            {e}
          </li>
        ))}
      </ul>
    </div>
  );
}
