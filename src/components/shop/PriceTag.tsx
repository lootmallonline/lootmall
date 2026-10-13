import { formatPKR } from "@/lib/format";

export function PriceTag({
  regular,
  sale,
  large = false,
}: {
  regular: number;
  sale: number | null;
  large?: boolean;
}) {
  const onSale = sale !== null && sale < regular;
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className={`${large ? "text-2xl" : "text-base"} font-bold text-maroon-700`}>
        {formatPKR(onSale ? (sale as number) : regular)}
      </span>
      {onSale && (
        <s className={`${large ? "text-base" : "text-sm"} text-ink/50`}>
          <span className="sr-only">Regular price </span>
          {formatPKR(regular)}
        </s>
      )}
    </p>
  );
}
