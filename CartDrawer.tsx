/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  User,
  Phone,
  MapPin,
  FileText,
  QrCode,
  CreditCard,
  MessageSquare,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { CartItem, OrderForm, PaymentMethod, StoreSettings } from "../types";
import { formatIDR, generateWhatsAppUrl } from "../utils";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  settings: StoreSettings;
  isAdmin?: boolean;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  settings,
  isAdmin = false,
}: CartDrawerProps) {
  const [form, setForm] = useState<OrderForm>({
    customerName: "",
    customerPhone: "",
    address: "",
    notes: "",
    paymentMethod: "qris",
    selectedPelayan: "pelayan1",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [customQris, setCustomQris] = useState<string>(() => {
    try {
      return localStorage.getItem("store_custom_qris") || "";
    } catch {
      return "";
    }
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleQrisUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setCustomQris(base64);
          try {
            localStorage.setItem("store_custom_qris", base64);
          } catch (err) {
            console.error("Failed to save custom QRIS to localStorage:", err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setCustomQris(base64);
          try {
            localStorage.setItem("store_custom_qris", base64);
          } catch (err) {
            console.error("Failed to save custom QRIS to localStorage:", err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetQris = () => {
    setCustomQris("");
    try {
      localStorage.removeItem("store_custom_qris");
    } catch (err) {
      console.error(err);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectPayment = (method: PaymentMethod) => {
    setForm((prev) => ({ ...prev, paymentMethod: method }));
  };

  const handleSelectPelayan = (pelayan: "pelayan1" | "pelayan2") => {
    setForm((prev) => ({ ...prev, selectedPelayan: pelayan }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.customerName.trim()) {
      newErrors.customerName = "Nama lengkap wajib diisi";
    }
    if (!form.customerPhone.trim()) {
      newErrors.customerPhone = "Nomor WhatsApp wajib diisi";
    } else if (!/^[0-9+-\s]{8,15}$/.test(form.customerPhone.trim())) {
      newErrors.customerPhone = "Nomor WhatsApp tidak valid";
    }
    if (!form.address.trim()) {
      newErrors.address = "Alamat pengiriman wajib diisi lengkap";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Generate link and trigger open
    const waUrl = generateWhatsAppUrl(cartItems, form, settings);
    
    // Simulate short completion state, then open link
    setCheckoutComplete(true);
    
    // Open in separate tab
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  const handleResetCheckout = () => {
    setCheckoutComplete(false);
    onClearCart();
    onClose();
  };

  // Helper component for dynamic SVG mockup QR pattern
  const SimulatedQR = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-900" fill="currentColor">
      {/* Outer borders */}
      <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
      <rect x="11" y="11" width="13" height="13" />
      <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
      <rect x="76" y="11" width="13" height="13" />
      <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="6" />
      <rect x="11" y="76" width="13" height="13" />
      
      {/* Dynamic random grid squares representing QR pattern */}
      <rect x="40" y="5" width="6" height="6" />
      <rect x="52" y="5" width="6" height="12" />
      <rect x="40" y="15" width="12" height="6" />
      <rect x="46" y="25" width="18" height="6" />
      <rect x="40" y="40" width="6" height="6" />
      <rect x="5" y="40" width="12" height="6" />
      <rect x="11" y="52" width="6" height="12" />
      <rect x="23" y="40" width="12" height="12" />
      
      <rect x="75" y="40" width="20" height="6" />
      <rect x="85" y="52" width="6" height="12" />
      <rect x="70" y="60" width="10" height="6" />
      
      <rect x="40" y="55" width="18" height="6" />
      <rect x="55" y="45" width="6" height="18" />
      <rect x="45" y="70" width="12" height="12" />
      <rect x="70" y="75" width="6" height="20" />
      <rect x="82" y="75" width="12" height="6" />
      <rect x="82" y="85" width="6" height="10" />
      <rect x="45" y="88" width="18" height="6" />
    </svg>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
          />

          {/* Slider Drawer Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-xl bg-white shadow-2xl flex flex-col h-full border-l border-zinc-150"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-display font-semibold text-lg text-zinc-900">
                  Keranjang Belanja
                </span>
                <span className="bg-zinc-100 text-zinc-600 font-mono text-xs font-semibold px-2 py-0.5 rounded-full">
                  {cartItems.reduce((acc, x) => acc + x.quantity, 0)}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
                aria-label="Tutup Keranjang"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            {checkoutComplete ? (
              /* Success Checkout View */
              <div className="flex-grow overflow-y-auto px-8 py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-850 flex items-center justify-center text-white mb-6">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-2xl text-zinc-900 mb-2">
                  Pesanan Siap Dikirim!
                </h3>
                <p className="font-sans text-sm text-zinc-500 leading-relaxed max-w-sm mb-8">
                  Data konfirmasi pesanan Anda telah tersusun rapi. Jika halaman WhatsApp tidak otomatis terbuka, silakan klik tombol di bawah ini untuk memulai obrolan dengan kami.
                </p>

                <div className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-left mb-8 space-y-2">
                  <div className="text-[11px] font-sans font-semibold tracking-wider text-zinc-400 uppercase">Ringkasan Konfirmasi</div>
                  <div className="text-sm font-sans text-zinc-700"><span className="text-zinc-400 leading-none">Nama:</span> <span className="font-medium">{form.customerName}</span></div>
                  <div className="text-sm font-sans text-zinc-700"><span className="text-zinc-400 leading-none">Penerima:</span> <span className="font-medium">{form.selectedPelayan === "pelayan1" ? settings.pelayan1Name : settings.pelayan2Name}</span></div>
                  <div className="text-sm font-sans text-zinc-700"><span className="text-zinc-400 leading-none">Total:</span> <span className="font-mono font-semibold">{formatIDR(subtotal)}</span></div>
                  <div className="text-sm font-sans text-zinc-700"><span className="text-zinc-400 leading-none">Metode:</span> <span className="font-medium text-zinc-800">{form.paymentMethod === "qris" ? "QRIS" : "COD"}</span></div>
                </div>

                <div className="w-full flex flex-col sm:flex-row gap-3">
                  <a
                    href={generateWhatsAppUrl(cartItems, form, settings)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-grow inline-flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-sans font-medium text-xs tracking-wider uppercase transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Lanjutkan ke WhatsApp</span>
                  </a>
                  <button
                    onClick={handleResetCheckout}
                    className="py-3.5 px-6 rounded-2xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-sans font-medium text-xs uppercase tracking-wider transition-all"
                  >
                    Kosongkan & Kembali
                  </button>
                </div>
              </div>
            ) : cartItems.length === 0 ? (
              /* Empty Cart State */
              <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 mb-4 border border-zinc-100">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-zinc-800 text-base mb-1">
                  Keranjang masih kosong
                </h3>
                <p className="font-sans text-xs text-zinc-400 max-w-xs leading-relaxed">
                  Jelajahi karya terbaik kami dan tambahkan produk yang Anda minati ke keranjang sekarang.
                </p>
              </div>
            ) : (
              /* Active Shopping List / Form View */
              <form onSubmit={handleSubmit} className="flex-grow flex flex-col h-full overflow-hidden">
                <div className="flex-grow overflow-y-auto px-6 py-4 space-y-6">
                  
                  {/* Cart Contents Segment */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-sans font-semibold tracking-wider text-zinc-400 uppercase">Item yang Dipilih</div>
                    
                    <div className="divide-y divide-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden bg-zinc-50/50 p-2 space-y-2">
                      {cartItems.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center space-x-4 p-2 bg-white rounded-xl"
                        >
                          {/* Image mini */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-grow min-w-0">
                            <h4 className="font-display font-medium text-xs text-zinc-800 truncate">
                              {item.product.name}
                            </h4>
                            <p className="font-mono text-[11px] text-zinc-500">
                              {formatIDR(item.product.price)}
                            </p>
                          </div>

                          {/* Adjustment widgets */}
                          <div className="flex items-center border border-zinc-100 rounded-lg p-0.5 bg-zinc-50 lg:p-1">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="p-1 rounded text-zinc-500 hover:bg-white hover:text-zinc-800 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-xs font-semibold px-2.5 text-zinc-800 select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="p-1 rounded text-zinc-500 hover:bg-white hover:text-zinc-800 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50/50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Information Form */}
                  <div className="space-y-4 pt-2 border-t border-zinc-100">
                    <div className="text-[10px] font-sans font-semibold tracking-wider text-zinc-400 uppercase">Informasi Penerima</div>

                    <div className="space-y-3">
                      {/* Name input */}
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">
                          Nama Lengkap
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                            <User className="w-4.5 h-4.5" />
                          </span>
                          <input
                            type="text"
                            name="customerName"
                            value={form.customerName}
                            onChange={handleInputChange}
                            placeholder="Tulis nama lengkap Anda"
                            className={`w-full bg-white border ${
                              errors.customerName ? "border-red-400 focus:ring-red-100" : "border-zinc-200 focus:ring-zinc-100"
                            } focus:border-zinc-805 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-4 transition-all`}
                          />
                        </div>
                        {errors.customerName && (
                          <p className="mt-1 flex items-center space-x-1 text-[10px] text-red-500">
                            <AlertCircle className="w-3 h-3" />
                            <span>{errors.customerName}</span>
                          </p>
                        )}
                      </div>

                      {/* Phone input */}
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">
                          Nomor WhatsApp Aktif
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                            <Phone className="w-4.5 h-4.5" />
                          </span>
                          <input
                            type="tel"
                            name="customerPhone"
                            value={form.customerPhone}
                            onChange={handleInputChange}
                            placeholder="Contoh: 081234567890"
                            className={`w-full bg-white border ${
                              errors.customerPhone ? "border-red-400 focus:ring-red-100" : "border-zinc-200 focus:ring-zinc-100"
                            } focus:border-zinc-805 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-4 transition-all`}
                          />
                        </div>
                        {errors.customerPhone && (
                          <p className="mt-1 flex items-center space-x-1 text-[10px] text-red-500">
                            <AlertCircle className="w-3 h-3" />
                            <span>{errors.customerPhone}</span>
                          </p>
                        )}
                      </div>

                      {/* Shipping Address input */}
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">
                          Alamat Lengkap Pengiriman
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3 text-zinc-400">
                            <MapPin className="w-4.5 h-4.5" />
                          </span>
                          <textarea
                            name="address"
                            value={form.address}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Tulis nama jalan, nomor rumah, RT/RW, kecamatan, kota, dan kode pos"
                            className={`w-full bg-white border ${
                              errors.address ? "border-red-400 focus:ring-red-100" : "border-zinc-200 focus:ring-zinc-100"
                            } focus:border-zinc-805 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-4 transition-all resize-none`}
                          />
                        </div>
                        {errors.address && (
                          <p className="mt-1 flex items-center space-x-1 text-[10px] text-red-500">
                            <AlertCircle className="w-3 h-3" />
                            <span>{errors.address}</span>
                          </p>
                        )}
                      </div>

                      {/* Additional Notes input */}
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">
                          Catatan Tambahan (Opsional)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3 text-zinc-400">
                            <FileText className="w-4.5 h-4.5" />
                          </span>
                          <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleInputChange}
                            rows={1}
                            placeholder="Contoh: Titip ke satpam, kirim setelah jam 5 sore"
                            className="w-full bg-white border border-zinc-200 focus:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-4 focus:ring-zinc-100 transition-all resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Segment */}
                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    <div className="text-[10px] font-sans font-semibold tracking-wider text-stone-400 uppercase">Metode Pembayaran</div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* QRIS Select Button */}
                      <button
                        type="button"
                        onClick={() => handleSelectPayment("qris")}
                        className={`flex items-center space-x-3 p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                          form.paymentMethod === "qris"
                            ? "bg-stone-955 border-stone-900 text-white shadow-md shadow-stone-905/10 bg-stone-950"
                            : "bg-white border-stone-200 text-stone-650 hover:bg-stone-50"
                        }`}
                      >
                        <QrCode className="w-5 h-5 flex-shrink-0 text-amber-200" />
                        <div>
                          <div className="text-xs font-semibold leading-tight">QRIS (Otomatis)</div>
                          <div className={`text-[10px] mt-0.5 ${form.paymentMethod === "qris" ? "text-stone-300" : "text-stone-500"}`}>Instan, aman, nontunai</div>
                        </div>
                      </button>

                      {/* COD Select Button */}
                      <button
                        type="button"
                        onClick={() => handleSelectPayment("cod")}
                        className={`flex items-center space-x-3 p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                          form.paymentMethod === "cod"
                            ? "bg-stone-955 border-stone-900 text-white shadow-md shadow-stone-905/10 bg-stone-950"
                            : "bg-white border-stone-200 text-stone-650 hover:bg-stone-50"
                        }`}
                      >
                        <CreditCard className="w-5 h-5 flex-shrink-0 text-amber-200" />
                        <div>
                          <div className="text-xs font-semibold leading-tight">Bayar di Tempat (COD)</div>
                          <div className={`text-[10px] mt-0.5 ${form.paymentMethod === "cod" ? "text-stone-300" : "text-stone-500"}`}>Bayar saat kurir tiba</div>
                        </div>
                      </button>
                    </div>

                    {/* QRIS Instruction & Box Card */}
                    {form.paymentMethod === "qris" && (
                      <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl text-center space-y-4 animate-in fade-in duration-300">
                        <div 
                          onDragOver={isAdmin ? handleDragOver : undefined}
                          onDragLeave={isAdmin ? handleDragLeave : undefined}
                          onDrop={isAdmin ? handleDrop : undefined}
                          className={`max-w-[220px] mx-auto p-4 rounded-2xl shadow-xs flex flex-col items-center justify-center transition-all border ${
                            isDragging && isAdmin
                              ? "bg-amber-50/50 border-amber-400 border-dashed scale-102" 
                              : "bg-white border-stone-200/80"
                          }`}
                        >
                          {/* Main QR Container */}
                          <div className="w-40 h-40 flex items-center justify-center bg-stone-50 rounded-lg border border-stone-100 overflow-hidden relative group">
                            {customQris ? (
                              <img
                                src={customQris}
                                alt="QRIS Barcode Kustom"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <SimulatedQR />
                            )}
                          </div>
                          
                          {/* Authentic Subtitles */}
                          <div className="w-full border-t border-stone-100 mt-2 pt-2 text-center">
                            <span className="text-[10px] font-sans font-extrabold tracking-widest text-[#242424]">QRIS</span>
                            <span className="block text-[8px] font-sans text-stone-400 tracking-wider">STANDAR NASIONAL</span>
                          </div>
                        </div>

                        {/* Upload Controls Slot (Only visible to Admin) */}
                        {isAdmin && (
                          <div className="max-w-md mx-auto space-y-2">
                            <div className="flex flex-col items-center justify-center gap-1.5">
                              <label className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-100 text-[11px] font-sans font-medium text-stone-700 cursor-pointer shadow-xs active:scale-98 transition-all">
                                <QrCode className="w-3.5 h-3.5 text-amber-850" />
                                <span>{customQris ? "Ganti Gambar QRIS" : "Unggah Gambar QRIS Mandiri"}</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={handleQrisUpload} 
                                  className="hidden" 
                                />
                              </label>
                              
                              {customQris && (
                                <button
                                  type="button"
                                  onClick={handleResetQris}
                                  className="text-[10px] font-sans text-stone-400 hover:text-amber-900 transition-colors cursor-pointer underline underline-offset-2"
                                >
                                  Kembali ke QRIS Default
                                </button>
                              )}
                            </div>
                            <p className="text-[9px] font-sans text-stone-400">
                              * Tarik & lepas gambar QRIS Anda ke kotak di atas untuk menyimpannya di browser.
                            </p>
                          </div>
                        )}

                        <div className="max-w-md mx-auto space-y-1.5 px-2">
                          <h5 className="font-display font-medium text-xs text-stone-850">
                            Silakan Scan QR Code di Atas
                          </h5>
                          <p className="font-sans text-[10px] text-stone-500 leading-normal">
                            Gunakan aplikasi e-wallet (GoPay, OVO, Dana) atau M-Banking Anda. Harap lampirkan bukti pembayaran yang berhasil saat pemesanan dikonfirmasi ke admin di WhatsApp.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* COD Instruction Box */}
                    {form.paymentMethod === "cod" && (
                      <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-1.5 animate-in fade-in duration-350">
                        <h5 className="font-sans text-xs font-semibold text-stone-850">
                          Instruksi Cash on Delivery (COD)
                        </h5>
                        <p className="font-sans text-[10px] text-stone-505 leading-normal">
                          Layanan antar langsung dengan sistem pembayaran tunai di tempat. Mohon persiapkan uang pas senilai total biaya belanja Anda untuk diserahkan ke kurir saat barang diantarkan ke alamat tujuan Anda.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Customer Helper Selection (Service Select) */}
                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    <div className="text-[10px] font-sans font-semibold tracking-wider text-stone-400 uppercase">Kirim Konfirmasi Ke Admin</div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Pelayan 1 Option */}
                      <button
                        type="button"
                        onClick={() => handleSelectPelayan("pelayan1")}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          form.selectedPelayan === "pelayan1"
                            ? "bg-stone-950 border-stone-900 text-white shadow-md"
                            : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        <div className="text-xs font-semibold truncate">
                          {settings.pelayan1Name}
                        </div>
                        <div className={`text-[10px] font-mono mt-1 ${form.selectedPelayan === "pelayan1" ? "text-amber-200" : "text-stone-500"}`}>
                          +{settings.pelayan1Phone}
                        </div>
                      </button>

                      {/* Pelayan 2 Option */}
                      <button
                        type="button"
                        onClick={() => handleSelectPelayan("pelayan2")}
                        className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          form.selectedPelayan === "pelayan2"
                            ? "bg-stone-950 border-stone-900 text-white shadow-md"
                            : "bg-white border-stone-200 text-stone-700 hover:bg-stone-50"
                        }`}
                      >
                        <div className="text-xs font-semibold truncate">
                          {settings.pelayan2Name}
                        </div>
                        <div className={`text-[10px] font-mono mt-1 ${form.selectedPelayan === "pelayan2" ? "text-amber-200" : "text-stone-500"}`}>
                          +{settings.pelayan2Phone}
                        </div>
                      </button>
                    </div>
                  </div>

                </div>

                {/* Footer Drawer Sticky Summary bar */}
                <div className="p-6 border-t border-stone-100 bg-white space-y-4">
                  <div className="flex items-center justify-between text-stone-800">
                    <span className="font-sans text-sm font-medium">Subtotal Belanja</span>
                    <span className="font-mono text-base font-bold text-stone-950">
                      {formatIDR(subtotal)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-850 active:bg-stone-950 text-white font-sans font-semibold text-xs tracking-widest uppercase transition-all shadow-md active:scale-[0.99] cursor-pointer border border-stone-900"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-200" />
                    <span>Selesaikan via WhatsApp ({form.selectedPelayan === "pelayan1" ? "Admin 1" : "Admin 2"})</span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
