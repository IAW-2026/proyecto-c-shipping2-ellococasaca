import { PrismaClient, ShipmentStatus } from "@prisma/client";

const prisma = new PrismaClient();

const buyers = [
  "user_buyer_Messi", "user_buyer_Ronaldo", "user_buyer_Neymar",
  "user_buyer_DePaul", "user_buyer_Maradona", "user_buyer_Gallardo",
  "user_buyer_Scaloni", "user_buyer_Julian",
];
const sellers = [
  "user_seller_camisetasarg", "user_seller_retrofutbol",
  "user_seller_messismo10", "user_seller_pasionalbiceleste",
];

const cities = [
  { city: "Bahia Blanca", province: "Buenos Aires", postalCode: "8000" },
  { city: "La Plata", province: "Buenos Aires", postalCode: "1900" },
  { city: "Mar del Plata", province: "Buenos Aires", postalCode: "7600" },
  { city: "Rosario", province: "Santa Fe", postalCode: "2000" },
  { city: "Cordoba", province: "Cordoba", postalCode: "5000" },
  { city: "Mendoza", province: "Mendoza", postalCode: "5500" },
  { city: "San Miguel de Tucuman", province: "Tucuman", postalCode: "4000" },
];

// 15 envíos con diversidad de estados, vendedores, ciudades
const shipmentsData = [
  { status: ShipmentStatus.DELIVERED, events: ["PENDING", "PREPARING", "SHIPPED", "IN_TRANSIT", "DELIVERED"] },
  { status: ShipmentStatus.DELIVERED, events: ["PENDING", "PREPARING", "SHIPPED", "IN_TRANSIT", "DELIVERED"] },
  { status: ShipmentStatus.DELIVERED, events: ["PENDING", "PREPARING", "SHIPPED", "IN_TRANSIT", "DELIVERED"] },
  { status: ShipmentStatus.IN_TRANSIT, events: ["PENDING", "PREPARING", "SHIPPED", "IN_TRANSIT"] },
  { status: ShipmentStatus.IN_TRANSIT, events: ["PENDING", "PREPARING", "SHIPPED", "IN_TRANSIT"] },
  { status: ShipmentStatus.SHIPPED, events: ["PENDING", "PREPARING", "SHIPPED"] },
  { status: ShipmentStatus.SHIPPED, events: ["PENDING", "PREPARING", "SHIPPED"] },
  { status: ShipmentStatus.PREPARING, events: ["PENDING", "PREPARING"] },
  { status: ShipmentStatus.PREPARING, events: ["PENDING", "PREPARING"] },
  { status: ShipmentStatus.PREPARING, events: ["PENDING", "PREPARING"] },
  { status: ShipmentStatus.PENDING, events: ["PENDING"] },
  { status: ShipmentStatus.PENDING, events: ["PENDING"] },
  { status: ShipmentStatus.PENDING, events: ["PENDING"] },
  { status: ShipmentStatus.CANCELED, events: ["PENDING", "PREPARING", "CANCELED"] },
  { status: ShipmentStatus.CANCELED, events: ["PENDING", "CANCELED"] },
];

async function main() {
  await prisma.trackingEvent.deleteMany();
  await prisma.shipment.deleteMany();

  const now = Date.now();

  for (let i = 0; i < shipmentsData.length; i++) {
    const s = shipmentsData[i];
    const city = cities[i % cities.length];
    const buyer = buyers[i % buyers.length];
    const seller = sellers[i % sellers.length];
    const orderNum = 2001 + i;

    // Timestamps escalonados de los últimos 10 días
    const baseDate = new Date(now - (i + 1) * 24 * 60 * 60 * 1000);

    await prisma.shipment.create({
      data: {
        orderId: `order_${orderNum}`,
        chargeId: `charge_${orderNum}`,
        buyerId: buyer,
        sellerId: seller,
        status: s.status,
        trackingCode: `ARG-TRACK-${10000 + i}`,
        estimatedDelivery: new Date(now + 5 * 24 * 60 * 60 * 1000),
        addressSnapshot: {
          street: `Av. San Martin ${1000 + i * 50}`,
          city: city.city,
          province: city.province,
          postalCode: city.postalCode,
          country: "Argentina",
        },
        events: {
          create: s.events.map((status, idx) => ({
            status: status as ShipmentStatus,
            location: status === "PENDING" ? null : `${city.city}, en transito`,
            description: descripcionPara(status),
            timestamp: new Date(baseDate.getTime() + idx * 6 * 60 * 60 * 1000),
          })),
        },
      },
    });
  }

  console.log(`Seed completado: ${shipmentsData.length} envios creados.`);
}

function descripcionPara(status: string): string {
  switch (status) {
    case "PENDING": return "Envio registrado";
    case "PREPARING": return "Preparando paquete en deposito";
    case "SHIPPED": return "Despachado por el vendedor";
    case "IN_TRANSIT": return "En camino al destino";
    case "DELIVERED": return "Entregado al comprador";
    case "CANCELED": return "Envio cancelado";
    default: return "";
  }
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });