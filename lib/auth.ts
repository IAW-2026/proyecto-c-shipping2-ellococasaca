import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type UserRole = "admin" | "courier";

/**
 * Lee el rol del usuario logueado desde publicMetadata de Clerk.
 * Devuelve null si no está logueado o no tiene rol asignado.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await currentUser();
  if (!user) return null;

  const role = user.publicMetadata?.role as UserRole | undefined;
  return role ?? null;
}

/**
 * Verifica que el usuario logueado tenga un rol específico.
 * Si no, lo redirige al panel que le corresponde (o al home).
 * Usar en Server Components al inicio de la función.
 */
export async function requireRole(expected: UserRole) {
  const role = await getCurrentUserRole();

  if (role === expected) return; // todo OK, sigue

  // Redirigir según el rol real del usuario
  if (role === "admin") redirect("/panel");
  if (role === "courier") redirect("/repartidor");
  redirect("/"); // sin rol → home
}

/**
 * Devuelve la lista de usuarios con rol "courier" desde Clerk.
 * Se usa para armar el dropdown de "Asignar repartidor" en el panel del admin.
 */
export async function listCouriers() {
  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({ limit: 100 });

  return users
    .filter((u) => u.publicMetadata?.role === "courier")
    .map((u) => {
      const email = u.emailAddresses[0]?.emailAddress ?? "";
      // "repartidor1+clerk_test@iaw.com" → "repartidor1"
      const cleanName = email.split("+")[0] || email;
      const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();

      return {
        id: u.id,
        name: fullName || cleanName,
        email,
      };
    });
}