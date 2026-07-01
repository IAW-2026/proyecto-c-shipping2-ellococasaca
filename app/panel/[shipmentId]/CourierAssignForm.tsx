"use client";

import { useActionState } from "react";
import { assignCourier, type AssignCourierState } from "./actions";

type Courier = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  shipmentId: string;
  currentCourierId: string | null;
  couriers: Courier[];
  locked: boolean;
};

const initialState: AssignCourierState = {};

export default function CourierAssignForm({
  shipmentId,
  currentCourierId,
  couriers,
  locked,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    assignCourier,
    initialState
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="shipmentId" value={shipmentId} />

      <div>
        <label
          htmlFor="courierId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Repartidor asignado
        </label>
        <select
          name="courierId"
          id="courierId"
          defaultValue={currentCourierId ?? ""}
          disabled={locked || isPending}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
        >
          <option value="" disabled>
            -- Seleccionar repartidor --
          </option>
          {couriers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {locked ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          No se puede reasignar: el envío ya está en curso o cerrado.
        </p>
      ) : (
        <button
          type="submit"
          disabled={isPending}
          className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending ? "Asignando..." : "Asignar"}
        </button>
      )}

      {state.error && (
        <p className="text-sm text-red-700">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-700">{state.success}</p>
      )}
    </form>
  );
}