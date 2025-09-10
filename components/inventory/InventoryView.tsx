
import React, { useState } from 'react';
import type { Product } from '../../types';
import dbService from '../../services/dbService';
import { PlusIcon, EditIcon } from '../shared/Icons';

// Product Form Modal Component
const ProductFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Omit<Product, 'id' | 'imageUrl'> | Product) => void;
    productToEdit?: Product | null;
}> = ({ isOpen, onClose, onSave, productToEdit }) => {
    const [name, setName] = useState(productToEdit?.name || '');
    const [category, setCategory] = useState(productToEdit?.category || '');
    const [price, setPrice] = useState(productToEdit?.price || 0);
    const [stock, setStock] = useState(productToEdit?.stock || 0);

    React.useEffect(() => {
        if (productToEdit) {
            setName(productToEdit.name);
            setCategory(productToEdit.category);
            setPrice(productToEdit.price);
            setStock(productToEdit.stock);
        } else {
            setName('');
            setCategory('');
            setPrice(0);
            setStock(0);
        }
    }, [productToEdit]);
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const productData = { name, category, price: +price, stock: +stock };
        if (productToEdit) {
            onSave({ ...productToEdit, ...productData });
        } else {
            onSave(productData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Product Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 dark:text-gray-300 mb-2">Category</label>
                        <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2">Price</label>
                            <input type="number" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                        <div>
                            <label className="block text-gray-700 dark:text-gray-300 mb-2">Stock</label>
                            <input type="number" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" className="py-2 px-4 bg-primary text-white rounded-lg hover:bg-indigo-700 transition-colors">{productToEdit ? 'Save Changes' : 'Add Product'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// Main InventoryView Component
const InventoryView: React.FC<{ products: Product[]; onDataChange: () => void }> = ({ products, onDataChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);

    const handleOpenModal = (product?: Product) => {
        setProductToEdit(product || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setProductToEdit(null);
        setIsModalOpen(false);
    };

    const handleSaveProduct = async (productData: Omit<Product, 'id' | 'imageUrl'> | Product) => {
        try {
            if ('id' in productData) {
                await dbService.updateProduct(productData);
            } else {
                await dbService.addProduct(productData);
            }
        } catch (error) {
             console.error("Failed to save product:", error);
            alert(`Failed to save product: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
        onDataChange();
        handleCloseModal();
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Inventory</h1>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5"/>
                    <span>Add Product</span>
                </button>
            </div>
            <div className="flex-grow overflow-x-auto">
                <table className="w-full text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Product Name</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Price</th>
                            <th scope="col" className="px-6 py-3">Stock</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{product.name}</td>
                                <td className="px-6 py-4">{product.category}</td>
                                <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => handleOpenModal(product)} className="text-primary hover:text-indigo-700">
                                        <EditIcon className="w-5 h-5"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ProductFormModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveProduct} 
                productToEdit={productToEdit} 
            />
        </div>
    );
};

export default InventoryView;