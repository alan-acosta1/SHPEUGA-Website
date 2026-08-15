import type { MetadataRoute } from "next";

const BASE_URL = "https://shpeuga.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/login", "/signup", "/forgotpassword", "/resetpassword", "/confirmemail", "/profile"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
