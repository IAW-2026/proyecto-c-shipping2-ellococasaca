"use client";

import { useActionState } from "react";
import {
  updateCourierShipmentStatus,
  type CourierUpdateState,
} from "./actions";

type Props = {
  shipmentId: string;
  currentStatus: string;
};

const initialState: CourierUpdateState = {};

export function CourierStatusForm({ shipmentId, currentStatus }: Props) {
  const [state, formAction, isPending] = useActionState(
    updateCourierShipmentStatus,
    initialState
  );

  const canMarkInTransit = currentStatus !== "IN_TRANSIT";
  const canRecordAttempt = currentStatus === "IN_TRANSIT";
  const canMarkDelivered = currentStatus === "IN_TRANSIT";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="shipmentId" value={shipmentId} />

      <div>
        <label
          htmlFor="location"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Ubicación (opcional)
        </label>
        <input
          type="text"
          name="location"
          id="location"
          placeholder="Ej: Bahía Blanca centro"
          disabled={isPending}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Notas (opcional)
        </label>
        <textarea
          name="description"
          id="description"
          rows={2}
          placeholder="Ej: Entregado en mano al destinatario"
          disabled={isPending}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        {canMarkInTransit && (
          <button
            type="submit"
            name="status"
            value="IN_TRANSIT"
            disabled={isPending}
            className="flex-1 rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            En camino
          </button>
        )}

        {canRecordAttempt && (
          <button
            type="submit"
            name="status"
            value="ATTEMPT"
            disabled={isPending}
            className="flex-1 rounded-md bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
          >
             Intento fallido
          </button>
        )}

        {canMarkDelivered && (
          <button
            type="submit"
            name="status"
            value="DELIVERED"
            disabled={isPending}
            className="flex-1 rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            Entregado
          </button>
        )}
      </div>

      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-green-700">{state.success}</p>
      )}
    </form>
  );
}