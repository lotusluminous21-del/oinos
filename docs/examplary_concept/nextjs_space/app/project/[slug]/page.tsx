import { redirect } from "next/navigation";

export default function ProjectPage() {
  // Redirect to expert page as projects are now handled there
  redirect("/expert");
}
