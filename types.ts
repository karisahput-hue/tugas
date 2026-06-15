/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface StoreSettings {
  storeName: string;
  storeDescription: string;
  pelayan1Name: string;
  pelayan1Phone: string;
  pelayan2Name: string;
  pelayan2Phone: string;
  qrisImageUrl: string;
  products: Product[];
}

export type PaymentMethod = "qris" | "cod";

export interface OrderForm {
  customerName: string;
  customerPhone: string;
  address: string;
  notes: string;
  paymentMethod: PaymentMethod;
  selectedPelayan: "pelayan1" | "pelayan2";
}
