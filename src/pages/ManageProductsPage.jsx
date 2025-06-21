import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import EditProductModal from '../components/EditProductModal';
import AddStockModal from '../components/AddStockModal';
import AddProductModal from '../components/AddProductModal';

export default function ManageProductsPage() {
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('v_product_stock').select('*').order('name', { ascending: true });
        if (error) console.error("Error fetching products:", error);
        else setAllProducts(data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
            const searchMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = categoryFilter === 'all' || p.jenis_barang === categoryFilter;
            return searchMatch && categoryMatch;
        });
    }, [allProducts, searchTerm, categoryFilter]);
    
    const uniqueCategories = useMemo(() => [...new Set(allProducts.map(p => p.jenis_barang).filter(Boolean))], [allProducts]);

    const handleOpenEditModal = (p) => { setSelectedProduct(p); setIsEditModalOpen(true); };
    const handleOpenAddStockModal = (p) => { setSelectedProduct(p); setIsAddStockModalOpen(true); };
    const handleSaveProduct = async (id, data) => { const { error } = await supabase.from('products').update(data).eq('id', id); if (error) alert(`Gagal: ${error.message}`); else fetchProducts(); };
    const handleSaveStock = async (data) => { const { error } = await supabase.from('inventory').insert([data]); if (error) alert(`Gagal: ${error.message}`); else fetchProducts(); };
    const handleAddNewProduct = async (data) => { const { error } = await supabase.from('products').insert([data]); if (error) alert(`Gagal: ${error.message}`); else fetchProducts(); };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-bold">Kelola Produk & Stok</h2>
                <button onClick={() => setIsAddProductModalOpen(true)} className="w-full md:w-auto bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">Tambah Produk Baru</button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow mb-4 flex flex-col md:flex-row gap-4">
                <input type="text" placeholder="Cari nama atau SKU..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-1/2 p-2 border rounded-md" />
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="w-full md:w-1/2 p-2 border rounded-md bg-white">
                    <option value="all">Semua Kategori</option>
                    {uniqueCategories.map(cat => <option key={cat} value={cat} className="capitalize">{cat.replace('_', ' ')}</option>)}
                </select>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3 text-left">Produk</th>
                            <th className="p-3 text-right">Stok</th>
                            <th className="p-3 text-right">HPP Rata-rata</th>
                            <th className="p-3 text-right">Harga Jual</th>
                            <th className="p-3 text-right">Margin</th>
                            <th className="p-3 text-left">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (<tr><td colSpan="6" className="text-center p-4">Memuat data...</td></tr>) 
                        : (filteredProducts.map(p => {
                            const margin = p.price > 0 && p.avg_hpp > 0 ? ((p.price - p.avg_hpp) / p.price) * 100 : 0;
                            return (
                                <tr key={p.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3"><div className="font-bold">{p.name}</div><div className="text-xs text-gray-500">{p.sku}</div></td>
                                    <td className="p-3 text-right font-semibold">{p.total_stock}</td>
                                    <td className="p-3 text-right">Rp{p.avg_hpp ? p.avg_hpp.toLocaleString('id-ID', {maximumFractionDigits:0}) : '0'}</td>
                                    <td className="p-3 text-right">Rp{p.price ? p.price.toLocaleString('id-ID') : '0'}</td>
                                    <td className={`p-3 text-right font-medium ${margin < 10 ? 'text-red-500' : 'text-green-600'}`}>{margin.toFixed(1)}%</td>
                                    <td className="p-3 flex flex-wrap gap-2">
                                        <button onClick={() => handleOpenAddStockModal(p)} className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">Stok+</button>
                                        <button onClick={() => handleOpenEditModal(p)} className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">Edit</button>
                                    </td>
                                </tr>
                            )
                        }))}
                    </tbody>
                </table>
            </div>

            <AddProductModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} onSave={handleAddNewProduct} />
            <EditProductModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} product={selectedProduct} onSave={handleSaveProduct} />
            <AddStockModal isOpen={isAddStockModalOpen} onClose={() => setIsAddStockModalOpen(false)} product={selectedProduct} onSave={handleSaveStock} />
        </div>
    );
}
