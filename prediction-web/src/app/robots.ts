import type { MetadataRoute } from "next";
import { absUrl } from "@/shared/utils/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api", "/wallet", "/profile"],
      },
    ],
    sitemap: absUrl("/sitemap.xml"),
  };
}


