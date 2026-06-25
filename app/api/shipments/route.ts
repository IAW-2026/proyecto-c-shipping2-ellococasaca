import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, ShipmentStatus } from "@prisma/client";
import { z } from "zod";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const sellerId = searchParams.get("sellerId") ?? undefined;
  const statusParam = searchParams.get("status") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "10")));

  const where: Prisma.ShipmentWhereInput = {};
  if (sellerId) where.sellerId = sellerId;

  const validStatuses = Object.values(ShipmentStatus) as string[];
  if (statusParam && validStatuses.includes(statusParam)) {
    where.status = statusParam as ShipmentStatus;
  }

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, orderId: true, buyerId: true, sellerId: true,
        status: true, trackingCode: true, estimatedDelivery: true, updatedAt: true,
        courierId: true,
      },
    }),
    prisma.shipment.count({ where }),
  ]);

  return NextResponse.json({ data: shipments, page, limit, total, totalPages: Math.ceil(total / limit) });
}

const createShipmentSchema = z.object({
  orderId: z.string().min(1),
  chargeId: z.string().min(1).optional(),
  buyerId: z.string().min(1),
  sellerId: z.string().min(1),
  productIds: z                                             
    .array(z.string().min(1))
    .min(1, "productIds debe contener al menos un producto"),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    province: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido (se esperaba JSON)" }, { status: 400 });
  }

  const parsed = createShipmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { orderId, chargeId, buyerId, sellerId, productIds, shippingAddress } = parsed.data;

  const trackingCode = `ARG-TRACK-${Date.now()}`;
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

const shipment = await prisma.shipment.create({
  data: {
    orderId, chargeId, buyerId, sellerId, productIds, 
    status: ShipmentStatus.PENDING,
    trackingCode,
    estimatedDelivery,
    addressSnapshot: shippingAddress,
    events: { create: [{ status: ShipmentStatus.PENDING, description: "Envío registrado" }] },
  },
});

  return NextResponse.json(
    { shipmentId: shipment.id, status: shipment.status, estimatedDelivery: shipment.estimatedDelivery },
    { status: 201 }
  );
}