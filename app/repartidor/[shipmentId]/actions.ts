"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ShipmentStatus } from "@prisma/client";
import { enableReview } from "@/lib/feedback-client";


const COURIER_ALLOWED_STATUSES = ["IN_TRANSIT", "DELIVERED", "ATTEMPT"] as const;

const schema = z.object({
  shipmentId: z.string().min(1, "shipmentId requerido"),
  status: z.enum(COURIER_ALLOWED_STATUSES, {
    message: "Estado no permitido para repartidor",
  }),
  location: z.string().max(120).optional(),
  description: z.string().max(500).optional(),
});

export type CourierUpdateState = { error?: string; success?: string };

export async function updateCourierShipmentStatus(
  _prev: CourierUpdateState,
  formData: FormData
): Promise<CourierUpdateState> {
  await requireRole("courier");
  const { userId } = await auth();
  if (!userId) return { error: "No autenticado" };

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

  // Verificar que el envío exista Y esté asignado a este repartidor
  const existing = await prisma.shipment.findUnique({
    where: { id: shipmentId },
  });
  if (!existing) return { error: "Envío no encontrado" };
  if (existing.courierId !== userId) {
    return { error: "Este envío no está asignado a vos" };
  }

  // Validaciones de transición
  if (existing.status === "DELIVERED") {
    return { error: "El envío ya fue entregado" };
  }
  if (existing.status === "CANCELED") {
    return { error: "El envío fue cancelado" };
  }

if (status === "ATTEMPT") {
  if (existing.status !== "IN_TRANSIT") {
    return {
      error: "Solo se pueden registrar intentos durante el tránsito",
    };
  }

  // Revertir el envío a SHIPPED + registrar el intento en el historial
  // Todo en una transacción para que sea atómico
  await prisma.$transaction([
    prisma.shipment.update({
      where: { id: shipmentId },
      data: { status: "SHIPPED" },
    }),
    prisma.trackingEvent.create({
      data: {
        shipmentId,
        status: "SHIPPED",
        location,
        description: description
          ? `Intento de entrega fallido: ${description}`
          : "Intento de entrega fallido",
      },
    }),
  ]);

  revalidatePath(`/repartidor/${shipmentId}`);
  revalidatePath("/repartidor");

  return { success: "Intento registrado. Listo para reintento." };
}

  const updated = await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      status,
      events: {
        create: [
          {
            status,
            location,
            description:
              description ?? `Estado actualizado a ${status} por repartidor`,
          },
        ],
      },
    },
  });

  // Si pasa a DELIVERED, dispara el mock de Feedback
  if (status === ShipmentStatus.DELIVERED) {
    await enableReview({
      orderId: updated.orderId,
      shipmentId: updated.id,
      buyerId: updated.buyerId,
      sellerId: updated.sellerId,
      productIds: updated.productIds,
      deliveredAt: new Date().toISOString(),
    });
  }

  revalidatePath(`/repartidor/${shipmentId}`);
  revalidatePath("/repartidor");

  return { success: `Estado actualizado a ${status}` };
}