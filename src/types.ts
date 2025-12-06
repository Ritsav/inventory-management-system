export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  minStockLevel: number;
  lastUpdated: string;
  imageData?: string; // Base64 string
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
}

export interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  priceAtSale: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  items: OrderItem[];
  totalAmount: number;
}

export interface PurchaseItem {
  itemId: string;
  itemName: string;
  quantity: number;
  costPrice: number;
}

export interface Purchase {
  id: string;
  supplier: string;
  date: string;
  status: 'Ordered' | 'Received';
  items: PurchaseItem[];
  totalCost: number;
}

export type ViewState = 'dashboard' | 'inventory' | 'analytics' | 'planning'; // Deprecated in favor of Routes but kept for compatibility if needed temporarily

export const CATEGORIES = [
  'Electronics',
  'Office Supplies',
  'Furniture',
  'Raw Materials',
  'Packaging',
  'Other'
];