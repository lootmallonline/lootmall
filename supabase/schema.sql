-- LootMall database schema (v2, complete). Run ONCE in Supabase > SQL Editor on a NEW project.
-- Already have the old v1 database? Do NOT run this file. Run supabase/upgrade-v2.sql instead.
-- It only creates new tables; it does not touch your existing website or domain.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------
-- 1. People and roles  (admin now; seller role is ready for later)
-- ---------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('admin', 'seller', 'customer')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------
-- 2. Future marketplace: vendors (not used by the storefront yet)
-- ---------------------------------------------------------------
create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  name text not null,
  slug text not null unique,
  status text not null default 'pending' check (status in ('pending', 'active', 'suspended')),
  commission_rate numeric(5,2) not null default 10 check (commission_rate between 0 and 100),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 3. Catalogue
-- ---------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.vendors(id) on delete set null, -- null = sold by LootMall itself
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  sku text unique,
  short_description text,
  description text,
  regular_price integer not null check (regular_price >= 0),  -- whole rupees
  sale_price integer check (sale_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  images text[] not null default '{}',
  video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sale_below_regular check (sale_price is null or sale_price < regular_price)
);
create index products_category_idx on public.products(category_id);
create index products_active_idx on public.products(is_active, is_featured);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link_url text,
  placement text not null default 'hero' check (placement in ('hero', 'promo')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- One-row table for store settings
create table public.settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'LootMall',
  tagline text not null default 'Shop Smart, Save Big Every Day',
  delivery_charge integer not null default 299 check (delivery_charge >= 0),
  contact_phone text not null default '03129585407',
  contact_email text not null default 'lootmall.online@gmail.com',
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1);

-- ---------------------------------------------------------------
-- 4. Orders (customers never read or write these tables directly)
-- ---------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'ready_to_ship', 'shipped', 'delivered', 'cancelled')),
  customer_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  notes text,
  subtotal integer not null default 0,
  delivery_charge integer not null default 0,
  total integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_created_idx on public.orders(created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  name text not null,
  sku text,
  unit_price integer not null,
  quantity integer not null check (quantity > 0),
  line_total integer not null
);
create index order_items_order_idx on public.order_items(order_id);

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create trigger orders_touch   before update on public.orders   for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.settings for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------
-- 5. Secure checkout: the server calls this; prices come from the DB
-- ---------------------------------------------------------------
create or replace function public.create_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_city text,
  p_notes text,
  p_items jsonb          -- [{"product_id": "...", "quantity": 2}, ...]
)
returns table (out_order_number text, out_total integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_number text;
  v_subtotal integer := 0;
  v_delivery integer;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_price integer;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'Cart is empty or invalid';
  end if;

  select s.delivery_charge into v_delivery from public.settings s where s.id = 1;

  v_number := 'LM-' || to_char(now() at time zone 'Asia/Karachi', 'YYMMDD') || '-'
              || upper(substr(md5(gen_random_uuid()::text), 1, 6));

  insert into public.orders (order_number, customer_name, phone, address, city, notes, delivery_charge)
  values (v_number, p_customer_name, p_phone, p_address, p_city, nullif(p_notes, ''), v_delivery)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 20 then
      raise exception 'Invalid quantity';
    end if;

    select * into v_product
      from public.products
      where id = (v_item->>'product_id')::uuid and is_active
      for update;
    if not found then
      raise exception 'A product in your cart is no longer available';
    end if;
    if v_product.stock < v_qty then
      raise exception 'Not enough stock for %', v_product.name;
    end if;

    v_price := coalesce(v_product.sale_price, v_product.regular_price);

    insert into public.order_items (order_id, product_id, vendor_id, name, sku, unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.vendor_id, v_product.name, v_product.sku, v_price, v_qty, v_price * v_qty);

    update public.products set stock = stock - v_qty where id = v_product.id;
    v_subtotal := v_subtotal + v_price * v_qty;
  end loop;

  update public.orders set subtotal = v_subtotal, total = v_subtotal + v_delivery where id = v_order_id;

  return query select v_number, v_subtotal + v_delivery;
end;
$$;

-- Only the server (service role) may place orders. Browsers cannot call this.
revoke all on function public.create_order(text, text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_order(text, text, text, text, text, jsonb) to service_role;

-- ---------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.vendors     enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.banners     enable row level security;
alter table public.settings    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- profiles: a user may read only their own row; nobody can edit roles from the browser
create policy "read own profile" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- vendors: admin only for now (seller self-service comes later)
create policy "admin manages vendors" on public.vendors for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- categories: public can read active ones, admin manages
create policy "public reads categories" on public.categories for select to anon, authenticated
  using (is_active or public.is_admin());
create policy "admin manages categories" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- products: public can read active ones, admin manages
create policy "public reads products" on public.products for select to anon, authenticated
  using (is_active or public.is_admin());
create policy "admin manages products" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- banners
create policy "public reads banners" on public.banners for select to anon, authenticated
  using (is_active or public.is_admin());
create policy "admin manages banners" on public.banners for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- settings: public can read (delivery charge and contact details are not secret)
create policy "public reads settings" on public.settings for select to anon, authenticated using (true);
create policy "admin updates settings" on public.settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- orders and order_items: admin only. Customers have NO direct access;
-- orders are created by the server through create_order().
create policy "admin reads orders" on public.orders for select to authenticated using (public.is_admin());
create policy "admin updates orders" on public.orders for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin reads order items" on public.order_items for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------
-- 7. Storage bucket for product images and videos
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media', 'product-media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
on conflict (id) do nothing;

create policy "public reads product media" on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-media');
create policy "admin uploads product media" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-media' and public.is_admin());
create policy "admin updates product media" on storage.objects for update to authenticated
  using (bucket_id = 'product-media' and public.is_admin());
create policy "admin deletes product media" on storage.objects for delete to authenticated
  using (bucket_id = 'product-media' and public.is_admin());

-- ---------------------------------------------------------------
-- 7b. Dashboard statistics (admin only) and starter categories
-- ---------------------------------------------------------------
create or replace function public.admin_stats()
returns json
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  return json_build_object(
    'products',        (select count(*) from public.products),
    'active_products', (select count(*) from public.products where is_active),
    'orders',          (select count(*) from public.orders),
    'pending',         (select count(*) from public.orders where status = 'pending'),
    'sales_total',     (select coalesce(sum(total), 0) from public.orders where status <> 'cancelled'),
    'delivered_total', (select coalesce(sum(total), 0) from public.orders where status = 'delivered')
  );
end;
$$;
revoke all on function public.admin_stats() from public, anon;
grant execute on function public.admin_stats() to authenticated;

-- Starter categories (you can rename, hide or delete them in Admin > Categories).
insert into public.categories (name, slug, sort_order) values
  ('Fashion', 'fashion', 1),
  ('Electronics', 'electronics', 2),
  ('Home Essentials', 'home-essentials', 3),
  ('Beauty', 'beauty', 4),
  ('Accessories', 'accessories', 5)
on conflict (slug) do nothing;

-- =====================================================================
-- v2 FEATURES (included here for new databases): Daraz-style statuses,
-- auto-restock on cancel, status history, customer accounts, city-based
-- COD / advance payment, payment account details.
-- =====================================================================
-- ---------------------------------------------------------------
-- 1. New order statuses
-- ---------------------------------------------------------------
alter table public.orders drop constraint if exists orders_status_check;

update public.orders
set status = case status
  when 'confirmed' then 'pending'
  when 'ready_to_ship' then 'packed'
  when 'shipped' then 'dispatched'
  else status
end
where status in ('confirmed', 'ready_to_ship', 'shipped');

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending', 'packed', 'dispatched', 'delivered', 'cancelled'));

-- ---------------------------------------------------------------
-- 2. New columns
-- ---------------------------------------------------------------
alter table public.orders
  add column if not exists customer_id uuid references public.profiles(id) on delete set null,
  add column if not exists payment_method text not null default 'cod',
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists payment_reference text;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders drop constraint if exists orders_payment_status_check;
alter table public.orders
  add constraint orders_payment_method_check check (payment_method in ('cod', 'advance')),
  add constraint orders_payment_status_check check (payment_status in ('unpaid', 'awaiting_verification', 'paid'));

create index if not exists orders_customer_idx on public.orders(customer_id);

alter table public.profiles
  add column if not exists phone text,
  add column if not exists contact_email text;
create unique index if not exists profiles_phone_key on public.profiles(phone) where phone is not null;
create unique index if not exists profiles_contact_email_key on public.profiles(lower(contact_email)) where contact_email is not null;

alter table public.settings
  add column if not exists cod_cities text not null default 'Rawalpindi, Islamabad',
  add column if not exists bank_name text not null default '',
  add column if not exists bank_account_title text not null default '',
  add column if not exists bank_account_number text not null default '',
  add column if not exists bank_qr_url text not null default '',
  add column if not exists easypaisa_title text not null default '',
  add column if not exists easypaisa_number text not null default '',
  add column if not exists easypaisa_qr_url text not null default '',
  add column if not exists jazzcash_title text not null default '',
  add column if not exists jazzcash_number text not null default '',
  add column if not exists jazzcash_qr_url text not null default '';

-- ---------------------------------------------------------------
-- 3. Status history
-- ---------------------------------------------------------------
create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  created_at timestamptz not null default now()
);
create index if not exists order_status_history_order_idx on public.order_status_history(order_id, created_at);
alter table public.order_status_history enable row level security;

-- Give existing orders a starting history
insert into public.order_status_history (order_id, status, created_at)
select o.id, 'pending', o.created_at
from public.orders o
where not exists (select 1 from public.order_status_history h where h.order_id = o.id);

insert into public.order_status_history (order_id, status, created_at)
select o.id, o.status, o.updated_at
from public.orders o
where o.status <> 'pending'
  and (select count(*) from public.order_status_history h where h.order_id = o.id) = 1;

-- ---------------------------------------------------------------
-- 4. Rules + automatic history + automatic restock
-- ---------------------------------------------------------------
create or replace function public.orders_before_update()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'cancelled' and new.status <> 'cancelled' then
    raise exception 'A cancelled order cannot be reopened';
  end if;
  if old.status = 'delivered' and new.status <> 'delivered' then
    raise exception 'A delivered order cannot be changed';
  end if;
  -- Cash on Delivery is paid when the parcel is delivered
  if new.status = 'delivered' and old.status <> 'delivered' and new.payment_method = 'cod' then
    new.payment_status := 'paid';
  end if;
  return new;
end;
$$;

drop trigger if exists orders_before_update_trg on public.orders;
create trigger orders_before_update_trg
  before update on public.orders
  for each row execute function public.orders_before_update();

create or replace function public.orders_after_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_history (order_id, status) values (new.id, new.status);
  elsif new.status is distinct from old.status then
    insert into public.order_status_history (order_id, status) values (new.id, new.status);
    if new.status = 'cancelled' then
      -- Put the items back into stock (once: a cancelled order can never be reopened)
      update public.products p
      set stock = p.stock + s.qty
      from (
        select product_id, sum(quantity)::integer as qty
        from public.order_items
        where order_id = new.id and product_id is not null
        group by product_id
      ) s
      where p.id = s.product_id;
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists orders_after_change_trg on public.orders;
create trigger orders_after_change_trg
  after insert or update on public.orders
  for each row execute function public.orders_after_change();

-- ---------------------------------------------------------------
-- 5. Customer profile trigger (stores phone + contact email)
-- ---------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, contact_email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(lower(new.raw_user_meta_data->>'contact_email'), '')
  );
  return new;
end;
$$;

-- ---------------------------------------------------------------
-- 6. Secure checkout v2 (city-based payment, customer link)
-- ---------------------------------------------------------------
drop function if exists public.create_order(text, text, text, text, text, jsonb);
drop function if exists public.create_order(text, text, text, text, text, jsonb, uuid, text);

create or replace function public.create_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_city text,
  p_notes text,
  p_items jsonb,
  p_customer_id uuid default null,
  p_payment_reference text default ''
)
returns table (out_order_number text, out_total integer, out_payment_method text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_number text;
  v_subtotal integer := 0;
  v_delivery integer;
  v_cod_cities text;
  v_is_cod boolean;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty integer;
  v_price integer;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'Cart is empty or invalid';
  end if;

  select s.delivery_charge, s.cod_cities into v_delivery, v_cod_cities
  from public.settings s where s.id = 1;

  -- Cash on Delivery only for the cities listed in Admin > Settings
  v_is_cod := exists (
    select 1
    from unnest(string_to_array(lower(coalesce(v_cod_cities, '')), ',')) as t(c)
    where btrim(c) <> '' and position(btrim(c) in lower(p_city)) > 0
  );

  if not v_is_cod and length(btrim(coalesce(p_payment_reference, ''))) < 4 then
    raise exception 'Advance payment is required for your city. Please pay first and enter your payment transaction ID.';
  end if;

  v_number := 'LM-' || to_char(now() at time zone 'Asia/Karachi', 'YYMMDD') || '-'
              || upper(substr(md5(gen_random_uuid()::text), 1, 6));

  insert into public.orders (
    order_number, customer_id, customer_name, phone, address, city, notes, delivery_charge,
    payment_method, payment_status, payment_reference
  )
  values (
    v_number, p_customer_id, p_customer_name, p_phone, p_address, p_city, nullif(p_notes, ''), v_delivery,
    case when v_is_cod then 'cod' else 'advance' end,
    case when v_is_cod then 'unpaid' else 'awaiting_verification' end,
    nullif(btrim(coalesce(p_payment_reference, '')), '')
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty < 1 or v_qty > 20 then
      raise exception 'Invalid quantity';
    end if;

    select * into v_product
      from public.products
      where id = (v_item->>'product_id')::uuid and is_active
      for update;
    if not found then
      raise exception 'A product in your cart is no longer available';
    end if;
    if v_product.stock < v_qty then
      raise exception 'Not enough stock for %', v_product.name;
    end if;

    v_price := coalesce(v_product.sale_price, v_product.regular_price);

    insert into public.order_items (order_id, product_id, vendor_id, name, sku, unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.vendor_id, v_product.name, v_product.sku, v_price, v_qty, v_price * v_qty);

    update public.products set stock = stock - v_qty where id = v_product.id;
    v_subtotal := v_subtotal + v_price * v_qty;
  end loop;

  update public.orders set subtotal = v_subtotal, total = v_subtotal + v_delivery where id = v_order_id;

  return query select v_number, v_subtotal + v_delivery, case when v_is_cod then 'cod' else 'advance' end;
end;
$$;

revoke all on function public.create_order(text, text, text, text, text, jsonb, uuid, text) from public, anon, authenticated;
grant execute on function public.create_order(text, text, text, text, text, jsonb, uuid, text) to service_role;

-- ---------------------------------------------------------------
-- 7. Row Level Security for customers and history
-- ---------------------------------------------------------------
drop policy if exists "customers read own orders" on public.orders;
create policy "customers read own orders" on public.orders for select to authenticated
  using (customer_id = auth.uid());

drop policy if exists "customers read own order items" on public.order_items;
create policy "customers read own order items" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

drop policy if exists "admin reads status history" on public.order_status_history;
create policy "admin reads status history" on public.order_status_history for select to authenticated
  using (public.is_admin());

drop policy if exists "customers read own status history" on public.order_status_history;
create policy "customers read own status history" on public.order_status_history for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

-- ---------------------------------------------------------------
-- 8. Admin: customers vs guest checkouts
-- ---------------------------------------------------------------
create or replace function public.admin_customer_stats()
returns json
language plpgsql
security definer
stable
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  return json_build_object(
    'registered_customers', (select count(*) from public.profiles where role = 'customer'),
    'orders_by_registered', (select count(*) from public.orders where customer_id is not null),
    'guest_orders',         (select count(*) from public.orders where customer_id is null),
    'guest_customers',      (select count(distinct phone) from public.orders where customer_id is null)
  );
end;
$$;
revoke all on function public.admin_customer_stats() from public, anon;
grant execute on function public.admin_customer_stats() to authenticated;

create or replace function public.admin_customers(p_limit integer default 100, p_offset integer default 0)
returns table (
  id uuid,
  full_name text,
  phone text,
  contact_email text,
  created_at timestamptz,
  order_count bigint,
  total_spent bigint
)
language sql
security definer
stable
set search_path = public
as $$
  select p.id, p.full_name, p.phone, p.contact_email, p.created_at,
         count(o.id),
         coalesce(sum(o.total) filter (where o.status <> 'cancelled'), 0)::bigint
  from public.profiles p
  left join public.orders o on o.customer_id = p.id
  where p.role = 'customer' and public.is_admin()
  group by p.id
  order by p.created_at desc
  limit least(greatest(p_limit, 1), 200) offset greatest(p_offset, 0);
$$;
revoke all on function public.admin_customers(integer, integer) from public, anon;
grant execute on function public.admin_customers(integer, integer) to authenticated;

-- ---------------------------------------------------------------
-- 8. Creating the FIRST administrator (do this after the schema runs)
-- ---------------------------------------------------------------
-- a) Supabase > Authentication > Users > Add user > Create new user
--    (enter your email and a strong password, tick "Auto Confirm User").
-- b) Then run this in the SQL Editor, using that same email:
--
--    update public.profiles set role = 'admin'
--    where id = (select id from auth.users where email = 'YOUR-EMAIL-HERE');
--
-- c) Supabase > Authentication > Sign In / Providers > turn OFF
--    "Allow new users to sign up" so strangers cannot create accounts.
