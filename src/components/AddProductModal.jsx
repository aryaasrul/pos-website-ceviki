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

export default function AddProductModal({ isOpen, onClose, onSave }) {
    const initialState = {
        jenis_barang: '',
        merk: '',
        tipe: '',
        name: '',
        sku: '',
        price: '',
        hpp_modal: '', // Harga modal
        stock_awal: 0, // Ubah dari min_stock ke stock_awal
    };
    const [formState, setFormState] = useState(initialState);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Auto generate SKU and Name when jenis, merk, tipe changes
    useEffect(() => {
        if (formState.jenis_barang && formState.merk && formState.tipe) {
            // Generate SKU
            const skuPrefix = SKU_MAPPING[formState.jenis_barang] || 'XX';
            const merkCode = formState.merk.substring(0, 3).toUpperCase();
            const generatedSKU = `${skuPrefix}-${merkCode}-${formState.tipe.toUpperCase()}`;
            
            // Generate Name
            const jenisLabel = jenisOptions.find(j => j.value === formState.jenis_barang)?.label || formState.jenis_barang;
            const generatedName = `${jenisLabel} ${formState.merk} ${formState.tipe}`;
            
            setFormState(prev => ({
                ...prev,
                sku: generatedSKU,
                name: generatedName
            }));
        }
    }, [formState.jenis_barang, formState.merk, formState.tipe]);

    if (!isOpen) return null;

    const handleAddJenis = () => {
        if (newJenis.value && newJenis.label) {
            const formattedValue = newJenis.value.toLowerCase().replace(/\s+/g, '_');
            setJenisOptions(prev => [...prev, { value: formattedValue, label: newJenis.label }]);
            setFormState(prev => ({ ...prev, jenis_barang: formattedValue }));
            
            // Add to SKU_MAPPING
            SKU_MAPPING[formattedValue] = formattedValue.substring(0, 2).toUpperCase();
            
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
        
        // Prepare data for save
        const productData = {
            name: formState.name,
            sku: formState.sku,
            jenis_barang: formState.jenis_barang.toLowerCase(),
            merk: formState.merk,
            tipe: formState.tipe,
            price: Number(formState.price) || 0,
            min_stock: 3, // Default min stock
            active: true
        };
        
        // Save product first
        await onSave(productData);
        
        // If stock_awal > 0, also add initial inventory
        if (formState.stock_awal > 0 && formState.hpp_modal) {
            // Note: You'll need to handle inventory creation in the parent component
            console.log('Initial stock to add:', {
                quantity: formState.stock_awal,
                hpp: formState.hpp_modal
            });
        }
        setIsSubmitting(false);
        setFormState(initialState);
        onClose();
    };

    const handleClose = () => {
        setFormState(initialState);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Tambah Produk Baru</h3>
                
                {/* Step 1: Jenis Barang */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        1. Pilih Jenis Barang <span className="text-red-500">*</span>
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

                {/* Step 2: Merk */}
                {formState.jenis_barang && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            2. Masukkan Merk <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            name="merk" 
                            value={formState.merk} 
                            onChange={handleChange} 
                            placeholder="Contoh: Sharp, Polytron, Samsung"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                )}

                {/* Step 3: Tipe */}
                {formState.merk && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            3. Masukkan Tipe Produk <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            name="tipe" 
                            value={formState.tipe} 
                            onChange={handleChange} 
                            placeholder="Contoh: 70MW, 157, AQF-120FB"
                            className="w-full p-2 border rounded-md"
                        />
                    </div>
                )}

                {/* Auto Generated Fields */}
                {formState.tipe && (
                    <>
                        <div className="mb-4 bg-gray-50 p-3 rounded">
                            <label className="block text-sm font-medium mb-1">SKU (Auto Generated)</label>
                            <input 
                                type="text" 
                                value={formState.sku} 
                                readOnly 
                                className="w-full p-2 border rounded-md bg-gray-100"
                            />
                        </div>

                        <div className="mb-4 bg-gray-50 p-3 rounded">
                            <label className="block text-sm font-medium mb-1">Nama Produk (Auto Generated)</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formState.name} 
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">Bisa diedit jika perlu</p>
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Harga Modal (HPP)</label>
                                <input 
                                    type="number" 
                                    name="hpp_modal" 
                                    value={formState.hpp_modal} 
                                    onChange={handleChange} 
                                    placeholder="0"
                                    className="w-full p-2 border rounded-md"
                                />
                                <p className="text-xs text-gray-500 mt-1">Untuk stok awal</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Harga Jual</label>
                                <input 
                                    type="number" 
                                    name="price" 
                                    value={formState.price} 
                                    onChange={handleChange} 
                                    placeholder="0"
                                    className="w-full p-2 border rounded-md"
                                />
                                {formState.hpp_modal && formState.price && (
                                    <p className="text-xs mt-1">
                                        Margin: {((Number(formState.price) - Number(formState.hpp_modal)) / Number(formState.price) * 100).toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Stock Awal */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Stok Awal</label>
                            <input 
                                type="number" 
                                name="stock_awal" 
                                value={formState.stock_awal} 
                                onChange={handleChange} 
                                placeholder="0"
                                className="w-full p-2 border rounded-md"
                            />
                            <p className="text-xs text-gray-500 mt-1">Jumlah stok awal yang akan ditambahkan</p>
                        </div>
                    </>
                )}

                <div className="mt-6 flex gap-2">
                    <button onClick={handleClose} className="w-full bg-gray-200 py-2 px-4 rounded">
                        Batal
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSubmitting || !formState.tipe} 
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                    </button>
                </div>
            </div>
        </div>
    );
}