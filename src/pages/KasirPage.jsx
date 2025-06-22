import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthProvider';
import ProductGroupCard from '../components/ProductGroupCard';
import Cart from '../components/Cart';
import PaymentModal from '../components/PaymentModal';
import ErrorAlert from '../components/ErrorAlert';

const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(window.matchMedia(query).matches);
    useEffect(() => {
        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [query]);
    return matches;
};

export default function KasirPage() {
    const { employee, refreshEmployee } = useAuth();
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cart, setCart] = useState([]);
    const [totals, setTotals] = useState({ subtotal: 0, discount: 0, total: 0 });
    const [transactionDiscount, setTransactionDiscount] = useState({ type: 'fixed', value: 0 });
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mobileView, setMobileView] = useState('products');
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [brandFilter, setBrandFilter] = useState('all');
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase
                    .from('v_product_stock')
                    .select('*')
                    .order('name', { ascending: true });
                
                if (error) {
                    // Handle RLS error dengan retry
                    if (error.code === 'PGRST301' && retryCount < 3) {
                        setRetryCount(prev => prev + 1);
                        setTimeout(() => {
                            refreshEmployee();
                            fetchProducts();
                        }, 1000);
                        return;
                    }
                    throw error;
                }
                
                if (!data || data.length === 0) {
                    setError('Tidak ada produk tersedia. Hubungi admin.');
                }
                
                setAllProducts(data || []);
                setRetryCount(0); // Reset retry count on success
            } catch (err) {
                console.error('Error fetching products:', err);
                setError(`Gagal memuat produk: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        
        if (employee) {
            fetchProducts();
        }
    }, [employee, refreshEmployee, retryCount]);
    
    useEffect(() => {
        const subtotalOriginal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const subtotalAfterItemDiscount = cart.reduce((acc, item) => {
            const originalPrice = item.price * item.quantity;
            let itemDiscountAmount = item.discount.type === 'percentage' ? originalPrice * (item.discount.value / 100) : item.discount.value;
            itemDiscountAmount = Math.min(itemDiscountAmount, originalPrice);
            return acc + (originalPrice - itemDiscountAmount);
        }, 0);
        let transactionDiscountAmount = transactionDiscount.type === 'percentage' ? subtotalAfterItemDiscount * (transactionDiscount.value / 100) : transactionDiscount.value;
        transactionDiscountAmount = Math.min(transactionDiscountAmount, subtotalAfterItemDiscount);
        const totalDiscount = (subtotalOriginal - subtotalAfterItemDiscount) + transactionDiscountAmount;
        const total = subtotalAfterItemDiscount - transactionDiscountAmount;
        setTotals({ subtotal: subtotalOriginal, discount: totalDiscount, total });
    }, [cart, transactionDiscount]);
    
    const groupedAndFilteredProducts = useMemo(() => {
        const filtered = allProducts.filter(p => (categoryFilter === 'all' || p.jenis_barang === categoryFilter) && (brandFilter === 'all' || p.merk === brandFilter));
        const grouped = filtered.reduce((acc, p) => {
            const key = `${p.jenis_barang}-${p.merk}`;
            if (!acc[key]) acc[key] = { groupKey: key, jenis_barang: p.jenis_barang, merk: p.merk, variants: [] };
            acc[key].variants.push(p);
            return acc;
        }, {});
        return Object.values(grouped);
    }, [allProducts, categoryFilter, brandFilter]);

    const uniqueCategories = useMemo(() => [...new Set(allProducts.map(p => p.jenis_barang))], [allProducts]);
    const uniqueBrands = useMemo(() => [...new Set(allProducts.map(p => p.merk))], [allProducts]);

    const handleAddToCart = (p) => setCart(prev => { 
        const existing = prev.find(i => i.id === p.id); 
        if (existing) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i); 
        return [...prev, { ...p, quantity: 1, discount: { type: 'fixed', value: 0 } }]; 
    });
    
    const handleQuantityChange = (id, qty) => { 
        if (qty < 1) return handleRemoveFromCart(id); 
        setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i)); 
    };
    
    const handleRemoveFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
    
    const handleItemDiscountChange = (id, type, value) => { 
        const numVal = Number(value) || 0; 
        setCart(prev => prev.map(item => item.id === id ? { ...item, discount: { type, value: numVal } } : item)); 
    };
    
    const handleTransactionDiscountChange = (type, value) => { 
        const numVal = Number(value) || 0; 
        setTransactionDiscount({ type, value: numVal }); 
    };
    
    const handleConfirmPayment = async (customerDetails) => {
        if (!employee) {
            setError('Sesi login tidak valid. Silakan login ulang.');
            return;
        }

        setIsSubmitting(true);
        setError(null);
        
        try {
            const { data, error } = await supabase.rpc('create_new_order', { 
                p_kasir_id: employee.id,
                p_cart_items: cart, 
                p_customer_details: customerDetails, 
                p_total_details: totals 
            });
            
            if (error) {
                // Handle RLS error specifically
                if (error.code === 'PGRST301') {
                    throw new Error('Akses ditolak. Silakan refresh halaman atau login ulang.');
                }
                throw error;
            }
            
            if (data.status === 'error') {
                throw new Error(data.message || 'Transaksi gagal');
            }
            
            alert(`Transaksi berhasil! ID: ${data.transaction_id}`);
            setCart([]); 
            setTransactionDiscount({ type: 'fixed', value: 0 }); 
            setIsPaymentModalOpen(false);
        } catch (err) {
            console.error('Transaction error:', err);
            setError(`Transaksi gagal: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetryLoad = () => {
        setError(null);
        window.location.reload();
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <ErrorAlert error={error} onClose={() => setError(null)} />
            <header className="bg-blue-600 text-white p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-bold">POS - Kasir</h1>
                    <span className="text-sm">
                        {employee ? `${employee.name} (${employee.role})` : 'Loading...'}
                    </span>
                </div>
            </header>
            
            {/* Error State with Retry */}
            {error && (
                <div className="m-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {error}</span>
                    <button 
                        onClick={handleRetryLoad}
                        className="mt-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}
            
            <main className="flex-grow p-4 md:flex md:gap-4 overflow-y-hidden">
                <section className={`w-full md:w-2/3 flex flex-col gap-4 ${isMobile && mobileView !== 'products' ? 'hidden' : ''}`}>
                    <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-center sticky top-0 z-10">
                        <select onChange={(e) => setCategoryFilter(e.target.value)} className="p-2 border rounded-md text-sm">
                            <option value="all">Semua Kategori</option>
                            {uniqueCategories.map(cat => <option key={cat} value={cat} className="capitalize">{cat.replace('_', ' ')}</option>)}
                        </select>
                        <select onChange={(e) => setBrandFilter(e.target.value)} className="p-2 border rounded-md text-sm">
                            <option value="all">Semua Merk</option>
                            {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-16">
                        {loading ? (
                            <p className="col-span-full text-center text-gray-500">Memuat produk...</p>
                        ) : (
                            groupedAndFilteredProducts.map(group => (
                                <ProductGroupCard key={group.groupKey} group={group} onAddToCart={handleAddToCart} />
                            ))
                        )}
                    </div>
                </section>
                <Cart 
                    cartItems={cart} 
                    totals={totals} 
                    onQuantityChange={handleQuantityChange} 
                    onRemoveItem={handleRemoveFromCart} 
                    onItemDiscountChange={handleItemDiscountChange} 
                    onTransactionDiscountChange={handleTransactionDiscountChange} 
                    className={`w-full md:w-1/3 ${isMobile && mobileView !== 'cart' ? 'hidden' : ''}`} 
                    isMobile={isMobile} 
                    onCloseCart={() => setMobileView('products')} 
                    onCheckout={() => setIsPaymentModalOpen(true)} 
                />
                {isMobile && (
                    <button 
                        onClick={() => setMobileView(v => v === 'products' ? 'cart' : 'products')} 
                        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg z-20"
                    >
                        {mobileView === 'products' ? (
                            <div className="relative">
                                <span>🛒</span>
                                {cart.length > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {cart.length}
                                    </span>
                                )}
                            </div>
                        ) : '📦'}
                    </button>
                )}
            </main>
            <PaymentModal 
                isOpen={isPaymentModalOpen} 
                onClose={() => setIsPaymentModalOpen(false)} 
                totalAmount={totals.total} 
                onConfirmPayment={handleConfirmPayment} 
                isSubmitting={isSubmitting} 
            />
        </div>
    );
}