import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusForm } from "./StatusForm";
import { requireRole, listCouriers } from "@/lib/auth";
import CourierAssignForm from "./CourierAssignForm";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  PREPARING: "bg-amber-100 text-amber-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  IN_TRANSIT: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
};

const NON_REASSIGNABLE_STATUSES = ["IN_TRANSIT", "DELIVERED", "CANCELED"];

type AddressSnapshot = {
  street?: string; city?: string; province?: string;
  postalCode?: string; country?: string;
};

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ shipmentId: string }>;
}) {
  
  await requireRole("admin");

const { shipmentId } = await params;

const [shipment, couriers] = await Promise.all([
  prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { events: { orderBy: { timestamp: "desc" } } },
  }),
  listCouriers(),
]);

if (!shipment) notFound();

const addr = (shipment.addressSnapshot ?? {}) as AddressSnapshot;
const currentCourier =
  couriers.find((c) => c.id === shipment.courierId) ?? null;
const isLocked = NON_REASSIGNABLE_STATUSES.includes(shipment.status);
 

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-4">
        <Link href="/panel" className="text-sm text-blue-600 hover:underline">← Volver al panel</Link>
      </div>

      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Envío {shipment.trackingCode}</h1>
          <p className="text-sm text-gray-500">Orden: <span className="font-mono">{shipment.orderId}</span></p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[shipment.status] ?? ""}`}>
          {shipment.status}
        </span>
      </header>

      <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded border border-gray-200 p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Datos del envío</h2>
          
          <dl className="space-y-1 text-sm">
           <div className="flex justify-between"><dt className="text-gray-500">Comprador</dt><dd className="font-mono text-xs">{shipment.buyerId}</dd></div>
           <div className="flex justify-between"><dt className="text-gray-500">Vendedor</dt><dd className="font-mono text-xs">{shipment.sellerId}</dd></div>
           <div className="flex justify-between">
             <dt className="text-gray-500">Repartidor</dt>
             <dd className="font-mono text-xs">
              {currentCourier ? currentCourier.name : "Sin asignar"}
             </dd>
           </div>
           <div className="flex justify-between"><dt className="text-gray-500">Entrega estimada</dt><dd>{shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString("es-AR") : "—"}</dd></div>
           <div className="flex justify-between"><dt className="text-gray-500">Creado</dt><dd>{new Date(shipment.createdAt).toLocaleString("es-AR")}</dd></div>
          </dl>
        
        </div>
        <div className="rounded border border-gray-200 p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Dirección de entrega</h2>
          <address className="text-sm not-italic text-gray-700">
            {addr.street}<br />
            {addr.city}, {addr.province} ({addr.postalCode})<br />
            {addr.country}
          </address>
        </div>

       <section className="mb-6 rounded border border-gray-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Asignar repartidor</h2>
        <CourierAssignForm
          shipmentId={shipment.id}
          currentCourierId={shipment.courierId}
          couriers={couriers}
          locked={isLocked}
         />
      </section>


      </section>
      <section className="mb-6 rounded border border-gray-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Actualizar estado</h2>
        <StatusForm shipmentId={shipment.id} currentStatus={shipment.status} />
      </section>

      <section className="rounded border border-gray-200 p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Historial de tracking</h2>
        {shipment.events.length === 0 ? (
          <p className="text-sm text-gray-400">Sin eventos.</p>
        ) : (
          <ol className="space-y-3">
            {shipment.events.map((e) => (
              <li key={e.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[e.status] ?? ""}`}>{e.status}</span>
                  <time className="text-xs text-gray-500">{new Date(e.timestamp).toLocaleString("es-AR")}</time>
                </div>
                {e.description && <p className="mt-1 text-sm text-gray-700">{e.description}</p>}
                {e.location && <p className="text-xs text-gray-500">📍 {e.location}</p>}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}