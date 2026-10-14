import { code128BWidths } from "@/lib/code128";

export function Barcode({ value, height = 52 }: { value: string; height?: number }) {
  const widths = code128BWidths(value);
  const quiet = 10; // blank modules each side, needed for scanners
  const total = widths.reduce((a, b) => a + b, 0) + quiet * 2;
  const bars: { x: number; w: number }[] = [];
  let x = quiet;
  widths.forEach((w, i) => {
    if (i % 2 === 0) bars.push({ x, w });
    x += w;
  });
  return (
    <svg
      viewBox={`0 0 ${total} 1`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Barcode ${value}`}
      shapeRendering="crispEdges"
      style={{ width: "100%", height, display: "block" }}
    >
      <rect x={0} y={0} width={total} height={1} fill="#fff" />
      {bars.map((b) => (
        <rect key={b.x} x={b.x} y={0} width={b.w} height={1} fill="#000" />
      ))}
    </svg>
  );
}
