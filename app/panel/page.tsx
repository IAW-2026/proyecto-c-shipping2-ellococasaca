import { requireRole } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Prisma, ShipmentStatus } from "@prisma/client";

const STATUS_OPTIONS = ["", "PENDING", "PREPARING", "SHIPPED", "IN_TRANSIT", "DELIVERED", "CANCELED"];

const STATUS_DOTS: Record<string, string> = {
  PENDING: "bg-slate-400",
  PREPARING: "bg-amber-500",
  SHIPPED: "bg-sky-500",
  IN_TRANSIT: "bg-indigo-500",
  DELIVERED: "bg-emerald-500",
  CANCELED: "bg-rose-500",
};

//Mantengo lo acordado en los archivos .md
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PREPARING: "Preparando",
  SHIPPED: "Despachado",
  IN_TRANSIT: "En tránsito",
  DELIVERED: "Entregado",
  CANCELED: "Cancelado",
};

const PAGE_SIZE = 10;

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireRole("admin");
  const { q, status, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? "1"));

  const where: Prisma.ShipmentWhereInput = {};
  if (q) {
    where.OR = [
      { orderId: { contains: q, mode: "insensitive" } },
      { trackingCode: { contains: q, mode: "insensitive" } },
      { sellerId: { contains: q, mode: "insensitive" } },
      { buyerId: { contains: q, mode: "insensitive" } },
    ];
  }
  const validStatuses = Object.values(ShipmentStatus) as string[];
  if (status && validStatuses.includes(status)) {
    where.status = status as ShipmentStatus;
  }

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.shipment.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildQuery = (newPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    params.set("page", String(newPage));
    return `?${params.toString()}`;
  };

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-red-600">Panel de envíos</h1>
  <p className="text-sm text-gray-500">Gestión y seguimiento — El Loco Casaca</p>
      </header>

      <form method="get" className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col">
          <label htmlFor="q" className="mb-1 text-sm font-medium text-gray-700">Buscar</label>
          <input id="q" name="q" defaultValue={q ?? ""} placeholder="Orden, tracking, vendedor..."
            className="rounded border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div className="flex flex-col">
          <label htmlFor="status" className="mb-1 text-sm font-medium text-gray-700">Estado</label>
          <select id="status" name="status" defaultValue={status ?? ""}
            className="rounded border border-gray-300 px-3 py-2 text-sm">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === "" ? "Todos" : STATUS_LABELS[s] ?? s}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
          Filtrar
        </button>
        <Link href="/panel" className="px-3 py-2 text-sm text-gray-600 underline">Limpiar</Link>
      </form>

      <p className="mb-2 text-sm text-gray-500">{total} envío(s) encontrado(s)</p>

      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Tracking</th>
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Comprador</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Entrega estimada</th>
              <th className="px-4 py-3 font-medium"><span className="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shipments.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hay envíos para mostrar.</td></tr>
            ) : (
              shipments.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{s.trackingCode}</td>
                  <td className="px-4 py-3">{s.orderId}</td>
                  <td className="px-4 py-3 text-gray-500">{s.buyerId}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[s.status] ?? "bg-slate-400"}`}></span>
                    {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString("es-AR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/panel/${s.id}`} className="text-blue-600 hover:underline">Ver</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <nav className="mt-4 flex items-center justify-between text-sm" aria-label="Paginación">
        <span className="text-gray-500">Página {page} de {totalPages}</span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link href={buildQuery(page - 1)} className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-50">← Anterior</Link>
          )}
          {page < totalPages && (
            <Link href={buildQuery(page + 1)} className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-50">Siguiente →</Link>
          )}
        </div>
      </nav>
    </main>
  );
}