import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ShipmentStatus } from "@prisma/client";
import { z } from "zod";
import { enableReview } from "@/lib/feedback-mock";

const STATUSES = ["PENDING", "PREPARING", "SHIPPED", "IN_TRANSIT", "DELIVERED", "CANCELED"] as const;

const updateStatusSchema = z.object({
  status: z.enum(STATUSES),
  location: z.string().optional(),
  description: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ shipmentId: string }> }
) {
  const { shipmentId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido (se esperaba JSON)" }, { status: 400 });
  }

  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.issues }, { status: 400 });
  }

  const { status, location, description } = parsed.data;

  const existing = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!existing) {
    return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
  }

  // Actualizamos el estado y dejamos registrado el evento en el historial
  const updated = await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      status,
      events: {
        create: [{ status, location, description: description ?? `Estado actualizado a ${status}` }],
      },
    },
  });

  // Si pasó a DELIVERED, avisamos a Feedback (MOCK en Etapa 2)
  let feedback = null;
  if (status === ShipmentStatus.DELIVERED) {
    feedback = await enableReview({
      orderId: updated.orderId,
      shipmentId: updated.id,
      buyerId: updated.buyerId,
      sellerId: updated.sellerId,
      productIds: [], // en Etapa 3 vendrán los productos reales del pedido
      deliveredAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ shipmentId: updated.id, status: updated.status, feedback });
}