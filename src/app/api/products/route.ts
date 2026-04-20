import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { Product } from "@/types/product";

type NewProductPayload = {
  name?: string;
  description?: string;
  price?: number;
};

type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  created_at: string;
};

function mapRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    created_at: row.created_at,
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("id,name,description,price,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const products = ((data ?? []) as ProductRow[]).map(mapRowToProduct);
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NewProductPayload;
    const name = body.name?.trim() ?? "";
    const description = body.description?.trim() ?? "";
    const price = Number(body.price);

    if (!name || !description || Number.isNaN(price) || price < 0) {
      return NextResponse.json(
        { message: "Datos inválidos. Revisá nombre, descripción y precio." },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .insert({ name, description, price })
      .select("id,name,description,price,created_at")
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { product: mapRowToProduct(data as ProductRow) },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unexpected error" },
      { status: 500 },
    );
  }
}
