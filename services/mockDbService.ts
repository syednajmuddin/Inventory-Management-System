import type { Product, Sale, SaleItem } from '../types';

let products: Product[] = [
  // Appetizers
  { id: 'p1', name: 'Hummus Platter', category: 'Appetizer', price: 8.50, stock: 50, imageUrl: 'https://picsum.photos/seed/hummus/400' },
  { id: 'p2', name: 'Falafel Bites', category: 'Appetizer', price: 7.00, stock: 60, imageUrl: 'https://picsum.photos/seed/falafel/400' },
  { id: 'p3', name: 'Stuffed Grape Leaves', category: 'Appetizer', price: 6.50, stock: 45, imageUrl: 'https://picsum.photos/seed/grapeleaves/400' },

  // Main Courses
  { id: 'p4', name: 'Lamb Kebabs', category: 'Main Course', price: 18.00, stock: 30, imageUrl: 'https://picsum.photos/seed/kebabs/400' },
  { id: 'p5', name: 'Chicken Biryani', category: 'Main Course', price: 16.50, stock: 40, imageUrl: 'https://picsum.photos/seed/biryani/400' },
  { id: 'p6', name: 'Grilled Salmon', category: 'Main Course', price: 22.00, stock: 25, imageUrl: 'https://picsum.photos/seed/salmon/400' },
  { id: 'p7', name: 'Vegetable Tagine', category: 'Main Course', price: 14.00, stock: 35, imageUrl: 'https://picsum.photos/seed/tagine/400' },

  // Desserts
  { id: 'p8', name: 'Baklava', category: 'Dessert', price: 5.00, stock: 70, imageUrl: 'https://picsum.photos/seed/baklava/400' },
  { id: 'p9', name: 'Kunafa', category: 'Dessert', price: 6.50, stock: 40, imageUrl: 'https://picsum.photos/seed/kunafa/400' },

  // Drinks
  { id: 'p10', name: 'Mint Lemonade', category: 'Drinks', price: 4.50, stock: 100, imageUrl: 'https://picsum.photos/seed/lemonade/400' },
  { id: 'p11', name: 'Turkish Coffee', category: 'Drinks', price: 3.50, stock: 80, imageUrl: 'https://picsum.photos/seed/turkishcoffee/400' },
  { id: 'p12', name: 'Sparkling Water', category: 'Drinks', price: 3.00, stock: 120, imageUrl: 'https://picsum.photos/seed/water/400' },
];


let sales: Sale[] = [];

// Simulate some historical sales data for reports and AI
const generateMockSales = () => {
  const mockSales: Sale[] = [];
  for (let i = 0; i < 50; i++) {
    const saleItems: SaleItem[] = [];
    const numItems = Math.floor(Math.random() * 3) + 1;
    let total = 0;
    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 2) + 1;
      saleItems.push({ productId: product.id, quantity, price: product.price });
      total += product.price * quantity;
    }
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    mockSales.push({ id: `s${i + 1}`, items: saleItems, total, timestamp });
  }
  sales = mockSales;
};

generateMockSales();

const dbService = {
  getProducts: async (): Promise<Product[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...products]), 200));
  },
  
  getProductById: async (id: string): Promise<Product | undefined> => {
     return new Promise(resolve => setTimeout(() => resolve(products.find(p => p.id === id)), 100));
  },

  updateProduct: async (updatedProduct: Product): Promise<Product> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          products[index] = updatedProduct;
          resolve(updatedProduct);
        } else {
          reject(new Error("Product not found"));
        }
      }, 200);
    });
  },

  addProduct: async (newProductData: Omit<Product, 'id' | 'imageUrl'>): Promise<Product> => {
     return new Promise(resolve => {
       setTimeout(() => {
        const newProduct: Product = {
            ...newProductData,
            id: `p${Date.now()}`,
            imageUrl: `https://picsum.photos/seed/${newProductData.name.replace(/\s+/g, '')}/400`,
        };
        products.push(newProduct);
        resolve(newProduct);
       }, 200);
     });
  },

  getSales: async (): Promise<Sale[]> => {
    return new Promise(resolve => setTimeout(() => resolve([...sales]), 200));
  },

  createSale: async (saleItems: SaleItem[]): Promise<Sale> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let total = 0;
        const newStockLevels: { [key: string]: number } = {};

        for (const item of saleItems) {
          const product = products.find(p => p.id === item.productId);
          if (!product || product.stock < item.quantity) {
            reject(new Error(`Not enough stock for ${product?.name || 'unknown product'}`));
            return;
          }
          newStockLevels[item.productId] = product.stock - item.quantity;
          total += item.price * item.quantity;
        }

        // Only update stock if all items are valid
        for (const [productId, newStock] of Object.entries(newStockLevels)) {
            const index = products.findIndex(p => p.id === productId);
            if (index !== -1) {
                products[index].stock = newStock;
            }
        }
        
        const newSale: Sale = {
          id: `s${Date.now()}`,
          items: saleItems,
          total,
          timestamp: new Date().toISOString(),
        };

        sales.unshift(newSale);
        resolve(newSale);
      }, 300);
    });
  },
};

export default dbService;