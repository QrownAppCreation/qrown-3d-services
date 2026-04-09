import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** `/operator` — send operators to the dashboard, everyone else to login. */
export default async function OperatorIndexPage() {
  const session = await auth();
  if (session?.user?.role === "operator") {
    redirect("/operator/dashboard");
  }
  redirect("/operator/login");
}
