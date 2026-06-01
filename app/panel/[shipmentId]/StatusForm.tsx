"use client";

import { useActionState } from "react";
import { updateShipmentStatus, type UpdateStatusState } from "./actions";

const STATUSES = ["PENDING", "PREPARING", "SHIPPED", "IN_TRANSIT", "DELIVERED", "CANCELED"];

export function StatusForm({
  shipmentId,
  currentStatus,
}: {
  shipmentId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState<UpdateStatusState, FormData>(
    updateShipmentStatus,
    {}
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="shipmentId" value={shipmentId} />

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Nuevo estado
        </label>
        <select id="status" name="status" defaultValue={currentStatus}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Ubicación (opcional)
        </label>
        <input id="location" name="location" maxLength={120}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Descripción (opcional)
        </label>
        <textarea id="description" name="description" rows={2} maxLength={500}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <button type="submit" disabled={pending}
        className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50">
        {pending ? "Actualizando..." : "Actualizar estado"}
      </button>

      {state.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-green-600">{state.success}</p>}
    </form>
  );
}