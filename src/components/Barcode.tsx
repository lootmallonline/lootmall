import { code128B } from "@/lib/barcode";

/** Code 128 barcode drawn as plain SVG (prints sharply, no images needed). */
export function Barcode({ value, height = 48 }: { value: string; height?: number }) {
  const { bars, width } = code128B(value);
  const quiet = 10;
  const total = width + quiet * 2;
  return (
    <svg
      viewBox={`0 0 ${total} ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      role="img"
      aria-label={`Barcode ${value}`}
      shapeRendering="crispEdges"
    >
      <rect width={total} height={height} fill="#fff" />
      {bars.map((b, i) => (
        <rect key={i} x={b.x + quiet} y={0} width={b.w} height={height} fill="#000" />
      ))}
    </svg>
  );
}
