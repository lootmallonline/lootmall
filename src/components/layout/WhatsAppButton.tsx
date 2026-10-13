import { whatsappUrl } from "@/lib/format";

export function WhatsAppButton({ phone }: { phone: string }) {
  return (
    <a
      href={whatsappUrl(phone, "Hello LootMall, I need help with an order.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <svg viewBox="0 0 32 32" width="22" height="22" fill="currentColor" aria-hidden="true">
        <path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.3.7 4.5 1.9 6.4L4 29l7.9-2c1.8 1 3.9 1.5 6.1 1.5 6.6 0 12-5.3 12-11.9S22.600 3 16 3zm0 21.800c-1.900 0-3.700-.5-5.200-1.500l-.4-.2-4.100 1 1.100-4-.3-.4a9.700 9.700 0 0 1-1.500-5.200C5.600 9.100 10.300 4.700 16 4.700s10.400 4.400 10.400 10c0 5.600-4.700 10.100-10.400 10.100zm5.700-7.500c-.3-.2-1.900-.9-2.200-1-.3-.1-.5-.2-.7.200-.2.300-.8 1-1 1.200-.2.200-.4.200-.7.100-.3-.2-1.300-.5-2.500-1.500-.9-.8-1.500-1.800-1.700-2.100-.2-.3 0-.5.100-.6l.5-.5c.2-.2.200-.3.300-.5.100-.2.100-.4 0-.5l-1-2.300c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400-.3.300-1.100 1.100-1.100 2.600 0 1.500 1.100 3 1.300 3.200.2.200 2.200 3.300 5.300 4.600 3.100 1.300 3.100.9 3.600.8.600-.1 1.900-.8 2.100-1.500.3-.7.300-1.400.2-1.500-.1-.2-.3-.2-.6-.4z" />
      </svg>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
