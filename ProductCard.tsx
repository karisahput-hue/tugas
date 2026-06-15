/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Plus, ShoppingBag, Camera, RotateCcw } from "lucide-react";
import { Product } from "../types";
import { formatIDR } from "../utils";

interface ProductCardProps {
  key?: string;
  product: Product;
  onAddToCart: (product: Product) => void;
  cartQuantity: number;
  onUpdateImage?: (productId: string, base64: string) => void;
  onResetImage?: (productId: string) => void;
  isAdmin?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  cartQuantity,
  onUpdateImage,
  onResetImage,
  isAdmin = false,
}: ProductCardProps) {
  const hasCustomImage = React.useMemo(() => {
    try {
      return !!localStorage.getItem(`store_custom_image_${product.id}`);
    } catch {
      return false;
    }
  }, [product.id, product.imageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          onUpdateImage(product.id, base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <article className="bg-white border border-stone-200/60 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-stone-200/40 hover:border-stone-300 transition-all duration-300 flex flex-col h-full group">
      {/* Product Image Frame */}
      <div className="relative aspect-square w-full bg-stone-50 overflow-hidden select-none">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Custom Upload Buttons overlay */}
        {isAdmin && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 z-10">
            <label className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-full border border-stone-200 bg-white/95 hover:bg-white text-[10px] sm:text-xs font-sans font-semibold text-stone-700 cursor-pointer shadow-xs active:scale-95 transition-all">
              <Camera className="w-3.5 h-3.5 text-amber-800" />
              <span>Ubah Foto</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
            
            {hasCustomImage && (
              <button
                onClick={() => onResetImage?.(product.id)}
                className="p-1.5 rounded-full border border-stone-200 bg-white/95 hover:bg-white text-stone-500 hover:text-amber-905 shadow-xs transition-colors cursor-pointer active:scale-95"
                title="Reset ke Foto Default"
                type="button"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
              </button>
            )}
          </div>
        )}

        {!product.isAvailable && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-white text-stone-900 font-sans text-[11px] font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-sm">
              Habis Terjual
            </span>
          </div>
        )}
        {cartQuantity > 0 && (
          <div className="absolute top-4 right-4 bg-stone-950 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center space-x-1.5 animate-in fade-in zoom-in-95 duration-200">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-200" />
            <span className="text-stone-100">{cartQuantity} di Keranjang</span>
          </div>
        )}
      </div>

      {/* Product Body Details */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-display font-medium text-lg text-stone-900 mb-1 tracking-tight">
          {product.name}
        </h3>
        
        <p className="font-mono text-xs font-semibold text-amber-800">
          {formatIDR(product.price)}
        </p>

        <p className="font-sans text-xs text-stone-500 leading-relaxed mt-3 mb-6 flex-grow">
          {product.description}
        </p>

        {/* Action Button */}
        <button
          onClick={() => onAddToCart(product)}
          disabled={!product.isAvailable}
          className="mt-auto w-full inline-flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 disabled:bg-stone-150 text-white disabled:text-stone-400 font-sans font-semibold text-xs tracking-widest uppercase transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah ke Keranjang</span>
        </button>
      </div>
    </article>
  );
}
