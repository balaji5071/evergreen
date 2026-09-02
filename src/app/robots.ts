import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://evergreen-restaurant.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/menu", "/help", "/login", "/signup"],
        disallow: [
          "/admin/",
          "/admin/*",
          "/staff/",
          "/staff/*",
          "/delivery/",
          "/delivery/*",
          "/api/",
          "/api/*",
          "/orders/",
          "/checkout/",
          "/cart/",
          "/profile/",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/menu", "/help", "/llms.txt", "/llms-full.txt"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/menu", "/help", "/llms.txt", "/llms-full.txt"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/menu", "/help", "/llms.txt", "/llms-full.txt"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
