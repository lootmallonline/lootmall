export const ORDER_STATUSES = ["pending", "packed", "dispatched", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  packed: "Packed / Ready to Ship",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUSES = ["unpaid", "awaiting_verification", "paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  awaiting_verification: "Awaiting verification",
  paid: "Paid",
};

export type PaymentMethod = "cod" | "advance";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  advance: "Advance Payment",
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: string;
  vendor_id: string | null;
  category_id: string | null;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  regular_price: number;
  sale_price: number | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  images: string[];
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
  placement: "hero" | "promo";
  is_active: boolean;
  sort_order: number;
}

export interface Settings {
  id: number;
  store_name: string;
  tagline: string;
  delivery_charge: number;
  contact_phone: string;
  contact_email: string;
  cod_cities: string;
  bank_name: string;
  bank_account_title: string;
  bank_account_number: string;
  bank_qr_url: string;
  easypaisa_title: string;
  easypaisa_number: string;
  easypaisa_qr_url: string;
  jazzcash_title: string;
  jazzcash_number: string;
  jazzcash_qr_url: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  sku: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_id: string | null;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  notes: string | null;
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  order_status_history?: OrderStatusHistory[];
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: "admin" | "seller" | "customer";
  phone: string | null;
  contact_email: string | null;
  created_at: string;
}
