/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShoppingCart, Utensils } from "lucide-react";
import { StoreSettings } from "../types";

interface NavbarProps {
  settings: StoreSettings;
  cartCount: number;
  onOpenCart: () => void;
}

export default function Navbar({
  settings,
  cartCount,
  onOpenCart,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-stone-50/80 backdrop-blur-md border-b border-stone-200/60 flex items-center justify-between px-4 sm:px-8 py-4 transition-all">
      {/* Brand Logo */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-amber-50">
          <Utensils className="w-5 h-5 text-amber-100" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-lg tracking-tight select-none text-stone-900">
            {settings.storeName}
          </h1>
          <p className="font-sans text-[10px] text-amber-800/80 font-medium tracking-widest uppercase">
            Kuliner Tradisional Modern
          </p>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center space-x-2">
        {/* Cart Trigger */}
        <button
          onClick={onOpenCart}
          className="relative group p-2.5 rounded-full hover:bg-stone-200/40 transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Keranjang Belanja"
        >
          <ShoppingCart className="w-5.5 h-5.5 text-stone-850 group-hover:scale-105 transition-transform" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-stone-950 text-white font-mono text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-100 shadow-sm">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
