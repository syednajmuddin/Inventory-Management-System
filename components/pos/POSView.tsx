
import React, { useState, useCallback, useMemo } from 'react';
import type { Product, CartItem, SaleItem, Sale } from '../../types';
import dbService from '../../services/dbService';
import { PlusIcon, MinusIcon, TrashIcon } from '../shared/Icons';

// ProductCard Component
const ProductCard: React.FC<{ product: Product; onAddToCart: (product: Product) => void }> = ({ product, onAddToCart }) => {
    return (
        <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-200 flex flex-col"
            onClick={() => onAddToCart(product)}
        >
            <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-md text-gray-800 dark:text-white">{product.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                <div className="mt-auto pt-2 flex justify-between items-center">
                    <p className="font-semibold text-primary">${product.price.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock} left
                    </span>
                </div>
            </div>
        </div>
    );
};

// Cart Component
const Cart: React.FC<{ 
    cart: CartItem[]; 
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemoveItem: (productId: string) => void;
    onCheckout: () => void;
    isProcessing: boolean;
}> = ({ cart, onUpdateQuantity, onRemoveItem, onCheckout, isProcessing }) => {
    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Order</h2>
            <div className="flex-grow overflow-y-auto pr-2">
                {cart.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center mt-8">Your cart is empty.</p>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-white">{item.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><MinusIcon className="w-4 h-4" /></button>
                                <span>{item.quantity}</span>
                                <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><PlusIcon className="w-4 h-4" /></button>
                                <button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700 ml-2"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {cart.length > 0 && (
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between mb-2 text-gray-600 dark:text-gray-300"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between mb-2 text-gray-600 dark:text-gray-300"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-xl mb-4 text-gray-800 dark:text-white"><span>Total</span><span>${total.toFixed(2)}</span></div>
                    <button 
                        onClick={onCheckout}
                        disabled={isProcessing}
                        className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isProcessing ? 'Processing...' : 'Checkout'}
                    </button>
                </div>
            )}
        </div>
    );
};


// Receipt Modal
const ReceiptModal: React.FC<{ sale: Sale | null; products: Product[]; onClose: () => void }> = ({ sale, products, onClose }) => {
    if (!sale) return null;

    const getProductName = (productId: string) => products.find(p => p.id === productId)?.name || 'Unknown Product';
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-sm text-gray-800 dark:text-white">
                <h2 className="text-2xl font-bold text-center mb-6">Receipt</h2>
                <div className="text-center mb-4">
                    <p>Transaction ID: {sale.id}</p>
                    <p>Date: {new Date(sale.timestamp).toLocaleString()}</p>
                </div>
                <div className="border-t border-b border-gray-300 dark:border-gray-600 py-4 my-4">
                    {sale.items.map(item => (
                        <div key={item.productId} className="flex justify-between mb-2">
                            <span>{getProductName(item.productId)} x{item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${sale.total.toFixed(2)}</span>
                </div>
                <button 
                    onClick={onClose} 
                    className="mt-8 w-full bg-secondary text-white font-bold py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};


// Main POSView Component
const POSView: React.FC<{ products: Product[], onSaleComplete: () => void }> = ({ products, onSaleComplete }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [lastSale, setLastSale] = useState<Sale | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddToCart = useCallback((product: Product) => {
        if (product.stock <= 0) {
            alert("This product is out of stock.");
            return;
        }
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                if(existingItem.quantity < product.stock) {
                    return prevCart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
                }
                return prevCart; // Do not add more than available in stock
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    }, []);

    const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            handleRemoveItem(productId);
            return;
        }
        const product = products.find(p => p.id === productId);
        if(product && quantity > product.stock) {
            alert(`Cannot add more than available stock (${product.stock}).`);
            return;
        }
        setCart(prevCart => prevCart.map(item => item.id === productId ? { ...item, quantity } : item));
    }, [products]);

    const handleRemoveItem = useCallback((productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    }, []);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        try {
            const saleItems: SaleItem[] = cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
            }));
            const newSale = await dbService.createSale(saleItems);
            setLastSale(newSale);
            setCart([]);
            onSaleComplete(); // Notify parent to refresh data
        } catch (error) {
            console.error("Checkout failed:", error);
            alert(`Checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const closeReceipt = () => {
        setLastSale(null);
    };

    const filteredProducts = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 bg-gray-100 dark:bg-gray-900 p-6 rounded-lg h-full flex flex-col">
                <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Products</h1>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-6 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto flex-grow">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                    ))}
                </div>
            </div>
            <div className="lg:col-span-1 h-full">
                <Cart 
                    cart={cart}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemoveItem={handleRemoveItem}
                    onCheckout={handleCheckout}
                    isProcessing={isProcessing}
                />
            </div>
            <ReceiptModal sale={lastSale} products={products} onClose={closeReceipt} />
        </div>
    );
};

export default POSView;