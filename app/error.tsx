"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-2xl p-12 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Algo salió mal</h1>
      <p className="mt-2 text-sm text-gray-500">
        Ocurrió un error inesperado. Podés intentar de nuevo o volver al panel.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Reintentar
        </button>
        <Link
          href="/panel"
          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Volver al panel
        </Link>
      </div>
    </main>
  );
}