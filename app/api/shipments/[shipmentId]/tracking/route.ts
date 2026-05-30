import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ shipmentId: string }> } // en Next 15 params es async
) {
  const { shipmentId } = await params;

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { events: { orderBy: { timestamp: "asc" } } },
  });

  if (!shipment) {
    return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    shipmentId: shipment.id,
    orderId: shipment.orderId,
    currentStatus: shipment.status,
    estimatedDelivery: shipment.estimatedDelivery,
    history: shipment.events.map((e) => ({
      status: e.status,
      description: e.description,
      location: e.location,
      timestamp: e.timestamp,
    })),
  });
}