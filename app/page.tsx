import { redirect } from "next/navigation";
import { getCurrentUserRole } from "@/lib/auth";

export default async function Home() {
  const role = await getCurrentUserRole();

  if (role === "courier") redirect("/repartidor");
  if (role === "admin") redirect("/panel");

  redirect("/panel");
}