import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourierStatusForm } from "./CourierStatusForm";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  PREPARING: "bg-amber-100 text-amber-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  IN_TRANSIT: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PREPARING: "Preparando",
  SHIPPED: "Despachado",
  IN_TRANSIT: "En tránsito",
  DELIVERED: "Entregado",
  CANCELED: "Cancelado",
};

type AddressSnapshot = {
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
};

const LOCKED_STATUSES = ["DELIVERED", "CANCELED"];

export default async function CourierShipmentDetailPage({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  await requireRole("courier");
  const { userId } = await auth();
  const { shipmentId } = await params;

const shipment = await prisma.shipment.findUnique({
  where: { id: shipmentId },
});

  if (!shipment) notFound();

  // Si el envío no está asignado a este repartidor → 404
  // (no exponemos info de envíos de otros)
  if (shipment.courierId !== userId) notFound();

  const addr = (shipment.addressSnapshot ?? {}) as AddressSnapshot;
  const isLocked = LOCKED_STATUSES.includes(shipment.status);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-4">
        <Link
          href="/repartidor"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver a mis envíos
        </Link>
      </div>

      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Envío {shipment.trackingCode}
          </h1>
          <p className="text-sm text-gray-500">
            Orden: <span className="font-mono">{shipment.orderId}</span>
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            STATUS_STYLES[shipment.status] ?? ""
          }`}
        >
          {STATUS_LABELS[shipment.status] ?? shipment.status}
        </span>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded border border-gray-200 p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">
            Datos del envío
          </h2>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Comprador</dt>
              <dd className="font-mono text-xs">{shipment.buyerId}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Tracking</dt>
              <dd className="font-mono text-xs">{shipment.trackingCode}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded border border-gray-200 p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">
            Dirección de entrega
          </h2>
          <address className="text-sm not-italic text-gray-700">
            {addr.street}<br />
            {addr.city}, {addr.province} ({addr.postalCode})<br />
            {addr.country}
          </address>
        </div>
      </section>

      {!isLocked ? (
        <section className="mb-6 rounded border border-gray-200 p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Actualizar estado
          </h2>
          <CourierStatusForm
            shipmentId={shipment.id}
            currentStatus={shipment.status}
          />
        </section>
      ) : (
        <div className="mb-6 rounded border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Este envío ya está {STATUS_LABELS[shipment.status]?.toLowerCase()}.
        </div>
      )}

   
    </main>
  );
}