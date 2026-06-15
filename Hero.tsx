/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Compass } from "lucide-react";
import { StoreSettings } from "../types";

interface HeroProps {
  settings: StoreSettings;
}

export default function Hero({ settings }: HeroProps) {
  return (
    <section className="relative px-6 sm:px-12 py-16 sm:py-20 max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
      {/* Decorative Brand Accent */}
      <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200/50 rounded-full py-1.5 px-4 mb-6">
        <Compass className="w-3.5 h-3.5 text-amber-700" />
        <span className="font-sans text-[10px] font-semibold tracking-widest text-amber-900 uppercase">
          Warisan Rasa & Tradisi Nusantara
        </span>
      </div>

      {/* Main Title Banner */}
      <h2 className="font-display font-extrabold text-3xl sm:text-5xl tracking-tight text-stone-900 leading-tight max-w-2xl mb-6">
        Sensasi Kuliner Klasik Bercita Rasa Tinggi
      </h2>

      {/* Structured Description Paragraph */}
      <p className="font-sans text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl">
        {settings.storeDescription} Rasakan kelezatan legendaris premium buatan lokal langsung dikirimkan hangat ke depan pintu Anda.
      </p>

      {/* Dual Divider Line */}
      <div className="w-24 h-px bg-amber-200/60 mt-10"></div>
    </section>
  );
}
