import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "http2.mlstatic.com", // Mercado Livre
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com", // Amazon
      },
      {
        protocol: "https",
        hostname: "a-static.besthdwallpaper.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com", // Placeholders de teste
      },
      {
        protocol: "https",
        hostname: "**.shopee.com.br", // Shopee
      },
      {
        protocol: "https",
        hostname: "**.magazineluiza.com.br", // Magalu
      },
      {
        protocol: "https",
        hostname: "**.alicdn.com", // AliExpress
      },
    ],
  },
};

export default nextConfig;
