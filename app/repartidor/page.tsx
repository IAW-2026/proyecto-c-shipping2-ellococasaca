import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export default async function RepartidorPage() {
  await requireRole("courier");
  const { userId } = await auth();

  const shipments = await prisma.shipment.findMany({
    where: { courierId: userId! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-red-600">Mis envíos asignados</h1>
        <p className="text-sm text-gray-500">
          {shipments.length} paquete(s) en tu zona
        </p>
      </header>

      {shipments.length === 0 ? (
        <div className="rounded border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No tenés envíos asignados todavía.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shipments.map((s) => {
            const addr = (s.addressSnapshot ?? {}) as AddressSnapshot;
            return (
              <Link
                key={s.id}
                href={`/repartidor/${s.id}`}
                className="block rounded border border-gray-200 p-4 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-sm">{s.trackingCode}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[s.status] ?? ""
                        }`}
                      >
                        {STATUS_LABELS[s.status] ?? s.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {addr.street}, {addr.city} ({addr.postalCode})
                    </p>
                  </div>
                  <span className="text-sm text-blue-600">Ver →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}