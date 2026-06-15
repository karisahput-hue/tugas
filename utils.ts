/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CartItem, OrderForm, StoreSettings } from "./types";

/**
 * Formats a number into Indonesian Rupiah currency format.
 * E.g. 149000 -> Rp 149.000
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generates the clean encoded WhatsApp message URL.
 */
export function generateWhatsAppUrl(
  items: CartItem[],
  form: OrderForm,
  settings: StoreSettings
): string {
  const selectedPelayanName =
    form.selectedPelayan === "pelayan1"
      ? settings.pelayan1Name
      : settings.pelayan2Name;
  
  const selectedPelayanPhone =
    form.selectedPelayan === "pelayan1"
      ? settings.pelayan1Phone
      : settings.pelayan2Phone;

  // Clean raw phone number (remove +, spaces, dashes, keep digits)
  const phoneClean = selectedPelayanPhone.trim().replace(/[^0-9]/g, "");

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  let itemsText = "";
  items.forEach((item) => {
    itemsText += `${item.quantity}x ${item.product.name} - ${formatIDR(
      item.product.price * item.quantity
    )}\n`;
  });

  const paymentMethodLabel = form.paymentMethod === "qris" ? "QRIS (Pembayaran Non-Tunai)" : "Cash on Delivery (COD / Bayar di Tempat)";

  const messageText = `Halo ${selectedPelayanName} dari ${settings.storeName},

Saya ingin melakukan konfirmasi pesanan baru berikut ini:

--- RINCIAN PESANAN ---
${itemsText}
*Total Pembayaran*: ${formatIDR(subtotal)}

--- METODE PEMBAYARAN ---
*Metode*: ${paymentMethodLabel}

--- DATA PENGIRIMAN ---
*Nama Penerima*: ${form.customerName}
*No. Telepon / WhatsApp*: ${form.customerPhone}
*Alamat Lengkap*: ${form.address}
*Catatan Tambahan*: ${form.notes.trim() || "-"}

Mohon bantuannya untuk memeriksa dan memproses pesanan saya. Terima kasih banyak.`;

  return `https://wa.me/${phoneClean}?text=${encodeURIComponent(messageText)}`;
}

/**
 * Default mock raw QRIS image code base64 pattern (just in case)
 * We will also construct a gorgeous pure-SVG or canvas QR drawing to display by default,
 * so even if they haven't uploaded theirs yet, it looks stunning.
 */
export const DEFAULT_QRIS_LOGO = `/assets/qris_placeholder.png`;
