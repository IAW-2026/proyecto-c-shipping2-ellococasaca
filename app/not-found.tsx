import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl p-12 text-center">
      <div className="flex justify-center">
        <Image
          src="/pichichi.jpg"
          alt="Pichichi"
          width={300}
          height={300}
          className="rounded"
        />
      </div>
      <h1 className="mt-6 text-4xl font-bold text-gray-900">Jugó el Pichichi</h1>
      <p className="mt-2 text-sm text-gray-500">
        Esta página no existe.
      </p>
      <Link
        href="/panel"
        className="mt-6 inline-block rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        Volver al panel
      </Link>
    </main>
  );
}