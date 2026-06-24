"use server";

import { requireRole, listCouriers } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ShipmentStatus } from "@prisma/client";
import { enableReview } from "@/lib/feedback-client";
import { releasePayment } from "@/lib/payments-client";


const STATUSES = ["PENDING", "PREPARING", "SHIPPED", "IN_TRANSIT", "DELIVERED", "CANCELED"] as const;

const schema = z.object({
  shipmentId: z.string().min(1, "shipmentId requerido"),
  status: z.enum(STATUSES, { message: "Estado inválido" }),
  location: z.string().max(120).optional(),
  description: z.string().max(500).optional(),
});

export type UpdateStatusState = { error?: string; success?: string };

export async function updateShipmentStatus(
  _prev: UpdateStatusState,
  formData: FormData
): Promise<UpdateStatusState> {
  const parsed = schema.safeParse({
    shipmentId: formData.get("shipmentId"),
    status: formData.get("status"),
    location: (formData.get("location") as string) || undefined,
    description: (formData.get("description") as string) || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const { shipmentId, status, location, description } = parsed.data;

  const existing = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!existing) return { error: "Envío no encontrado" };

  const updated = await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      status,
      events: {
        create: [{ status, location, description: description ?? `Estado actualizado a ${status}` }],
      },
    },
  });

  if (status === ShipmentStatus.DELIVERED) {
    await enableReview({
      orderId: updated.orderId,
      shipmentId: updated.id,
      buyerId: updated.buyerId,
      sellerId: updated.sellerId,
      productIds: updated.productIds,
      deliveredAt: new Date().toISOString(),
    });

    if (updated.chargeId) {
      await releasePayment({
        charge_id: updated.chargeId,
        status: "approved",
      });
    }
  }

  if (status === ShipmentStatus.CANCELED) {
    if (updated.chargeId) {
      await releasePayment({
        charge_id: updated.chargeId,
        status: "rejected",
      });
    }
  }

  revalidatePath(`/panel/${shipmentId}`);
  revalidatePath("/panel");
  return { success: `Estado actualizado a ${status}` };
}

const NON_REASSIGNABLE_STATUSES: ShipmentStatus[] = [
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELED",
];

const assignCourierSchema = z.object({
  shipmentId: z.string().min(1, "shipmentId requerido"),
  courierId: z.string().min(1, "Tenés que elegir un repartidor"),
});

export type AssignCourierState = { error?: string; success?: string };

export async function assignCourier(
  _prev: AssignCourierState,
  formData: FormData
): Promise<AssignCourierState> {
  await requireRole("admin");

  const parsed = assignCourierSchema.safeParse({
    shipmentId: formData.get("shipmentId"),
    courierId: formData.get("courierId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join(", ") };
  }

  const { shipmentId, courierId } = parsed.data;

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
  });
  if (!shipment) return { error: "Envío no encontrado" };

  if (NON_REASSIGNABLE_STATUSES.includes(shipment.status)) {
    return { error: "No se puede reasignar: el envío ya está en curso o cerrado" };
  }

  const couriers = await listCouriers();
  const courier = couriers.find((c) => c.id === courierId);
  if (!courier) return { error: "Repartidor inválido" };

  if (shipment.courierId === courierId) {
    return { error: "Ese repartidor ya está asignado" };
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

  revalidatePath(`/panel/${shipmentId}`);
  revalidatePath("/panel");

  return {
    success: isNewAssignment
      ? `Asignado a ${courier.name}`
      : `Reasignado a ${courier.name}`,
  };
}