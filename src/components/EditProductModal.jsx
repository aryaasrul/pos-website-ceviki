import React, { useState, useEffect } from 'react';

export default function EditProductModal({ isOpen, onClose, product, onSave }) {
    const [formState, setFormState] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (product) {
            setFormState(product);
        }
    }, [product]);

    if (!isOpen || !formState) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        // Kirim hanya data yang diizinkan untuk diubah di tabel 'products'
        const { name, sku, jenis_barang, merk, tipe, price, min_stock } = formState;
        await onSave(product.id, { 
            name, sku, jenis_barang: jenis_barang.toLowerCase(), merk, tipe, 
            price: Number(price) || 0,
            min_stock: Number(min_stock) || 0
        });
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Edit Produk</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium">Nama Produk</label><input type="text" name="name" value={formState.name} onChange={handleChange} className="mt-1 w-full border rounded-md p-2"/></div>
                    <div><label className="block text-sm font-medium">SKU</label><input type="text" name="sku" value={formState.sku} onChange={handleChange} className="mt-1 w-full border rounded-md p-2"/></div>
                    <div><label className="block text-sm font-medium">Merk</label><input type="text" name="merk" value={formState.merk} onChange={handleChange} className="mt-1 w-full border rounded-md p-2"/></div>
                    <div><label className="block text-sm font-medium">Tipe</label><input type="text" name="tipe" value={formState.tipe} onChange={handleChange} className="mt-1 w-full border rounded-md p-2"/></div>
                    <div><label className="block text-sm font-medium">Jenis Barang</label><input type="text" name="jenis_barang" value={formState.jenis_barang} onChange={handleChange} className="mt-1 w-full border rounded-md p-2"/></div>
                    <div><label className="block text-sm font-medium">Harga Jual</label><input type="number" name="price" value={formState.price} onChange={handleChange} className="mt-1 w-full border rounded-md p-2"/></div>
                    <div><label className="block text-sm font-medium">Stok Minimum</label><input type="number" name="min_stock" value={formState.min_stock} onChange={handleChange} className="mt-1 w-full border rounded-md p-2"/></div>
                </div>
                <div className="mt-6 flex gap-2">
                    <button onClick={onClose} className="w-full bg-gray-200 py-2 px-4 rounded">Batal</button>
                    <button onClick={handleSave} disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400">{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                </div>
            </div>
        </div>
    );
}
