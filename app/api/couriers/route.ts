import { NextResponse } from "next/server";
import { listCouriers } from "@/lib/auth";
import { checkInterServiceSecret } from "@/lib/inter-service";

export async function GET(req: Request) {
  if (!checkInterServiceSecret(req)) {
    console.warn("[SECURITY] GET /api/couriers SIN secret válido (por ahora se permite)");
    // MODO ESTRICTO (activar en el Paso 5):
    // return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

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