import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quatro",
    short_name: "Quatro",
    description: "Focus on what matters. Only 4 things at a time.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafcfe",
    theme_color: "#263573",
    icons: [
      {
        src: "/arrows-full.png",
        sizes: "321x285",
        type: "image/png",
      },
    ],
  };
}
