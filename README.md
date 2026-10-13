# LootMall — Online Store (Next.js + Supabase + Netlify)

Ye guide beginner ke liye hai. Har step ko order mein follow karein. Code ya programming aane ki zaroorat nahi.

**Aap ko 3 free accounts chahiye:** GitHub, Supabase, Netlify (teeno ke liye sirf email chahiye, card nahi).

> **Pehle ye parh lein:** Is project ko mere (Claude ke) environment mein install/build karke test **nahi** kiya ja saka (internet band tha). Isliye pehli baar Netlify par build chalne par koi chhota error aa sakta hai. Agar aaye to Netlify ke "Deploy log" ka aakhri hissa copy karke mujhe bhej dein, main fix kar dunga. Detail neeche "Kya test hua, kya nahi" mein hai.

---

## Is mein kya kya hai

**Customer website:** homepage (banners, categories, featured products, new arrivals), search, category pages, product page (photos + video), Add to Cart, Buy Now, cart, checkout (naam, phone, address, city, notes), order number, order confirmation, WhatsApp button, Privacy/Shipping/Return policy aur Contact pages.

**Admin dashboard (`/admin`):** secure login, products add/edit/delete, photos aur video upload, regular price / sale price / discount / stock / SKU / category, categories, banners aur offers, orders (search, status change, customer details), dashboard statistics, delivery charges aur contact settings.

**Security:** customer sirf products dekh sakta hai. Orders sirf server ke zariye bante hain aur price hamesha database se aati hai (browser se badli nahi ja sakti). Admin pages sirf admin account ko khulte hain. Secret key sirf Netlify mein rehti hai, code mein kahin nahi.

**Abhi shamil NAHI:** online payment gateway, seller/vendor portal (sirf database tayyar hai), customer accounts. Ye jaan bujh kar nahi banaye.

---

## STEP 1 — Supabase (database) banayein

1. https://supabase.com par jayen → **Sign up** → **New project**.
2. Name: `lootmall`. **Database Password** koi strong password likhein aur kahin save kar lein. Region: aap ke qareeb wala (jaise Singapore). Plan: **Free**. **Create new project** dabayen aur 1–2 minute intezar karein.
3. Left menu mein **SQL Editor** → **New query**.
4. Is folder ki file `supabase/schema.sql` kholen, **saara text copy** karein, SQL Editor mein paste karein, phir **Run** dabayen. "Success" aana chahiye. (Ye sirf **ek dafa** chalani hai.)
5. **Keys copy karein:** left menu mein **Project Settings → API** (ya "API Keys"). Teen cheezen note karein:
   - **Project URL** (`https://xxxx.supabase.co`)
   - **anon** (public) key
   - **service_role** key (isay **kisi ko mat dikhayen**, sirf Netlify mein dalni hai)

   Agar sirf "Publishable key" aur "Secret key" dikhein, to "Legacy API keys" tab mein anon/service_role mil jati hain. Wohi use karein.

### Pehla admin banayein
1. Supabase mein **Authentication → Users → Add user → Create new user**. Apni email aur strong password dalein, **Auto Confirm User** tick karein, **Create user**.
2. **SQL Editor → New query** mein ye likhein (apni email ke saath) aur **Run** karein:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'APNI-EMAIL-YAHAN');
   ```
3. **Authentication → Sign In / Providers** (ya Settings) mein **"Allow new users to sign up"** ko **OFF** karein, taake koi aur account na bana sake.

---

## STEP 2 — GitHub par upload karein

1. https://github.com par account banayein → **New repository** → name `lootmall` → **Private** → **Create repository**.
2. Is zip ko computer par **Extract** karein. Andar `lootmall` folder hai.
3. GitHub repository page par **uploading an existing file** link dabayen.
4. `lootmall` folder ke **andar ki saari files aur folders** (package.json, src, supabase, public, ...) drag karke daal dein. Agar GitHub kahe ke files zyada hain (100 se zyada), to do hisson mein upload karein.
5. Neeche **Commit changes** dabayen.

> Dhyan: koi `.env.local` file kabhi upload na karein. Is project mein wo hai hi nahi.

---

## STEP 3 — Netlify par deploy karein

1. https://app.netlify.com → **Add new project → Import an existing project → GitHub** → apni `lootmall` repository chunein.
2. Build settings **jaisi hain waisi rehne dein** (Netlify Next.js khud pehchan leta hai).
3. **Environment variables** (Add variable) mein ye 4 add karein:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase ka Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
   | `NEXT_PUBLIC_SITE_URL` | `https://lootmall.online` |

4. **Deploy** dabayen. 2–5 minute lagte hain.
5. Deploy ke baad Netlify aap ko ek link dega, jaise `https://kuch-naam.netlify.app`. **Pehle isi link par poora test karein** (neeche checklist).

Agar baad mein koi variable badlein, to **Deploys → Trigger deploy → Clear cache and deploy site** karein.

---

## STEP 4 — Apna domain lootmall.online jorein (HTTPS ke saath)

**Aham:** Naya store pehle `netlify.app` link par test karein. Domain tab badlein jab aap ko yaqeen ho. Domain badalne se purani site wahan se hat jayegi jahan domain lagi hui hai.

1. Naye Netlify project mein **Domain management → Add a domain** → `lootmall.online` likhein.
2. Agar Netlify kahe ke "domain pehle se aap ki kisi dusri site par hai" (purani LootMall site), to pehle purani site ke **Domain management** mein ja kar `lootmall.online` aur `www` **hata dein**, phir naye project mein add karein. (Ye wohi lamha hai jab live site naye store par switch hoti hai.)
3. DNS: agar aap ka DNS Cloudflare mein hai, to Netlify jo records dikhaye wo wahan dalen ya check karein ke pehle se sahi hain. Netlify wale records ko Cloudflare mein **"DNS only" (grey cloud)** rakhein, warna HTTPS certificate mein masla aa sakta hai. Jo records Netlify ne nahi maange (jaise `api.lootmall.online` ya email wale), unhein **chhedein nahi**.
4. **Domain management → HTTPS** mein **Verify DNS configuration** phir **Provision certificate** (Let's Encrypt) dabayen. Mukammal hone par **Force HTTPS** on karein.
5. Agar kuch bigre, to domain wapis purani site par laga kar pehli halat par aa sakte hain. Isi liye pehle test zaroori hai.

---

## STEP 5 — Apna logo lagayein

1. Apna logo file (jaise `logo.png`) `public` folder mein daalein (GitHub par **Add file → Upload files**).
2. GitHub par `src/lib/site.ts` kholen, pencil icon dabayen, `LOGO_SRC = null` ko `LOGO_SRC = "/logo.png"` kar dein, **Commit**. Netlify khud dobara deploy kar dega.

Jab tak logo nahi lagta, sirf text naam "LootMall" dikhta hai. Maine koi logo nahi banaya.

---

## Admin panel kaise istemal karein

Login: `https://lootmall.online/admin`

1. **Categories:** pehle se 5 starter categories hain. Rename/hide/delete ya nayi add kar sakte hain.
2. **Products → Add product:** naam, SKU, category, price, sale price (ya discount %), stock likhein; photos aur (optional) video upload karein; **Save product**. Pehli photo main photo hoti hai.
3. **Banners:** "Top of homepage" slider ke liye, "Offer tile" categories ke neeche ke offers ke liye.
4. **Orders:** order kholein, status badlein (Pending → Confirmed → Ready to Ship → Shipped → Delivered / Cancelled). Customer ko WhatsApp ka link bhi wahin hai.
5. **Settings:** delivery charge (shuru mein Rs. 299), phone, email, tagline.

Note: Admin mein koi photo "remove" karne se wo product se hat jati hai, lekin Supabase Storage mein file rehti hai (free storage ki limit ka khayal rakhein).

---

## Testing checklist (publish karne se pehle)

- [ ] Homepage khulta hai, koi error nahi, mobile par theek dikhta hai.
- [ ] `/admin` par bina login jayen → login page par bhej diya jata hai.
- [ ] Admin login hota hai. Galat password par error aata hai.
- [ ] Ek test product add karein (photo ke saath) → store par nazar aata hai.
- [ ] Sale price lagayen → discount badge aur price theek dikhte hain.
- [ ] Search se product milta hai. Category page kaam karta hai.
- [ ] Product page: gallery, quantity, **Add to Cart** aur **Buy Now** kaam karte hain.
- [ ] Cart: quantity badalna, remove, total + Rs. 299 delivery sahi hai. Page refresh par cart bacha rehta hai.
- [ ] Checkout: khali ya galat phone number par error aata hai. Sahi data par order ban jata hai.
- [ ] Confirmation page par unique order number (jaise `LM-261013-AB12CD`) aata hai. Cart khali ho jata hai.
- [ ] Admin → Orders mein wohi order dikhta hai, details sahi hain, status badalta hai.
- [ ] Order ke baad product ka stock kam hua.
- [ ] Settings mein delivery charge badal kar naye order par check karein.
- [ ] Out-of-stock product ka "Add to Cart" band hai.
- [ ] WhatsApp button sahi number par khulta hai.
- [ ] https://lootmall.online (padlock ke saath) khulta hai.
- [ ] Test orders/products delete kar dein.

---

## Kya test hua, kya nahi (sach)

- **Nahi chalaya gaya:** `npm install`, `npm run build`, poora TypeScript type-check, aur live Supabase/Netlify. Mere environment mein internet band tha. Isliye "build pass hua" ka koi dawa nahi hai.
- **Chalaya gaya:** files ka syntax check (TypeScript compiler se), aur imports/routes ka manual review.
- Pehli deploy par koi chhota error aa sakta hai (jaise type ka masla ya package version). Log bhej dein, fix ho jayega.

## Aam masail

- **Site par "Products are coming soon":** ya to abhi products nahi dale, ya Netlify ke environment variables ghalat hain. Variables theek karke "Clear cache and deploy" karein.
- **Admin login ke baad wapas login page:** check karein ke SQL se `role = 'admin'` wali query chali thi aur email bilkul wohi hai.
- **Photo upload fail:** schema.sql poori Run hui thi? (Storage bucket usi se banta hai.) Photo 10 MB se chhoti aur video 50 MB se chhoti honi chahiye.
- **Supabase free project ruk jaye:** bohat din istemal na ho to free project pause ho sakta hai. Supabase dashboard mein **Restore** dabayen.
- **Order na bane, "could not place order":** `SUPABASE_SERVICE_ROLE_KEY` Netlify mein theek hai? Phir deploy karein.

## Technical notes (developer ke liye)

- Next.js 15 App Router, TypeScript, Tailwind 3, Supabase (Postgres + Auth + Storage). Netlify ka official Next.js runtime server features (API routes, server actions, middleware) chalata hai. Static-only hosting par ye project **nahi** chalega.
- Checkout: browser sirf `product_id` + `quantity` bhejta hai. `POST /api/checkout` zod se validate karta hai aur service-role se Postgres function `create_order()` chalata hai, jo price, stock aur delivery charge khud nikalta hai aur stock atomically kam karta hai. Is function par `anon/authenticated` ka execute revoke hai.
- RLS: public sirf active products/categories/banners aur settings parh sakta hai. Orders aur order_items sirf admin. Storage bucket `product-media`: public read, admin write.
- Marketplace ke liye tayyar: `vendors` table (commission_rate), `products.vendor_id`, `order_items.vendor_id`, `profiles.role = 'seller'`. Seller portal aur payouts abhi nahi bane.
- Limitations: checkout par rate-limiting nahi (sirf hidden spam-trap field). Zyada traffic par Cloudflare/Netlify ki rate limits ya CAPTCHA add karna chahiye.
- Local chalane ke liye (optional): `npm install`, `.env.example` ko `.env.local` mein copy karke values bharein, phir `npm run dev`.
- Policy pages (Privacy/Shipping/Return) ka text aam sa draft hai. Launch se pehle apne business ke hisab se parh kar badal lein (`src/app/(shop)/*-policy/page.tsx`).
