import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#04060b",
    theme_color: "#04060b",
    orientation: "portrait-primary",
    categories: ["technology", "productivity", "developer"],
    /*
     * Both entries point at routes that are already generated for the document
     * head, so installing the app reuses bytes the browser may already hold
     * rather than pulling a third, larger image.
     */
    icons: [
      { src: "/icon", sizes: "48x48", type: "image/png", purpose: "any" },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
