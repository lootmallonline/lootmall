# LootMall — Online Store (Next.js + Supabase + Cloudflare Workers)

Ye guide beginner ke liye hai (Roman Urdu). Har step order mein follow karein.

> **Sach pehle:** Cloudflare Worker production bundle and checkout smoke tests were run for this update. A live Supabase order and Cloudflare upload still need verification in the deployment environment; details are below.

---

## Version 2 mein kya naya hai

1. **Daraz jaisa order flow:** Pending → Packed / Ready to Ship → Dispatched → Delivered, aur Cancelled. Order **Cancel** karte hi saman **khud wapas stock mein** chala jata hai. Cancelled ya Delivered order dobara badla nahi ja sakta.
2. **Customer login:** mobile number (ya email) + password. Customer apne orders ki status history dekh sakta hai (`/account`). Bina login wale customer `/track` par order number + phone se order dekh sakte hain.
3. **Admin → Customers:** registered customers aur guest (direct) checkouts ki ginti, customer list, aur password reset.
4. **Packing label aur invoice:** Admin → Orders → order kholen → **Print Packing Label** (4×6 in thermal ya 3×7 in) ya **Print Invoice** (A4). Label par logo/naam, support phone, order ID + barcode, customer ki details, items, aur COD amount hota hai.
5. **City ke hisab se payment:** **Rawalpindi / Islamabad** mein **Cash on Delivery**. **Baqi cities** mein **Advance Payment** (Bank / EasyPaisa / JazzCash ki details aur QR checkout par dikhte hain). Ye details aur COD cities ki list **Admin → Settings** se badalti hain.
6. **Cloudflare Workers ke liye:** tamam routes ab **Edge runtime** par hain.

---

## Checkout configuration

`POST /api/checkout` validates customer details and cart IDs/quantities, then invokes the database `create_order()` function through the Supabase service client. The database—not the browser—checks active products and stock, calculates prices and delivery, and inserts the order and its line items atomically. The service-role key is required at runtime; configure it as a secret in the Cloudflare Worker. Missing configuration is reported as `(Code: CONFIG)` and database errors include a code in the response and server logs.

---

## UPGRADE (agar purana v1 database already bana hua hai)

**Order bahut zaroori hai: pehle SQL, phir code.**

1. Supabase → **SQL Editor → New query**.
2. File **`supabase/upgrade-v2.sql`** ka poora text paste karke **Run**. "Success" aana chahiye. (Purane orders ki status khud naye naam mein badal jati hain: Confirmed → Pending, Ready to Ship → Packed, Shipped → Dispatched.)
3. Deploy the code only after the SQL migration succeeds.

**Naya (khali) database hai?** To sirf **`supabase/schema.sql`** chalayen (isme v2 shamil hai). `upgrade-v2.sql` na chalayen.

---

## STEP 1 — Supabase (database)

1. https://supabase.com → **New project** (name `lootmall`, strong database password, region apka qareebi, **Free** plan).
2. **SQL Editor → New query** mein `supabase/schema.sql` paste karke **Run** (sirf naye database ke liye).
3. **Project Settings → API** se teen cheezen copy karein: **Project URL**, **anon** key, **service_role** key (service_role key kisi ko na dikhayen).

### Pehla admin
1. **Authentication → Users → Add user → Create new user** (apni email + strong password, **Auto Confirm User** tick).
2. SQL Editor mein (apni email ke saath) chalayen:
   ```sql
   update public.profiles set role = 'admin'
   where id = (select id from auth.users where email = 'APNI-EMAIL-YAHAN');
   ```
3. **Authentication → Sign In / Providers** mein **"Allow new users to sign up"** OFF rakhein. Customer accounts website khud server se banati hai, is liye ye OFF hone se customers ko koi masla nahi hota.

---

## STEP 2 — GitHub

1. github.com par **private** repository `lootmall` banayein.
2. Zip extract karein. `lootmall` folder ke **andar ki saari files aur folders** repository mein upload karein (**Add file → Upload files**). Purani files naye content se replace ho jati hain.
3. **Commit changes**.

> GitHub ke browser upload mein ek dafa mein **100 files** ki limit hoti hai. Ab project mein 100 se zyada files hain, is liye **do hisson mein** upload karein (pehle `src` folder, phir baqi sab).

---

## STEP 3 — Cloudflare Workers par deploy

1. dash.cloudflare.com → **Workers & Pages → Create → Workers → Connect to Git** → `lootmall` repository.
2. Set the deployment command to `npm run deploy`. The OpenNext Cloudflare adapter builds the Worker and Wrangler deploys it using `wrangler.jsonc`. The compatibility date and `nodejs_compat` flag are already set there. Use `npm run cf:build` to build without deploying.
3. **Worker environment variables** add karein:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key (**Secret** type) |
   | `NEXT_PUBLIC_SITE_URL` | `https://lootmall.online` |

   Set the three `NEXT_PUBLIC_*` values as build variables (they are public and included in the site bundle) and as Worker variables for server requests. Store `SUPABASE_SERVICE_ROLE_KEY` only as a Worker secret; never add it as a build variable. Configure runtime values in each Worker environment you deploy.
4. Deploy and test the `workers.dev` URL before attaching any custom domain.

> Existing Supabase projects must run `supabase/upgrade-v2.sql` before deployment; new projects should use `supabase/schema.sql`. Cloudflare Pages `next-on-pages` is no longer the production target: this project uses the OpenNext Cloudflare Workers adapter. Do not change DNS until the Worker deployment has been verified.

After the Worker is verified, attach a custom domain from the Worker settings. Do not alter the existing DNS records until you are ready to switch production traffic.

(Netlify par bhi ye project chal sakta hai, `netlify.toml` maujood hai.)

---

## Admin kaise istemal karein (`/admin`)

- **Orders:** order kholein → status badlein → **Print Packing Label** / **Print Invoice**. Label par COD amount tab aata hai jab order COD ho aur Paid na ho. Advance order ko packing se pehle **Payment status = Paid** karein (customer ka transaction ID order mein likha hota hai).
- **Settings:** delivery charge, phone/email, **COD cities** (comma se alag, jaise `Rawalpindi, Islamabad, Pindi, RWP`), aur Bank / EasyPaisa / JazzCash ki details + QR image upload. Khali account customer ko nahi dikhta.
- **Customers:** registered vs guest ginti, customer ki password reset.
- **Products / Categories / Banners:** pehle jaisa.

**City ka rule:** customer ki likhi hui city mein COD list ka koi lafz aaye (jaise "Islamabad F-7" mein "Islamabad") to COD, warna Advance. Ye faisla **database** karta hai, browser nahi, is liye customer ise badal nahi sakta.

---

## Testing checklist

- [ ] Order: city **Islamabad** likhein → "Cash on Delivery available" dikhe, order ban jaye.
- [ ] Order: city **Lahore** likhein → payment accounts dikhein, **Transaction ID ke bina** order na bane, ID ke saath ban jaye.
- [ ] Admin → Orders mein order dikhe, payment "Advance / Awaiting verification" ho.
- [ ] Status Pending → Packed → Dispatched → Delivered badal kar dekhein. COD order Delivered par khud Paid ho.
- [ ] **Cancel test:** ek test order cancel karein → product ka stock wapas barhe. Cancel ke baad status dobara badalne ki koshish par error aaye.
- [ ] **Print Packing Label** 4×6 aur 3×7 dono khulein, barcode nazar aaye, print preview mein sirf label ho.
- [ ] Customer signup (mobile + password) → login → `/account` par apne orders aur status history.
- [ ] Login ke baad order karein → woh order `/account` mein aaye. Bina login order `/track` se (order number + phone) dikhe.
- [ ] Admin → Customers mein registered aur guest ginti.
- [ ] Admin → Settings mein bank/EasyPaisa/JazzCash + QR save karein → checkout par (non-COD city) dikhein.
- [ ] `/admin` bina login kholein → login page par bhej diya jaye.
- [ ] Test orders delete/cancel kar dein, stock theek karein.

---

## Kya test hua, kya nahi (sach)

- **Passed:** `npm run typecheck`, `npm run cf:build` (Next.js production compile plus OpenNext Worker bundle), and local checkout API smoke tests for malformed JSON (400), invalid fields (422), missing secrets (CONFIG), and a successful mocked `create_order` RPC response. The RPC mock verified that the browser-controlled payload contains only product IDs and quantities.
- **Not run:** a live Supabase order, or an actual Cloudflare upload. The local mock does not replace testing against the deployed database. `npm run deploy` built the Worker but Wrangler upload stopped because this environment has no `CLOUDFLARE_API_TOKEN`.
- **Windows note:** OpenNext warns that Windows is not fully supported; the Worker bundle completed here, but production should also be verified in Cloudflare or a Linux/WSL build environment.
- **Security note:** `npm audit --omit=dev` reports 2 advisories (one moderate, one high) through Next.js's PostCSS dependency. The suggested automatic fix requires upgrading Next.js to v16, a breaking change not included here.
- **Cloudflare Workers:** before attaching a domain, configure the public build variables, Worker variables and secret above, run the Supabase schema upgrade when applicable, deploy, then test a real order.
- **Barcode:** Code 128 apni hi encoder se banta hai. Maine kisi asli scanner se scan nahi kiya. Pehle 2–3 labels print karke apne phone/scanner se test karein.

## Mehdood cheezein (jaan bujh kar / abhi nahi)

- **Customer password reset khud nahi hota** (SMS/email ka kharcha nahi). Admin → Customers se "Set new password" karein.
- Signup par mobile number ka OTP verify nahi hota. Lekin orders sirf login account se jude hote hain (phone number se nahi), is liye koi dusre ke orders nahi dekh sakta.
- Signup/checkout par rate-limit nahi (sirf hidden spam-trap field). Zyada spam par Cloudflare ka Turnstile/WAF lagayen.
- Advance payment ka screenshot customer WhatsApp par bhejta hai. Payment ko aap khud verify karke Paid karte hain.
- Cancel par advance payment ki refund aap ko khud karni hogi.

## Technical notes

- Next.js 15 App Router, Tailwind 3, Supabase. Cloudflare deployment uses OpenNext on Workers (`wrangler.jsonc`) with `nodejs_compat`; routes use dynamic rendering. Middleware sirf `/admin`, `/account`, `/checkout` par chalta hai.
- Order creation: `POST /api/checkout` → zod validation → Postgres function `create_order()` (service role). Ye price, stock, delivery charge, COD/advance (city se) aur advance mein transaction ID ki shart khud lagata hai.
- Status rules aur auto-restock database triggers mein hain (`orders_before_update`, `orders_after_change`), is liye admin ke ilawa kisi raste se bhi bypass nahi hote.
- RLS: customers sirf apne orders / items / history parh sakte hain (`customer_id = auth.uid()`). Admin sab. Public sirf active products, banners, categories, settings.
- Customers ka login Supabase Auth par hai: mobile number ek private address `<number>@customers.lootmall.online` ban jata hai (koi email nahi bheji jati), asli email profile mein sirf contact ke liye hoti hai.
- Policy pages ka text aam draft hai, launch se pehle apne business ke hisab se parh lein.
