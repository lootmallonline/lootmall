-- =====================================================================
-- LootMall UPGRADE v2
--   * Daraz-style statuses + automatic restock on Cancelled
--   * Order status history (for the customer portal)
--   * Customer accounts (mobile number or email login)
--   * City-based payment: COD in listed cities, advance payment elsewhere
--   * Payment account details + QR codes (editable in Admin > Settings)
--
-- If your database ALREADY has the v1 schema: run this whole file ONCE in
-- Supabase > SQL Editor, BEFORE you deploy the new code.
-- (For a brand-new database use schema.sql, which already includes this.)
-- It is safe to run on a database that already has orders.
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
