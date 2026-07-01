import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export type UserRole = "admin" | "courier";


export async function requireRole(expected: UserRole) {
  const role = await getCurrentUserRole();

  if (role === expected) return; 

  if (role === "admin") redirect("/panel");
  if (role === "courier") redirect("/repartidor");
  redirect("/"); 
}


export async function listCouriers() {
  const client = await clerkClient();
  const { data: users } = await client.users.getUserList({ limit: 100 });

  return users
    .filter((u) => u.publicMetadata?.role === "courier")
    .map((u) => {
      const email = u.emailAddresses[0]?.emailAddress ?? "";
      const cleanName = email.split("+")[0] || email;
      const fullName = `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim();

      return {
        id: u.id,
        name: fullName || cleanName,
        email,
      };
    });
   }


   export async function getCurrentUserRole(): Promise<UserRole | null> {
  const user = await currentUser();
  if (!user) return null;

  const role = user.publicMetadata?.role as UserRole | undefined;

  console.log("[AUTH DEBUG] userId:", user.id);
  console.log("[AUTH DEBUG] publicMetadata:", JSON.stringify(user.publicMetadata));
  console.log("[AUTH DEBUG] role detectado:", role);

  return role ?? null;
}