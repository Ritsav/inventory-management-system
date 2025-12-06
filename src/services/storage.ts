import type { InventoryItem, Customer, Order, Purchase } from '../types';

const INVENTORY_KEY = 'inventory_data_v1';
const CUSTOMERS_KEY = 'customers_data_v1';
const ORDERS_KEY = 'orders_data_v1';
const PURCHASES_KEY = 'purchases_data_v1';

// --- SEED DATA ---
const SEED_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Ergonomic Office Chair',
    category: 'Furniture',
    quantity: 12,
    price: 199.99,
    supplier: 'OfficeDepot Inc.',
    minStockLevel: 5,
    lastUpdated: new Date().toISOString(),
    imageData: 'https://img.drz.lazcdn.com/g/kf/S2da544279a93454bbfd435f11782437b5.jpg_720x720q80.jpg'
  },
  {
    id: '2',
    name: 'Wireless Mouse',
    category: 'Electronics',
    quantity: 45,
    price: 29.50,
    supplier: 'TechGlobal',
    minStockLevel: 10,
    lastUpdated: new Date().toISOString(),
    imageData: 'https://cdn.mos.cms.futurecdn.net/QTYTBkvNonjH7PEx3iDEhf.jpg'
  },
  {
    id: '3',
    name: '27-inch Monitor',
    category: 'Electronics',
    quantity: 8,
    price: 350.00,
    supplier: 'ScreenMasters',
    minStockLevel: 10,
    lastUpdated: new Date().toISOString(),
    imageData: 'https://i.pcmag.com/imagery/roundups/05ersXu1oMXozYJa66i9GEo-52.fit_lim.size_1200x630.v1738093157.jpg'
  },
  {
    id: '4',
    name: 'A4 Paper Ream',
    category: 'Office Supplies',
    quantity: 120,
    price: 5.99,
    supplier: 'PaperCo',
    minStockLevel: 50,
    lastUpdated: new Date().toISOString(),
    imageData: 'https://www.instantsupply.com.au/assets/full/OCPA4500X5W-DA.jpg?20240628201549'
  },
  {
    id: '5',
    name: 'Standing Desk',
    category: 'Furniture',
    quantity: 3,
    price: 450.00,
    supplier: 'ErgoLife',
    minStockLevel: 4,
    lastUpdated: new Date().toISOString(),
    imageData: 'https://i.shgcdn.com/67904f8d-db9a-4608-be03-e4f3bea40607/-/format/auto/-/preview/3000x3000/-/quality/lighter/'
  }
];

const SEED_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Acme Corp', email: 'contact@acme.com', phone: '555-0101', address: '123 Ind. Park', joinedDate: '2023-01-15T00:00:00.000Z' },
  { id: 'c2', name: 'John Doe', email: 'john@example.com', phone: '555-0102', address: '456 Main St', joinedDate: '2023-03-20T00:00:00.000Z' },
  { id: 'c3', name: 'Jane Smith', email: 'jane@example.com', phone: '555-0103', address: '789 Oak Ave', joinedDate: '2023-06-10T00:00:00.000Z' }
];

const SEED_ORDERS: Order[] = [
  { 
    id: 'ORD-1001', customerId: 'c1', customerName: 'Acme Corp', date: '2023-10-01T10:00:00.000Z', status: 'Completed', 
    totalAmount: 459.98,
    items: [
      { itemId: '1', itemName: 'Ergonomic Office Chair', quantity: 2, priceAtSale: 199.99 },
      { itemId: '2', itemName: 'Wireless Mouse', quantity: 2, priceAtSale: 29.50 }
    ]
  }
];

const SEED_PURCHASES: Purchase[] = [
  {
    id: 'PUR-5001', supplier: 'TechGlobal', date: '2023-09-15T09:00:00.000Z', status: 'Received', totalCost: 500.00,
    items: [
       { itemId: '2', itemName: 'Wireless Mouse', quantity: 20, costPrice: 15.00 },
       { itemId: '3', itemName: '27-inch Monitor', quantity: 2, costPrice: 200.00 } // Example costs
    ]
  }
];

// --- HELPERS ---
const getLocalStorage = <T>(key: string, seed: T[]): T[] => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error(`Failed to parse ${key}`, e);
    return [];
  }
};

const setLocalStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- INVENTORY ---
export const getInventory = (): InventoryItem[] => getLocalStorage<InventoryItem>(INVENTORY_KEY, SEED_INVENTORY);
export const saveInventory = (items: InventoryItem[]): void => setLocalStorage(INVENTORY_KEY, items);

export const addItem = (item: Omit<InventoryItem, 'id' | 'lastUpdated'>): InventoryItem => {
  const items = getInventory();
  const newItem: InventoryItem = {
    ...item,
    id: crypto.randomUUID(),
    lastUpdated: new Date().toISOString()
  };
  saveInventory([...items, newItem]);
  return newItem;
};

export const updateItem = (item: InventoryItem): void => {
  const items = getInventory();
  const index = items.findIndex(i => i.id === item.id);
  if (index !== -1) {
    items[index] = { ...item, lastUpdated: new Date().toISOString() };
    saveInventory(items);
  }
};

export const deleteItem = (id: string): void => {
  const items = getInventory();
  saveInventory(items.filter(i => i.id !== id));
};

// Simplified sell logic (updates quantity directly)
export const sellItem = (id: string, quantityToSell: number): void => {
  const items = getInventory();
  const index = items.findIndex(i => i.id === id);
  if (index !== -1) {
    const currentQty = items[index].quantity;
    items[index] = { 
      ...items[index], 
      quantity: Math.max(0, currentQty - quantityToSell), 
      lastUpdated: new Date().toISOString() 
    };
    saveInventory(items);
  }
};

// --- CUSTOMERS ---
export const getCustomers = (): Customer[] => getLocalStorage<Customer>(CUSTOMERS_KEY, SEED_CUSTOMERS);
export const saveCustomers = (customers: Customer[]): void => setLocalStorage(CUSTOMERS_KEY, customers);
export const addCustomer = (customer: Omit<Customer, 'id' | 'joinedDate'>): void => {
  const customers = getCustomers();
  const newC: Customer = { ...customer, id: crypto.randomUUID(), joinedDate: new Date().toISOString() };
  saveCustomers([...customers, newC]);
};
export const updateCustomer = (customer: Customer): void => {
  const customers = getCustomers();
  const idx = customers.findIndex(c => c.id === customer.id);
  if(idx !== -1) { customers[idx] = customer; saveCustomers(customers); }
};
export const deleteCustomer = (id: string): void => {
  saveCustomers(getCustomers().filter(c => c.id !== id));
};

// --- ORDERS ---
export const getOrders = (): Order[] => getLocalStorage<Order>(ORDERS_KEY, SEED_ORDERS);
export const saveOrders = (orders: Order[]): void => setLocalStorage(ORDERS_KEY, orders);

export const createOrder = (order: Omit<Order, 'id' | 'date' | 'status'>): void => {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`, // Simple ID gen
    date: new Date().toISOString(),
    status: 'Completed' // Default to completed for simplicity in this MVP
  };
  
  // Deduct Inventory
  const inventory = getInventory();
  newOrder.items.forEach(orderItem => {
    const invItemIndex = inventory.findIndex(i => i.id === orderItem.itemId);
    if (invItemIndex !== -1) {
      inventory[invItemIndex].quantity = Math.max(0, inventory[invItemIndex].quantity - orderItem.quantity);
      inventory[invItemIndex].lastUpdated = new Date().toISOString();
    }
  });
  
  saveInventory(inventory);
  saveOrders([newOrder, ...orders]);
};

// --- PURCHASES ---
export const getPurchases = (): Purchase[] => getLocalStorage<Purchase>(PURCHASES_KEY, SEED_PURCHASES);
export const savePurchases = (purchases: Purchase[]): void => setLocalStorage(PURCHASES_KEY, purchases);

export const createPurchase = (purchase: Omit<Purchase, 'id' | 'date' | 'status'>): void => {
  const purchases = getPurchases();
  const newPurchase: Purchase = {
    ...purchase,
    id: `PUR-${Math.floor(5000 + Math.random() * 5000)}`,
    date: new Date().toISOString(),
    status: 'Received' // Assume received immediately for MVP
  };

  // Add Inventory
  const inventory = getInventory();
  newPurchase.items.forEach(purchItem => {
    const invItemIndex = inventory.findIndex(i => i.id === purchItem.itemId);
    if (invItemIndex !== -1) {
      // Update existing item stock
      inventory[invItemIndex].quantity += purchItem.quantity;
      inventory[invItemIndex].lastUpdated = new Date().toISOString();
    } else {
      // NOTE: In a real app, buying a new item would require creating it first. 
      // For now, we assume purchases are only for existing catalog items.
    }
  });

  saveInventory(inventory);
  savePurchases([newPurchase, ...purchases]);
};