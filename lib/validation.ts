import { z } from "zod";
import { toLocalPhone } from "@/lib/format";

// Accepts 03XXXXXXXXX, 923XXXXXXXXX or +923XXXXXXXXX and stores it as 03XXXXXXXXX.
export const phoneSchema = z
  .string()
  .trim()
  .refine((v) => toLocalPhone(v) !== null, {
    message: "Enter a valid Pakistani mobile number, for example 03XXXXXXXXX",
  })
  .transform((v) => toLocalPhone(v) as string);

export const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: phoneSchema,
  address: z.string().trim().min(10, "Enter your complete delivery address").max(300),
  city: z.string().trim().min(2, "Enter your city").max(60),
  notes: z.string().trim().max(500).optional().default(""),
  // Transaction ID / reference for advance payment (required by the database for non-COD cities)
  payment_reference: z.string().trim().max(120).optional().default(""),
  // Only IDs and quantities are accepted. Prices are NEVER taken from the browser.
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Your cart is empty")
    .max(50),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
