import { z } from "zod";

// Accepts 03XXXXXXXXX or +923XXXXXXXXX (spaces and dashes are ignored).
const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(03\d{9}|\+?923\d{9})$/.test(v), {
    message: "Enter a valid Pakistani mobile number, for example 03XXXXXXXXX",
  });

export const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: phoneSchema,
  address: z.string().trim().min(10, "Enter your complete delivery address").max(300),
  city: z.string().trim().min(2, "Enter your city").max(60),
  notes: z.string().trim().max(500).optional().default(""),
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
