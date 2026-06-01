"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ShipmentStatus } from "@prisma/client";
import { enableReview } from "@/lib/feedback-mock";

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
      productIds: [],
      deliveredAt: new Date().toISOString(),
    });
  }

  revalidatePath(`/panel/${shipmentId}`);
  revalidatePath("/panel");
  return { success: `Estado actualizado a ${status}` };
}