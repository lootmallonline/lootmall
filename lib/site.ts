// Brand constants. Contact details and delivery charge live in the database
// (Admin > Settings) so you can change them without touching code.
export const SITE_NAME = "LootMall";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lootmall.online";

// LOGO: copy your own logo file into the /public folder (for example public/logo.png)
// and change the line below to "/logo.png". Until then a plain text name is shown.
export const LOGO_SRC: string | null = null;
