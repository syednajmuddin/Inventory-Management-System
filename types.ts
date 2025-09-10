
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  price: number; // Price at the time of sale
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  timestamp: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum View {
  POS = 'POS',
  Inventory = 'Inventory',
  Reports = 'Reports',
  AIInsights = 'AI Insights',
}
