export const SITE_NAME = "LootMall";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://lootmall.online";

export const siteConfig = {
  name: SITE_NAME,
  description: "Your Online Shopping Destination",
  url: SITE_URL,
  ogImage: `${SITE_URL}/og.jpg`,
  links: {
    twitter: "",
    github: "",
  },
};
