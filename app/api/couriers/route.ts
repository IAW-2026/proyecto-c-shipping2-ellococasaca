import { NextResponse } from "next/server";
import { listCouriers } from "@/lib/auth";

export async function GET() {
  try {
    const couriers = await listCouriers();
    return NextResponse.json({ data: couriers });
  } catch (err) {
    console.error("[API couriers] Error listando repartidores:", err);
    return NextResponse.json(
      { error: "No se pudieron obtener los repartidores" },
      { status: 500 }
    );
  }
}