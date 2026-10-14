export const siteConfig = {
  name: "LootMall",
  description: "Your Online Shopping Destination",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://lootmall.online",
  ogImage: "https://lootmall.online/og.jpg",
  links: {
    twitter: "",
    github: "",
  },
};

export type SiteConfig = typeof siteConfig;