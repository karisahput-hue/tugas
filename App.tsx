/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Lock, Unlock, Settings, LogOut, X, Check, AlertCircle, Save } from "lucide-react";
import { StoreSettings, CartItem, Product } from "./types";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import CartDrawer from "./components/CartDrawer";

// Curated default settings matching the requested premium traditional modern aesthetic (Toko Pinggiran) with NO emojis
const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Toko Pinggiran",
  storeDescription: "Sebuah butik kuliner kudapan tradisional nusantara asli yang diolah secara higienis, bersih dan modern. Menyajikan kelezatan adati Getuk Lindri manis gurih bertabur kelapa dan Tahu Petis Semarang renyah legendaris.",
  pelayan1Name: "Karisah (Admin 1)",
  pelayan1Phone: "6288229263616",
  pelayan2Name: "Bunga (Admin 2)",
  pelayan2Phone: "6283149720975",
  qrisImageUrl: "/assets/qris.png", // Configured path where they can upload/view their QRIS.
  products: [
    {
      id: "prod-1",
      name: "Getuk Lindri Pandan Klasik",
      price: 25000,
      description: "Kudapan manis lembut autentik dari singkong pegunungan murni kukus yang ditumbuk halus, diramu harum ekstrak pandan segar, dan disuguhkan dengan kelapa parut kukus gurih.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Getuk_lindri_2.JPG",
      isAvailable: true,
    },
    {
      id: "prod-2",
      name: "Tahu Petis Semarang Premium",
      price: 32000,
      description: "Tahu pong goreng renyah berrongga gurih dengan paduan saus petis udang kental warna hitam pekat manis-gurih khas yang melimpah, disajikan bersama cabai rawit segar asli.",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Tahu_petis.jpg",
      isAvailable: true,
    },
  ],
};

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);
  
  // Admin Mode state
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("store_admin_mode") === "true";
    } catch {
      return false;
    }
  });

  // PIN security state
  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      return localStorage.getItem("store_admin_pin") || "1234";
    } catch {
      return "1234";
    }
  });

  // Admin Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginPin, setLoginPin] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configForm, setConfigForm] = useState<StoreSettings | null>(null);
  const [configPin, setConfigPin] = useState("");
  const [configError, setConfigError] = useState("");

  // Synchronize Cart & Custom Settings in LocalStorage on Mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("store_cart_items");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (err) {
      console.error("Local storage initialization error:", err);
    }

    try {
      const savedSettings = localStorage.getItem("store_config_settings");
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      } else {
        // Migration support for pre-existing uploaded product images in localStorage
        const migratedProducts = DEFAULT_SETTINGS.products.map(prod => {
          const savedCustomImg = localStorage.getItem(`store_custom_image_${prod.id}`);
          if (savedCustomImg) {
            return { ...prod, imageUrl: savedCustomImg };
          }
          return prod;
        });
        const initialSettings = { ...DEFAULT_SETTINGS, products: migratedProducts };
        setSettings(initialSettings);
        localStorage.setItem("store_config_settings", JSON.stringify(initialSettings));
      }
    } catch (err) {
      console.error("Failed to load store settings:", err);
    }
  }, []);

  const handleSetAdminMode = (active: boolean) => {
    setIsAdminMode(active);
    try {
      localStorage.setItem("store_admin_mode", active ? "true" : "false");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProductImage = (productId: string, base64: string) => {
    try {
      localStorage.setItem(`store_custom_image_${productId}`, base64);
      setSettings((prev) => {
        const updatedProducts = prev.products.map((prod) =>
          prod.id === productId ? { ...prod, imageUrl: base64 } : prod
        );
        const nextSettings = { ...prev, products: updatedProducts };
        localStorage.setItem("store_config_settings", JSON.stringify(nextSettings));
        return nextSettings;
      });
    } catch (err) {
      console.error("Failed to save product image to local storage:", err);
    }
  };

  const handleResetProductImage = (productId: string) => {
    try {
      localStorage.removeItem(`store_custom_image_${productId}`);
      const originalProd = DEFAULT_SETTINGS.products.find(
        (p) => p.id === productId
      );
      if (originalProd) {
        setSettings((prev) => {
          const updatedProducts = prev.products.map((prod) =>
            prod.id === productId
              ? { ...prod, imageUrl: originalProd.imageUrl }
              : prod
          );
          const nextSettings = { ...prev, products: updatedProducts };
          localStorage.setItem("store_config_settings", JSON.stringify(nextSettings));
          return nextSettings;
        });
      }
    } catch (err) {
      console.error("Failed to reset product image:", err);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id);
      let updated: CartItem[];

      if (existingItem) {
        updated = prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updated = [...prev, { product, quantity: 1 }];
      }

      localStorage.setItem("store_cart_items", JSON.stringify(updated));
      return updated;
    });

    // Provide visual trigger by sliding open the cart automatically
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) => {
      const updated = prev
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      localStorage.setItem("store_cart_items", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      localStorage.setItem("store_cart_items", JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
    localStorage.removeItem("store_cart_items");
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Dynamic cart products matching current customized state images
  const dynamicCartItems = React.useMemo(() => {
    return cartItems.map(item => {
      const currentProduct = settings.products.find(p => p.id === item.product.id);
      if (currentProduct) {
        return {
          ...item,
          product: currentProduct
        };
      }
      return item;
    });
  }, [cartItems, settings.products]);

  // Admin login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPin === adminPin) {
      handleSetAdminMode(true);
      setIsLoginOpen(false);
      setLoginPin("");
      setLoginError("");
    } else {
      setLoginError("PIN Keamanan salah. Harap coba lagi.");
    }
  };

  // Open config forms
  const handleOpenConfig = () => {
    setConfigForm(JSON.parse(JSON.stringify(settings)));
    setConfigPin(adminPin);
    setConfigError("");
    setIsConfigOpen(true);
  };

  // Save config changes
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configForm) return;

    if (!configForm.storeName.trim()) {
      setConfigError("Nama Toko tidak boleh kosong.");
      return;
    }
    if (!configPin.trim() || configPin.length < 4) {
      setConfigError("PIN baru harus minimal 4 karakter.");
      return;
    }

    try {
      // Save settings
      setSettings(configForm);
      localStorage.setItem("store_config_settings", JSON.stringify(configForm));
      
      // Save PIN
      setAdminPin(configPin);
      localStorage.setItem("store_admin_pin", configPin);

      setIsConfigOpen(false);
      setConfigError("");
    } catch (err) {
      console.error("Failed to save config:", err);
      setConfigError("Gagal menyimpan konfigurasi.");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6f0] text-stone-900 flex flex-col antialiased selection:bg-stone-800 selection:text-white pb-16">
      {/* Navbar segment */}
      <Navbar
        settings={settings}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-grow pb-24">
        {/* Aesthetic Branding Statement Hero */}
        <Hero settings={settings} />

        {/* Display Curated Products (2 items grid) */}
        <section className="max-w-5xl mx-auto px-4 sm:px-8 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-4xl mx-auto">
            {settings.products.map((product) => {
              const currentCartItem = cartItems.find(
                (item) => item.product.id === product.id
              );
              const quantityInCart = currentCartItem ? currentCartItem.quantity : 0;

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  cartQuantity={quantityInCart}
                  onUpdateImage={handleUpdateProductImage}
                  onResetImage={handleResetProductImage}
                  isAdmin={isAdminMode}
                />
              );
            })}
          </div>
        </section>

        {/* Core Values Section */}
        <section className="max-w-4xl mx-auto mt-24 px-6 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 border-t border-stone-200/60 pt-12">
            
            {/* Value 1 */}
            <div className="space-y-2">
              <h4 className="font-display font-semibold text-xs tracking-wider text-amber-900 uppercase">
                Metode Bayar Fleksibel
              </h4>
              <p className="font-sans text-xs text-stone-500 leading-relaxed">
                Kemudahan bertransaksi lewat scan QRIS aman yang instan, maupun opsi Cash on Delivery (COD) bayar tunai langsung saat diantarkan kurir.
              </p>
            </div>

            {/* Value 2 */}
            <div className="space-y-2">
              <h4 className="font-display font-semibold text-xs tracking-wider text-amber-900 uppercase">
                Konfirmasi Instan WhatsApp
              </h4>
              <p className="font-sans text-xs text-stone-500 leading-relaxed">
                Rincian barang, ongkos belanja, serta rincian alamat pengantaran terangkum otomatis dalam chat WhatsApp yang ditujukan ke nomor pelayanan resmi pilihan Anda.
              </p>
            </div>

            {/* Value 3 */}
            <div className="space-y-2">
              <h4 className="font-display font-semibold text-xs tracking-wider text-amber-900 uppercase">
                Artisanal & Berkelas
              </h4>
              <p className="font-sans text-xs text-stone-500 leading-relaxed">
                Menghapuskan kesan berlebih demi menjamin keaslian piring saji tradisional. Kemasan ramah lingkungan, higienis, dan murni tanpa bahan pengawet.
              </p>
            </div>

          </div>
        </section>
      </main>

      {/* Compact editorial footer */}
      <footer className="bg-stone-50 border-t border-stone-200 py-12 px-6 sm:px-8 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-0">
          <div className="text-center sm:text-left space-y-1">
            <h5 className="font-display font-bold text-sm tracking-tight text-stone-800">
              {settings.storeName}
            </h5>
            <p className="font-sans text-[11px] text-stone-400">
              © 2026. Semua hak cipta dilindungi undang-undang.
            </p>
          </div>
          
          <div className="flex items-center space-x-6 text-stone-400 font-sans text-xs select-none">
            <span className="hover:text-stone-700 transition-colors">Admin 1: +{settings.pelayan1Phone}</span>
            <span className="text-stone-200">|</span>
            <span className="hover:text-stone-700 transition-colors">Admin 2: +{settings.pelayan2Phone}</span>
            <span className="text-stone-200">|</span>
            {isAdminMode ? (
              <button
                onClick={() => handleSetAdminMode(false)}
                className="inline-flex items-center space-x-1 text-amber-800 hover:text-amber-900 cursor-pointer font-semibold transition-colors"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Lock Admin</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsLoginOpen(true);
                  setLoginPin("");
                  setLoginError("");
                }}
                className="inline-flex items-center space-x-1 text-stone-400 hover:text-stone-750 cursor-pointer transition-colors"
                title="Pintu Masuk Pengelola Toko"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Pintu Admin</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Admin Floating Bar when Login session is active */}
      {isAdminMode && (
        <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-xl bg-stone-900 border border-stone-800 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center justify-between gap-4 z-40 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
            <span className="font-sans text-[11px] font-bold tracking-wider uppercase text-stone-200">Mode Admin Aktif</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenConfig}
              className="px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-705 text-white font-sans font-bold text-xs transition-all cursor-pointer shadow-xs active:scale-95 inline-flex items-center space-x-1"
            >
              <Settings className="w-3.5 h-3.5 text-amber-200" />
              <span>Kelola Info Toko</span>
            </button>
            <button
              onClick={() => handleSetAdminMode(false)}
              className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-white transition-all cursor-pointer active:scale-95"
              title="Keluar Mode Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Admin Login PIN Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-stone-200/80 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-amber-900 border border-stone-200/40">
                <Lock className="w-5 h-5 text-amber-800" />
              </div>
              <h3 className="font-display font-extrabold text-stone-900 text-lg">Pintu Akses Pengelola</h3>
              <p className="font-sans text-xs text-stone-500">Masukkan PIN pengaman Anda untuk mengelola menu, info, & pembayaran QRIS.</p>
            </div>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}
              
              <div className="space-y-1.5">
                <input
                  type="password"
                  placeholder="PIN Pengelola"
                  maxLength={12}
                  className="w-full text-center tracking-widest text-xl font-mono py-3.5 border border-stone-200 rounded-2xl focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 bg-stone-50"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  required
                />
                <p className="text-[10px] text-stone-400 text-center font-sans">
                  * PIN standard default: <span className="font-mono font-bold"></span>
                </p>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLoginOpen(false);
                    setLoginPin("");
                    setLoginError("");
                  }}
                  className="w-1/2 py-3 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-600 font-sans font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-sans font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer shadow-sm"
                >
                  Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Full Config Modal */}
      {isConfigOpen && configForm && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col border border-stone-200 shadow-xl relative overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-amber-900" />
                <h3 className="font-display font-extrabold text-[#1a1a1a] text-lg">Kelola Pengaturan Toko</h3>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Indicator */}
            {configError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{configError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveConfig} className="flex-grow flex flex-col overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto max-h-full">
                
                {/* Segment 1: Store profile */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-stone-400 font-sans">1. Profil & Informasi Toko</h4>
                  
                  <div className="space-y-1">
                    <label className="block text-[11px] font-sans font-semibold text-stone-600">Nama Toko</label>
                    <input
                      type="text"
                      className="w-full text-xs font-medium p-3 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-850"
                      value={configForm.storeName}
                      onChange={(e) => setConfigForm({ ...configForm, storeName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[11px] font-sans font-semibold text-stone-600">Deskripsi Toko</label>
                    <textarea
                      rows={3}
                      className="w-full text-xs font-medium p-3 border border-stone-200 rounded-xl focus:outline-none focus:border-stone-850 resize-none leading-relaxed"
                      value={configForm.storeDescription}
                      onChange={(e) => setConfigForm({ ...configForm, storeDescription: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Segment 2: WhatsApp official contacts */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-stone-400 font-sans">2. Kontak Pelayanan Penerima Pesanan</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="text-[10px] font-sans font-extrabold text-amber-900 uppercase">Kontak Admin 1</div>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-stone-500">Nama Tampilan</label>
                        <input
                          type="text"
                          className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-850"
                          value={configForm.pelayan1Name}
                          onChange={(e) => setConfigForm({ ...configForm, pelayan1Name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-stone-500">No. WhatsApp (Kode Negara 62)</label>
                        <input
                          type="text"
                          className="w-full font-mono text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-850"
                          value={configForm.pelayan1Phone}
                          onChange={(e) => setConfigForm({ ...configForm, pelayan1Phone: e.target.value.replace(/\D/g, "") })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-[10px] font-sans font-extrabold text-amber-900 uppercase">Kontak Admin 2</div>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-stone-500">Nama Tampilan</label>
                        <input
                          type="text"
                          className="w-full text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-850"
                          value={configForm.pelayan2Name}
                          onChange={(e) => setConfigForm({ ...configForm, pelayan2Name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] text-stone-500">No. WhatsApp (Kode Negara 62)</label>
                        <input
                          type="text"
                          className="w-full font-mono text-xs p-2.5 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-850"
                          value={configForm.pelayan2Phone}
                          onChange={(e) => setConfigForm({ ...configForm, pelayan2Phone: e.target.value.replace(/\D/g, "") })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Segment 3: Products pricing & availability */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-stone-400 font-sans">3. Menu & Ketersediaan Produk</h4>
                  
                  {configForm.products.map((prod, idx) => (
                    <div key={prod.id} className="p-3 bg-stone-50 border border-stone-200/60 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-xs text-stone-800">{prod.name}</span>
                        <label className="inline-flex items-center space-x-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 accent-stone-900 rounded"
                            checked={prod.isAvailable}
                            onChange={(e) => {
                              const updated = configForm.products.map(p => p.id === prod.id ? { ...p, isAvailable: e.target.checked } : p);
                              setConfigForm({ ...configForm, products: updated });
                            }}
                          />
                          <span className="font-sans text-[11px] font-semibold text-stone-605">Tersedia untuk Dipesan</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1 space-y-1">
                          <label className="block text-[10px] text-stone-500">Harga (IDR)</label>
                          <input
                            type="number"
                            className="w-full font-mono text-xs p-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-850"
                            value={prod.price}
                            onChange={(e) => {
                              const updated = configForm.products.map(p => p.id === prod.id ? { ...p, price: parseInt(e.target.value) || 0 } : p);
                              setConfigForm({ ...configForm, products: updated });
                            }}
                            required
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="block text-[10px] text-stone-500">Deskripsi Ringkas</label>
                          <input
                            type="text"
                            className="w-full text-xs p-2 border border-stone-200 rounded-lg focus:outline-none focus:border-stone-850"
                            value={prod.description}
                            onChange={(e) => {
                              const updated = configForm.products.map(p => p.id === prod.id ? { ...p, description: e.target.value } : p);
                              setConfigForm({ ...configForm, products: updated });
                            }}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Segment 4: Change security PIN */}
                <div className="space-y-4 pt-4 border-t border-stone-100">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-stone-400 font-sans">4. Keamanan PIN Admin</h4>
                  
                  <div className="space-y-1">
                    <label className="block text-[11px] font-sans font-semibold text-stone-600">Ganti PIN Masuk Admin</label>
                    <input
                      type="text"
                      maxLength={12}
                      className="w-1/2 p-2.5 border font-mono tracking-widest text-sm border-stone-200 rounded-xl focus:outline-none focus:border-stone-850"
                      value={configPin}
                      onChange={(e) => setConfigPin(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                    <p className="text-[10px] text-stone-400">Pastikan PIN mudah diingat dan hanya terdiri dari angka (min. 4 digit).</p>
                  </div>
                </div>

              </div>

              {/* Sticky bottom save bar */}
              <div className="p-4 border-t border-stone-100 bg-stone-50 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="w-1/2 py-3 rounded-2xl border border-stone-200 hover:bg-stone-100 text-stone-600 font-sans font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-2xl bg-stone-900 hover:bg-stone-850 text-white font-sans font-bold text-xs tracking-wider uppercase transition-colors cursor-pointer shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Save className="w-4 h-4 text-amber-200" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shopping Drawer Overlays */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={dynamicCartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        settings={settings}
        isAdmin={isAdminMode}
      />
    </div>
  );
}
