import React, { useState, useEffect } from 'react';

// Data mapping untuk auto-generate SKU
const SKU_MAPPING = {
    'kulkas': 'KL',
    'mesin_cuci': 'MC',
    'freezer': 'FB',
    'tv': 'TV',
    'ac': 'AC',
    'kipas_angin': 'KA',
    'dispenser': 'DS',
    'microwave': 'MW',
    'rice_cooker': 'RC',
    'lainnya': 'XX'
};

export default function EditProductModal({ isOpen, onClose, product, onSave }) {
    const [formState, setFormState] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autoGenerateSKU, setAutoGenerateSKU] = useState(false);

    // Common product types
    const [jenisOptions, setJenisOptions] = useState([
        { value: 'kulkas', label: 'Kulkas' },
        { value: 'mesin_cuci', label: 'Mesin Cuci' },
        { value: 'freezer', label: 'Freezer' },
        { value: 'tv', label: 'TV' },
        { value: 'ac', label: 'AC' },
        { value: 'kipas_angin', label: 'Kipas Angin' },
        { value: 'dispenser', label: 'Dispenser' },
        { value: 'microwave', label: 'Microwave' },
        { value: 'rice_cooker', label: 'Rice Cooker' }
    ]);
    const [showAddJenis, setShowAddJenis] = useState(false);
    const [newJenis, setNewJenis] = useState({ value: '', label: '' });

    useEffect(() => {
        if (product) {
            setFormState({
                ...product,
                hpp_current: product.avg_hpp || 0, // Display current HPP
                stock_tambahan: 0 // Additional stock to add
            });
        }
    }, [product]);

    // Auto generate SKU if checkbox is checked
    useEffect(() => {
        if (autoGenerateSKU && formState?.jenis_barang && formState?.merk && formState?.tipe) {
            const skuPrefix = SKU_MAPPING[formState.jenis_barang] || 'XX';
            const merkCode = formState.merk.substring(0, 3).toUpperCase();
            const generatedSKU = `${skuPrefix}-${merkCode}-${formState.tipe.toUpperCase()}`;
            
            setFormState(prev => ({
                ...prev,
                sku: generatedSKU
            }));
        }
    }, [autoGenerateSKU, formState?.jenis_barang, formState?.merk, formState?.tipe]);

    if (!isOpen || !formState) return null;

    const handleAddJenis = () => {
        if (newJenis.value && newJenis.label) {
            const formattedValue = newJenis.value.toLowerCase().replace(/\s+/g, '_');
            setJenisOptions(prev => [...prev, { value: formattedValue, label: newJenis.label }]);
            setFormState(prev => ({ ...prev, jenis_barang: formattedValue }));
            
            // Add to SKU_MAPPING
            SKU_MAPPING[formattedValue] = newJenis.value.toUpperCase();
            
            setShowAddJenis(false);
            setNewJenis({ value: '', label: '' });
        } else {
            alert('Mohon isi kode dan nama jenis barang');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!formState.jenis_barang || !formState.merk || !formState.tipe) {
            alert('Jenis Barang, Merk, dan Tipe wajib diisi.');
            return;
        }

        setIsSubmitting(true);
        
        // Only send fields that can be updated
        const { name, sku, jenis_barang, merk, tipe, price, min_stock } = formState;
        
        await onSave(product.id, { 
            name, 
            sku, 
            jenis_barang: jenis_barang.toLowerCase(), 
            merk, 
            tipe, 
            price: Number(price) || 0,
            min_stock: Number(min_stock) || 0
        });
        
        setIsSubmitting(false);
        setAutoGenerateSKU(false);
        onClose();
    };

    const handleClose = () => {
        setAutoGenerateSKU(false);
        onClose();
    };

    // Calculate margin
    const calculateMargin = () => {
        if (formState.price > 0 && formState.hpp_current > 0) {
            return ((formState.price - formState.hpp_current) / formState.price * 100).toFixed(1);
        }
        return 0;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Edit Produk</h3>
                
                {/* Jenis Barang */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Jenis Barang <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                        <select 
                            name="jenis_barang" 
                            value={formState.jenis_barang} 
                            onChange={handleChange} 
                            className="flex-1 p-2 border rounded-md"
                        >
                            <option value="">-- Pilih Jenis --</option>
                            {jenisOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setShowAddJenis(true)}
                            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                        >
                            + Jenis
                        </button>
                    </div>
                </div>

                {/* Modal Add Jenis */}
                {showAddJenis && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <h4 className="font-medium mb-2">Tambah Jenis Barang Baru</h4>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                                type="text"
                                placeholder="Nama Jenis (contoh: Kompor)"
                                value={newJenis.label}
                                onChange={(e) => setNewJenis(prev => ({ ...prev, label: e.target.value }))}
                                className="p-2 border rounded-md text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Kode SKU (contoh: KP)"
                                value={newJenis.value}
                                onChange={(e) => setNewJenis(prev => ({ ...prev, value: e.target.value.toUpperCase().substring(0, 2) }))}
                                maxLength="2"
                                className="p-2 border rounded-md text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleAddJenis}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                            >
                                Simpan
                            </button>
                            <button
                                type="button"
                                onClick={() => {setShowAddJenis(false); setNewJenis({ value: '', label: '' });}}
                                className="px-3 py-1 bg-gray-200 rounded text-sm"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                )}

                {/* Merk */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Merk <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        name="merk" 
                        value={formState.merk} 
                        onChange={handleChange} 
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                {/* Tipe */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Tipe Produk <span className="text-red-500">*</span>
                    </label>
                    <input 
                        type="text" 
                        name="tipe" 
                        value={formState.tipe} 
                        onChange={handleChange} 
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                {/* SKU */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">SKU</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            name="sku"
                            value={formState.sku} 
                            onChange={handleChange}
                            disabled={autoGenerateSKU}
                            className={`flex-1 p-2 border rounded-md ${autoGenerateSKU ? 'bg-gray-100' : ''}`}
                        />
                        <label className="flex items-center">
                            <input 
                                type="checkbox"
                                checked={autoGenerateSKU}
                                onChange={(e) => setAutoGenerateSKU(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm">Auto</span>
                        </label>
                    </div>
                </div>

                {/* Nama Produk */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Nama Produk</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formState.name} 
                        onChange={handleChange} 
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                {/* Pricing Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">HPP Rata-rata</label>
                        <input 
                            type="text" 
                            value={`Rp ${formState.hpp_current?.toLocaleString('id-ID') || '0'}`}
                            readOnly
                            className="w-full p-2 border rounded-md bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">Dari inventory</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Harga Jual</label>
                        <input 
                            type="number" 
                            name="price" 
                            value={formState.price} 
                            onChange={handleChange} 
                            className="w-full p-2 border rounded-md"
                        />
                        <p className={`text-xs mt-1 font-medium ${calculateMargin() < 10 ? 'text-red-600' : 'text-green-600'}`}>
                            Margin: {calculateMargin()}%
                        </p>
                    </div>
                </div>

                {/* Stock Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Stok Saat Ini</label>
                        <input 
                            type="text" 
                            value={formState.total_stock || 0}
                            readOnly
                            className="w-full p-2 border rounded-md bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tambah Stok</label>
                        <input 
                            type="number" 
                            name="stock_tambahan" 
                            value={formState.stock_tambahan} 
                            onChange={handleChange}
                            placeholder="0" 
                            className="w-full p-2 border rounded-md"
                        />
                        <p className="text-xs text-gray-500 mt-1">Gunakan menu +Stok untuk detail</p>
                    </div>
                </div>

                <div className="mt-6 flex gap-2">
                    <button onClick={handleClose} className="w-full bg-gray-200 py-2 px-4 rounded">
                        Batal
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSubmitting} 
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
}