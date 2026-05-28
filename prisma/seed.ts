import { PrismaClient, ShipmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Limpio datos previos para que el seed sea repetible
  await prisma.trackingEvent.deleteMany();
  await prisma.shipment.deleteMany();

  // Envío 1: ya entregado, con historial completo
  await prisma.shipment.create({
    data: {
      orderId: "order_1001",
      chargeId: "charge_1001",
      buyerId: "user_buyer_demo",
      sellerId: "user_seller_demo",
      status: ShipmentStatus.DELIVERED,
      trackingCode: "ARG-TRACK-0001",
      estimatedDelivery: new Date("2026-05-25T12:00:00Z"),
      addressSnapshot: {
        street: "Av. Alem 1234",
        city: "Bahía Blanca",
        province: "Buenos Aires",
        postalCode: "8000",
        country: "Argentina",
      },
      events: {
        create: [
          { status: ShipmentStatus.PENDING, description: "Envío registrado", timestamp: new Date("2026-05-20T10:00:00Z") },
          { status: ShipmentStatus.PREPARING, location: "Depósito CABA", description: "Preparando paquete", timestamp: new Date("2026-05-21T09:00:00Z") },
          { status: ShipmentStatus.SHIPPED, location: "CABA", description: "Despachado", timestamp: new Date("2026-05-22T15:00:00Z") },
          { status: ShipmentStatus.IN_TRANSIT, location: "Centro de distribución Bahía Blanca", description: "En camino", timestamp: new Date("2026-05-24T08:00:00Z") },
          { status: ShipmentStatus.DELIVERED, location: "Bahía Blanca", description: "Entregado al comprador", timestamp: new Date("2026-05-25T11:30:00Z") },
        ],
      },
    },
  });

  // Envío 2: en tránsito
  await prisma.shipment.create({
    data: {
      orderId: "order_1002",
      chargeId: "charge_1002",
      buyerId: "user_buyer_demo2",
      sellerId: "user_seller_demo",
      status: ShipmentStatus.IN_TRANSIT,
      trackingCode: "ARG-TRACK-0002",
      estimatedDelivery: new Date("2026-05-30T12:00:00Z"),
      addressSnapshot: {
        street: "Calle 7 N° 456",
        city: "La Plata",
        province: "Buenos Aires",
        postalCode: "1900",
        country: "Argentina",
      },
      events: {
        create: [
          { status: ShipmentStatus.PENDING, description: "Envío registrado", timestamp: new Date("2026-05-26T10:00:00Z") },
          { status: ShipmentStatus.PREPARING, location: "Depósito CABA", description: "Preparando paquete", timestamp: new Date("2026-05-27T09:00:00Z") },
          { status: ShipmentStatus.IN_TRANSIT, location: "En ruta a La Plata", description: "En camino", timestamp: new Date("2026-05-28T08:00:00Z") },
        ],
      },
    },
  });

  console.log("Seed completado: 2 envíos creados.");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });