import { NextRequest, NextResponse } from "next/server";
import { products } from "@/lib/data";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const category = params.get("category");
  const rx = params.get("rxRequired") ?? params.get("rx");
  const min = Number(params.get("minPrice") ?? params.get("min") ?? 0);
  const max = Number(params.get("maxPrice") ?? params.get("max") ?? Number.MAX_SAFE_INTEGER);
  const result = products.filter((product) => (!category || product.category === category) && (rx === null || String(product.rx) === rx) && product.price >= min && product.price <= max);
  return NextResponse.json({ products: result, count: result.length }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
