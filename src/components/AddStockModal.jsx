import React, { useState } from 'react';

export default function AddStockModal({ isOpen, onClose, product, onSave }) {
    const [formState, setFormState] = useState({
        quantity_in: '',
        hpp: '',
        supplier: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !product) return null;

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        const dataToSave = {
            product_id: product.id,
            quantity_in: Number(formState.quantity_in),
            quantity_left: Number(formState.quantity_in), // Stok masuk = stok tersisa
            hpp: Number(formState.hpp),
            supplier: formState.supplier,
            purchase_date: new Date().toISOString(), // Tanggal hari ini
        };
        await onSave(dataToSave);
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold mb-4">Tambah Stok: {product.name}</h3>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium">Jumlah Masuk</label><input type="number" name="quantity_in" value={formState.quantity_in} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2"/></div>
                    <div><label className="block text-sm font-medium">Harga Pokok Penjualan (HPP) per unit</label><input type="number" name="hpp" value={formState.hpp} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2"/></div>
                    <div><label className="block text-sm font-medium">Supplier (Opsional)</label><input type="text" name="supplier" value={formState.supplier} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2"/></div>
                </div>
                <div className="mt-6 flex gap-2">
                    <button onClick={onClose} className="w-full bg-gray-200 py-2 px-4 rounded">Batal</button>
                    <button onClick={handleSave} disabled={isSubmitting} className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400">
                        {isSubmitting ? 'Menyimpan...' : 'Tambah Stok'}
                    </button>
                </div>
            </div>
        </div>
    );
}
