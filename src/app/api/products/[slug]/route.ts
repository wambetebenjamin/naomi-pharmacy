import { NextResponse } from "next/server";
import { products } from "@/lib/data";
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = products.find((item) => item.slug === slug);
  return product ? NextResponse.json(product) : NextResponse.json({ error: "Product not found." }, { status: 404 });
}
