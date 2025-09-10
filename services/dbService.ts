import { createClient } from '@supabase/supabase-js';
import type { Product, Sale, SaleItem } from '../types';
import mockDbService from './mockDbService';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Helper to handle Supabase errors
const handleSupabaseError = (error: any, context: string) => {
    if (error) {
        console.error(`Error in ${context}:`, error);
        throw new Error(`Database error during ${context}: ${error.message}`);
    }
};

// Type definitions for database table structures
type DbProduct = {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    image_url: string;
};

type DbSale = {
    id: string;
    total: number;
    created_at: string;
    sale_items: {
        product_id: string;
        quantity: number;
        price: number;
    }[];
};

let dbService;

if (supabaseUrl && supabaseAnonKey) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Successfully connected to Supabase. Using live data.");

    const supabaseDbService = {
        getProducts: async (): Promise<Product[]> => {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, category, price, stock, image_url')
                .order('name', { ascending: true });

            handleSupabaseError(error, 'fetching products');
            
            return ((data as DbProduct[]) || []).map(p => ({
                ...p,
                imageUrl: p.image_url,
            }));
        },
      
        updateProduct: async (updatedProduct: Product): Promise<Product> => {
            const { id, ...updateData } = updatedProduct;
            const { data, error } = await supabase
                .from('products')
                .update({
                    name: updateData.name,
                    category: updateData.category,
                    price: updateData.price,
                    stock: updateData.stock,
                })
                .eq('id', id)
                .select('id, name, category, price, stock, image_url')
                .single();
            
            handleSupabaseError(error, `updating product ${id}`);

            const dbProduct = data as DbProduct;
            return { ...dbProduct, imageUrl: dbProduct.image_url };
        },

        addProduct: async (newProductData: Omit<Product, 'id' | 'imageUrl'>): Promise<Product> => {
            const { data, error } = await supabase
                .from('products')
                .insert({
                    ...newProductData,
                    image_url: `https://picsum.photos/seed/${newProductData.name.replace(/\s+/g, '')}/400`,
                })
                .select('id, name, category, price, stock, image_url')
                .single();
            
            handleSupabaseError(error, 'adding product');

            const dbProduct = data as DbProduct;
            return { ...dbProduct, imageUrl: dbProduct.image_url };
        },

        getSales: async (): Promise<Sale[]> => {
            const { data, error } = await supabase
                .from('sales')
                .select(`
                    id,
                    total,
                    created_at,
                    sale_items (
                        product_id,
                        quantity,
                        price
                    )
                `)
                .order('created_at', { ascending: false });

            handleSupabaseError(error, 'fetching sales');

            return ((data as DbSale[]) || []).map(s => ({
                id: s.id,
                total: s.total,
                timestamp: s.created_at,
                items: (s.sale_items || []).map(item => ({
                    productId: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                }))
            }));
        },

        createSale: async (saleItems: SaleItem[]): Promise<Sale> => {
            const itemsToSell = saleItems.map(({ productId, quantity, price }) => ({
                p_id: productId,
                q: quantity,
                p: price
            }));
            
            const { data, error } = await supabase.rpc('create_sale_and_update_stock', {
                items_to_sell: itemsToSell
            });

            handleSupabaseError(error, 'creating sale');
            
            // The RPC function is expected to return the newly created sale record
            const newSaleFromDb = data[0];

            // We need to fetch the associated sale items separately if the RPC doesn't return them
             const { data: itemsData, error: itemsError } = await supabase
                .from('sale_items')
                .select('product_id, quantity, price')
                .eq('sale_id', newSaleFromDb.id);
            
            handleSupabaseError(itemsError, `fetching items for sale ${newSaleFromDb.id}`);

            return {
                id: newSaleFromDb.id,
                total: newSaleFromDb.total,
                timestamp: newSaleFromDb.created_at,
                items: (itemsData || []).map(item => ({
                    productId: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };
        },
    };
    dbService = supabaseDbService;
} else {
    console.warn("Supabase environment variables not set. Falling back to in-memory mock data. Data will not be persisted.");
    dbService = mockDbService;
}

export default dbService;
