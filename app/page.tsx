import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCurrentUserRole } from "@/lib/auth";

export default async function Home() {
  const { userId } = await auth();

  // Si NO está logueado: mostramos la bienvenida (el botón de login del modal
  // está en el header del layout). NO redirigimos a ningún lado.
  if (!userId) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Shipping · El Loco Casaca
          </h1>
          <p className="mt-2 text-slate-500">
            Iniciá sesión para acceder al panel de gestión de envíos.
          </p>
        </div>
      </div>
    );
  }

  const role = await getCurrentUserRole();

  if (role === "courier") redirect("/repartidor");
  if (role === "admin") redirect("/panel");

  // Logueado pero SIN rol: mensaje, NO redirige (evita el loop)
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-slate-900">
          Tu cuenta todavía no tiene un rol asignado
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Pedile a un administrador que te asigne el rol de admin o repartidor.
        </p>
      </div>
    </div>
  );
}