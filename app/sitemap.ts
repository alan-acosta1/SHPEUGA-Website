import type { MetadataRoute } from "next";

const BASE_URL = "https://shpeuga.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/board", "/event", "/resources", "/sponser"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
