import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ShipmentStatus } from "@prisma/client";
import { z } from "zod";
import { listCouriers } from "@/lib/auth";

const NON_REASSIGNABLE_STATUSES: ShipmentStatus[] = [
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELED",
];

const assignCourierSchema = z.object({
  courierId: z.string().min(1, "Tenés que elegir un repartidor"),
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

  const parsed = assignCourierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { courierId } = parsed.data;

  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) {
    return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });
  }

  if (NON_REASSIGNABLE_STATUSES.includes(shipment.status)) {
    return NextResponse.json(
      { error: "No se puede reasignar: el envío ya está en curso o cerrado" },
      { status: 409 }
    );
  }

  const couriers = await listCouriers();
  const courier = couriers.find((c) => c.id === courierId);
  if (!courier) {
    return NextResponse.json({ error: "Repartidor inválido" }, { status: 400 });
  }

  if (shipment.courierId === courierId) {
    return NextResponse.json(
      { error: "Ese repartidor ya está asignado" },
      { status: 409 }
    );
  }

  const isNewAssignment = !shipment.courierId;

  await prisma.$transaction([
    prisma.shipment.update({
      where: { id: shipmentId },
      data: { courierId },
    }),
    prisma.trackingEvent.create({
      data: {
        shipmentId,
        status: shipment.status,
        description: isNewAssignment
          ? `Asignado al repartidor ${courier.name}`
          : `Reasignado al repartidor ${courier.name}`,
      },
    }),
  ]);

  return NextResponse.json({
    shipmentId,
    courierId,
    courierName: courier.name,
    reassigned: !isNewAssignment,
  });
}