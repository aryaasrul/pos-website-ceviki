// ===== FILE: src/pages/ManageProductsPage.jsx =====
// Redesign untuk handle 500+ produk dengan filter powerful

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
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [brandFilter, setBrandFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all'); // all, available, low, out
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    
    // View mode
    const [viewMode, setViewMode] = useState('compact'); // compact or detailed

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('v_product_stock')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) console.error("Error fetching products:", error);
        else setAllProducts(data);
        setLoading(false);
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // Advanced filtering
    const filteredProducts = useMemo(() => {
        return allProducts.filter(p => {
            // Search filter
            const searchMatch = 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.merk?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.tipe?.toLowerCase().includes(searchTerm.toLowerCase());
            
            // Category filter
            const categoryMatch = categoryFilter === 'all' || p.jenis_barang === categoryFilter;
            
            // Brand filter
            const brandMatch = brandFilter === 'all' || p.merk === brandFilter;
            
            // Stock filter
            let stockMatch = true;
            if (stockFilter === 'available') stockMatch = p.total_stock > 0;
            else if (stockFilter === 'low') stockMatch = p.total_stock > 0 && p.total_stock <= 3;
            else if (stockFilter === 'out') stockMatch = p.total_stock === 0;
            
            // Price range filter
            let priceMatch = true;
            if (priceRange.min) priceMatch = p.price >= Number(priceRange.min);
            if (priceMatch && priceRange.max) priceMatch = p.price <= Number(priceRange.max);
            
            return searchMatch && categoryMatch && brandMatch && stockMatch && priceMatch;
        });
    }, [allProducts, searchTerm, categoryFilter, brandFilter, stockFilter, priceRange]);
    
    // Pagination
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredProducts, currentPage, itemsPerPage]);
    
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    
    // Get unique values for filters
    const uniqueCategories = useMemo(() => [...new Set(allProducts.map(p => p.jenis_barang).filter(Boolean))], [allProducts]);
    const uniqueBrands = useMemo(() => [...new Set(allProducts.map(p => p.merk).filter(Boolean))], [allProducts]);

    // Handlers
    const handleOpenEditModal = (p) => { setSelectedProduct(p); setIsEditModalOpen(true); };
    const handleOpenAddStockModal = (p) => { setSelectedProduct(p); setIsAddStockModalOpen(true); };
    const handleSaveProduct = async (id, data) => { 
        const { error } = await supabase.from('products').update(data).eq('id', id); 
        if (error) alert(`Gagal: ${error.message}`); 
        else fetchProducts(); 
    };
    const handleSaveStock = async (data) => { 
        const { error } = await supabase.from('inventory').insert([data]); 
        if (error) alert(`Gagal: ${error.message}`); 
        else fetchProducts(); 
    };
    const handleAddNewProduct = async (data) => { 
        const { error } = await supabase.from('products').insert([data]); 
        if (error) alert(`Gagal: ${error.message}`); 
        else fetchProducts(); 
    };

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setCategoryFilter('all');
        setBrandFilter('all');
        setStockFilter('all');
        setPriceRange({ min: '', max: '' });
        setCurrentPage(1);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Kelola Produk & Stok</h2>
                <button 
                    onClick={() => setIsAddProductModalOpen(true)} 
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
                >
                    + Tambah Produk
                </button>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                {/* Search Bar */}
                <div className="mb-4">
                    <input 
                        type="text" 
                        placeholder="Cari nama, SKU, merk, atau tipe..." 
                        value={searchTerm} 
                        onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
                        className="w-full p-2 border rounded-md"
                    />
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    <select 
                        value={categoryFilter} 
                        onChange={e => {setCategoryFilter(e.target.value); setCurrentPage(1);}} 
                        className="p-2 border rounded-md bg-white text-sm"
                    >
                        <option value="all">Semua Kategori</option>
                        {uniqueCategories.map(cat => (
                            <option key={cat} value={cat} className="capitalize">
                                {cat.replace('_', ' ')}
                            </option>
                        ))}
                    </select>

                    <select 
                        value={brandFilter} 
                        onChange={e => {setBrandFilter(e.target.value); setCurrentPage(1);}} 
                        className="p-2 border rounded-md bg-white text-sm"
                    >
                        <option value="all">Semua Merk</option>
                        {uniqueBrands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>

                    <select 
                        value={stockFilter} 
                        onChange={e => {setStockFilter(e.target.value); setCurrentPage(1);}} 
                        className="p-2 border rounded-md bg-white text-sm"
                    >
                        <option value="all">Semua Stok</option>
                        <option value="available">Stok Ada</option>
                        <option value="low">Stok Menipis (≤3)</option>
                        <option value="out">Stok Habis</option>
                    </select>

                    <input 
                        type="number" 
                        placeholder="Harga Min" 
                        value={priceRange.min} 
                        onChange={e => {setPriceRange(prev => ({...prev, min: e.target.value})); setCurrentPage(1);}} 
                        className="p-2 border rounded-md text-sm"
                    />

                    <input 
                        type="number" 
                        placeholder="Harga Max" 
                        value={priceRange.max} 
                        onChange={e => {setPriceRange(prev => ({...prev, max: e.target.value})); setCurrentPage(1);}} 
                        className="p-2 border rounded-md text-sm"
                    />

                    <button 
                        onClick={resetFilters} 
                        className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                    >
                        Reset Filter
                    </button>
                </div>

                {/* Results Info & View Toggle */}
                <div className="mt-3 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Menampilkan {paginatedProducts.length} dari {filteredProducts.length} produk
                        {filteredProducts.length !== allProducts.length && ` (Total: ${allProducts.length})`}
                    </p>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setViewMode('compact')} 
                            className={`p-2 rounded ${viewMode === 'compact' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                            title="Compact View"
                        >
                            ☰
                        </button>
                        <button 
                            onClick={() => setViewMode('detailed')} 
                            className={`p-2 rounded ${viewMode === 'detailed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                            title="Detailed View"
                        >
                            ⊞
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Table/Grid */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {viewMode === 'compact' ? (
                    // Compact Table View
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b text-sm">
                                <tr>
                                    <th className="p-2 text-left">Produk</th>
                                    <th className="p-2 text-center">Stok</th>
                                    <th className="p-2 text-right">Harga</th>
                                    <th className="p-2 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center p-4">Memuat data...</td></tr>
                                ) : paginatedProducts.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center p-4">Tidak ada produk ditemukan</td></tr>
                                ) : (
                                    paginatedProducts.map(p => (
                                        <tr key={p.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2">
                                                <div>
                                                    <p className="font-medium text-sm">{p.name}</p>
                                                    <p className="text-xs text-gray-500">{p.sku}</p>
                                                </div>
                                            </td>
                                            <td className="p-2 text-center">
                                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                    p.total_stock === 0 ? 'bg-red-100 text-red-700' :
                                                    p.total_stock <= 3 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {p.total_stock}
                                                </span>
                                            </td>
                                            <td className="p-2 text-right text-sm">
                                                Rp{p.price?.toLocaleString('id-ID') || '0'}
                                            </td>
                                            <td className="p-2 text-center">
                                                <button 
                                                    onClick={() => handleOpenAddStockModal(p)} 
                                                    className="text-green-600 hover:text-green-800 text-xs font-bold mr-2"
                                                >
                                                    +Stok
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenEditModal(p)} 
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // Detailed Grid View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {paginatedProducts.map(p => {
                            const margin = p.price > 0 && p.avg_hpp > 0 ? ((p.price - p.avg_hpp) / p.price) * 100 : 0;
                            return (
                                <div key={p.id} className="border rounded-lg p-4 hover:shadow-md">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-sm">{p.name}</h3>
                                            <p className="text-xs text-gray-500">{p.sku}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            p.total_stock === 0 ? 'bg-red-100 text-red-700' :
                                            p.total_stock <= 3 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            Stok: {p.total_stock}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Harga Jual:</span>
                                            <span className="font-medium">Rp{p.price?.toLocaleString('id-ID') || '0'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">HPP:</span>
                                            <span>Rp{p.avg_hpp?.toLocaleString('id-ID', {maximumFractionDigits:0}) || '0'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Margin:</span>
                                            <span className={`font-medium ${margin < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                                {margin.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button 
                                            onClick={() => handleOpenAddStockModal(p)} 
                                            className="flex-1 bg-green-100 text-green-700 text-xs font-bold py-1 rounded hover:bg-green-200"
                                        >
                                            + Stok
                                        </button>
                                        <button 
                                            onClick={() => handleOpenEditModal(p)} 
                                            className="flex-1 bg-blue-100 text-blue-700 text-xs font-bold py-1 rounded hover:bg-blue-200"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded border disabled:opacity-50"
                    >
                        ‹
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (currentPage <= 3) {
                            pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`px-3 py-1 rounded ${
                                    currentPage === pageNum 
                                        ? 'bg-blue-600 text-white' 
                                        : 'border hover:bg-gray-100'
                                }`}
                            >
                                {pageNum}
                            </button>
                        );
                    })}
                    
                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded border disabled:opacity-50"
                    >
                        ›
                    </button>
                    
                    <span className="text-sm text-gray-600 ml-2">
                        Halaman {currentPage} dari {totalPages}
                    </span>
                </div>
            )}

            <AddProductModal isOpen={isAddProductModalOpen} onClose={() => setIsAddProductModalOpen(false)} onSave={handleAddNewProduct} />
            <EditProductModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} product={selectedProduct} onSave={handleSaveProduct} />
            <AddStockModal isOpen={isAddStockModalOpen} onClose={() => setIsAddStockModalOpen(false)} product={selectedProduct} onSave={handleSaveStock} />
        </div>
    );
}