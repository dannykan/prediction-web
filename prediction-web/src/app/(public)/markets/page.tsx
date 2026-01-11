import { redirect } from "next/navigation";

/**
 * Redirect /markets to /home for backward compatibility
 */
export default function MarketsRedirectPage() {
  redirect("/home");
}



