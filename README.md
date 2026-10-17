# LootMall — Online Store (Next.js + Supabase + Cloudflare Pages)

Ye guide beginner ke liye hai (Roman Urdu). Har step order mein follow karein.

> **Sach pehle:** Is project ko mere environment mein `npm install` / `npm run build` karke chalaya **nahi** ja saka (npm registry wahan band thi). Maine TypeScript type-check (strict) aur routes/imports/barcode ke checks chalaye, jo sab pass hue. Lekin asli build pehli dafa **Cloudflare par** hogi. Agar koi error aaye to Cloudflare ke "Build log" ka aakhri hissa bhej dein.

## Agar Cloudflare build fail ho (jaise "Module not found: @/lib/...")

Iska matlab hai ke GitHub par `src/lib` ki files poori nahi pohanchin. Is zip ka **poora** `src` folder (khaas kar `src/lib/` aur `src/lib/supabase/`) GitHub par dobara upload karein. Agar GitHub par purani `bun.lock` ya `package-lock.json` hai to unhein delete kar dein, taake nayi `package.json` ke hisab se install ho.

---

## Version 2 mein kya naya hai

1. **Daraz jaisa order flow:** Pending → Packed / Ready to Ship → Dispatched → Delivered, aur Cancelled. Order **Cancel** karte hi saman **khud wapas stock mein** chala jata hai. Cancelled ya Delivered order dobara badla nahi ja sakta.
2. **Customer login:** mobile number (ya email) + password. Customer apne orders ki status history dekh sakta hai (`/account`). Bina login wale customer `/track` par order number + phone se order dekh sakte hain.
3. **Admin → Customers:** registered customers aur guest (direct) checkouts ki ginti, customer list, aur password reset.
4. **Packing label aur invoice:** Admin → Orders → order kholen → **Print Packing Label** (4×6 in thermal ya 3×7 in) ya **Print Invoice** (A4). Label par logo/naam, support phone, order ID + barcode, customer ki details, items, aur COD amount hota hai.
5. **City ke hisab se payment:** **Rawalpindi / Islamabad** mein **Cash on Delivery**. **Baqi cities** mein **Advance Payment** (Bank / EasyPaisa / JazzCash ki details aur QR checkout par dikhte hain). Ye details aur COD cities ki list **Admin → Settings** se badalti hain.
6. **Cloudflare Pages ke liye:** tamam routes ab **Edge runtime** par hain.

---

## Aap ka maujooda masla: "We could not place your order"

Is ki 2 wajahein ho sakti hain, dono ab theek ki gayi hain:

1. **Node.js route Cloudflare par nahi chalta.** Pehle `/api/checkout` Node.js runtime par tha. Ab Edge par hai.
2. **Cloudflare mein `SUPABASE_SERVICE_ROLE_KEY` na hona.** Order banane ke liye ye key zaroori hai. Error ke aakhir mein `(Code: CONFIG)` aaye to yahi wajah hai. Cloudflare Pages → Settings → **Variables and Secrets** mein check karein, aur **Production aur Preview dono** mein daalein. Variable badalne ke baad **naya deploy** zaroori hai (purani deploy nayi value nahi uthati).

Agar code `(Code: PGRST202)` ya `42883` aaye, to database ka naya function nahi bana: neeche "Upgrade" ka SQL step karein.

---

## UPGRADE (agar purana v1 database already bana hua hai)

**Order bahut zaroori hai: pehle SQL, phir code.**

1. Supabase → **SQL Editor → New query**.
2. File **`supabase/upgrade-v2.sql`** ka poora text paste karke **Run**. "Success" aana chahiye. (Purane orders ki status khud naye naam mein badal jati hain: Confirmed → Pending, Ready to Ship → Packed, Shipped → Dispatched.)
3. Phir naya code GitHub par upload karein (neeche Step 2) aur Cloudflare par deploy karein.

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

## STEP 3 — Cloudflare Pages par deploy

1. dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git** → `lootmall` repository.
2. Build settings:
   - **Framework preset:** Next.js
   - **Build command:** `npx @cloudflare/next-on-pages@1`
   - **Build output directory:** `.vercel/output/static`
3. **Environment variables** (Production **aur** Preview) add karein:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_role key (**Secret** type) |
   | `NEXT_PUBLIC_SITE_URL` | `https://lootmall.online` |
   | `NODE_VERSION` | `20` |

4. **Settings → Functions (Runtime) → Compatibility flags:** `nodejs_compat` add karein (Production aur Preview dono). Compatibility date `2024-09-23` ya us se nayi.
5. **Save and Deploy**. Variable ya flag badalne ke baad hamesha **Retry deployment** / naya commit karein.
6. Cloudflare ka `.pages.dev` link kholen aur neeche ki testing checklist chalayen.

> Cloudflare Pages par **ISR / revalidate** support nahi hota, is liye saare pages har request par taaza data lete hain. Aap Admin se kuch badlein to foran nazar aata hai.

Domain: `lootmall.online` ko apne maujooda Cloudflare account mein Pages project ke **Custom domains** se jorein. Jab tak naya store test na ho jaye, purani site wale records na hatayen.

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

- **Nahi chalaya gaya:** `npm install`, `npm run build`, Cloudflare `next-on-pages` build, aur live Supabase. Mere environment mein npm registry band thi.
- **Chalaya gaya:** poore project ka strict TypeScript check (external packages ke liye shim ke saath), har page/route par `runtime = "edge"` ka check, client components mein server-only imports ka check, "use server" files ka check, aur barcode table ke checks (har pattern ka jama 11, stop ka 13, sab unique, aur encode/decode round-trip).
- **Barcode:** Code 128 apni hi encoder se banta hai. Kisi asli scanner se scan nahi kiya. Pehle 2 se 3 labels print karke apne phone/scanner se test karein.
- **next-on-pages:** ye Cloudflare ka tool hai. Is ka Next.js 15.5 ke saath chalna maine verify nahi kiya. Build fail ho to log bhej dein.
- **Edge limit:** Cloudflare ki free plan par worker size ki limit hoti hai. Agar "script too large" aaye to bata dein.

## Mehdood cheezein (jaan bujh kar / abhi nahi)

- **Customer password reset khud nahi hota** (SMS/email ka kharcha nahi). Admin → Customers se "Set new password" karein.
- Signup par mobile number ka OTP verify nahi hota. Lekin orders sirf login account se jude hote hain (phone number se nahi), is liye koi dusre ke orders nahi dekh sakta.
- Signup/checkout par rate-limit nahi (sirf hidden spam-trap field). Zyada spam par Cloudflare ka Turnstile/WAF lagayen.
- Advance payment ka screenshot customer WhatsApp par bhejta hai. Payment ko aap khud verify karke Paid karte hain.
- Cancel par advance payment ki refund aap ko khud karni hogi.

## Technical notes

- Next.js 15 App Router, Tailwind 3, Supabase. Tamam pages/layouts/route handlers par `export const runtime = "edge"` aur dynamic rendering. Middleware sirf `/admin`, `/account`, `/checkout` par chalta hai.
- Order creation: `POST /api/checkout` → zod validation → Postgres function `create_order()` (service role). Ye price, stock, delivery charge, COD/advance (city se) aur advance mein transaction ID ki shart khud lagata hai.
- Status rules aur auto-restock database triggers mein hain (`orders_before_update`, `orders_after_change`), is liye admin ke ilawa kisi raste se bhi bypass nahi hote.
- RLS: customers sirf apne orders / items / history parh sakte hain (`customer_id = auth.uid()`). Admin sab. Public sirf active products, banners, categories, settings.
- Customers ka login Supabase Auth par hai: mobile number ek private address `<number>@customers.lootmall.online` ban jata hai (koi email nahi bheji jati), asli email profile mein sirf contact ke liye hoti hai.
- Policy pages ka text aam draft hai, launch se pehle apne business ke hisab se parh lein.
