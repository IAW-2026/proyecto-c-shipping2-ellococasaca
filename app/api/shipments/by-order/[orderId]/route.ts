import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  const shipment = await prisma.shipment.findFirst({
    where: { orderId },
    select: {
      id: true,
      orderId: true,
      buyerId: true,
      sellerId: true,
      status: true,
      trackingCode: true,
      estimatedDelivery: true,
      updatedAt: true,
      courierId: true,
    },
  });

  if (!shipment) {
    return NextResponse.json(
      { error: "No se encontró un envío para ese orderId" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: shipment });
}