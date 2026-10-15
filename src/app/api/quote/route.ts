import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import { getSettings } from "@/lib/data";
import { effectivePrice } from "@/lib/format";

const schema = z.object({ product_ids: z.array(z.string().uuid()).min(1).max(50) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const supabase = createPublicClient();
  if (!supabase) return NextResponse.json({ error: "Store is not configured" }, { status: 503 });

  const { data, error } = await supabase
    .from("products")
    .select("id,name,slug,images,regular_price,sale_price,stock")
    .in("id", parsed.data.product_ids)
    .eq("is_active", true);
  if (error) return NextResponse.json({ error: "Could not load products" }, { status: 500 });

  const settings = await getSettings();
  const items = (data ?? []).map((p) => ({
    product_id: p.id as string,
    name: p.name as string,
    slug: p.slug as string,
    image: ((p.images as string[] | null) ?? [])[0] ?? null,
    unit_price: effectivePrice({ regular_price: p.regular_price as number, sale_price: p.sale_price as number | null }),
    stock: p.stock as number,
  }));

  return NextResponse.json(
    { items, delivery_charge: settings.delivery_charge },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export const dynamic = "force-dynamic";
