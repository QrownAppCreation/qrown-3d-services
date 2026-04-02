import { redirect } from "next/navigation";

// /operator/launch-checklist redirects to the shared checklist page
export default function Page() {
  redirect("/launch-checklist");
}
