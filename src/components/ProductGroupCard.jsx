import React, { useState } from 'react';

export default function ProductGroupCard({ group, onAddToCart }) {
    const [selectedVariantId, setSelectedVariantId] = useState(group.variants[0].id);
    const selectedVariant = group.variants.find(v => v.id === selectedVariantId);

    return (
        <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-lg">{group.merk}</h3>
                <p className="text-gray-600 text-sm capitalize">{group.jenis_barang.replace('_', ' ')}</p>
            </div>
            <div className="mt-4 space-y-2">
                 <select value={selectedVariantId} onChange={(e) => setSelectedVariantId(Number(e.target.value))} className="w-full p-2 border rounded-md text-sm">
                    {group.variants.map(variant => (<option key={variant.id} value={variant.id}>{variant.tipe} (Stok: {variant.total_stock})</option>))}
                </select>
                <div className="text-lg font-semibold text-blue-600">Rp{selectedVariant.price ? selectedVariant.price.toLocaleString('id-ID') : '0'}</div>
                <button onClick={() => onAddToCart(selectedVariant)} className="w-full bg-blue-500 text-white font-semibold py-1 px-3 rounded hover:bg-blue-600 transition-colors text-sm">+ Tambah ke Keranjang</button>
            </div>
        </div>
    );
}