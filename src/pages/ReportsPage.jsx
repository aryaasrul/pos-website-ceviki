import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Komponen untuk kartu statistik utama
const StatCard = ({ title, value, color = 'text-gray-900' }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
    </div>
);

// Fungsi untuk memformat angka menjadi format Rupiah
const formatCurrency = (number) => `Rp${(number || 0).toLocaleString('id-ID')}`;

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalRevenue: 0, totalProfit: 0, totalTransactions: 0 });
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [dateRange, setDateRange] = useState(30); // Default 30 hari

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);

            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - dateRange);
            
            // 1. Fetch data untuk grafik tren penjualan
            const { data: sales, error: salesError } = await supabase
                .from('v_sales_over_time')
                .select('*')
                .gte('report_date', fromDate.toISOString());

            // 2. Fetch data produk terlaris
            const { data: products, error: productsError } = await supabase
                .from('v_top_selling_products')
                .select('*')
                .limit(5);

            // 3. Fetch data performa kategori
            const { data: categories, error: categoriesError } = await supabase
                .from('v_category_performance')
                .select('*')
                .limit(5);

            if (salesError || productsError || categoriesError) {
                console.error("Error fetching reports:", salesError || productsError || categoriesError);
                setLoading(false);
                return;
            }

            // Proses data penjualan untuk summary dan chart
            if (sales) {
                const totalRevenue = sales.reduce((acc, cur) => acc + cur.total_revenue, 0);
                const totalProfit = sales.reduce((acc, cur) => acc + cur.total_profit, 0);
                const totalTransactions = sales.reduce((acc, cur) => acc + cur.transaction_count, 0);
                setStats({ totalRevenue, totalProfit, totalTransactions });

                const formattedSales = sales.map(d => ({
                    ...d,
                    report_date: new Date(d.report_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
                }));
                setSalesData(formattedSales);
            }
            
            setTopProducts(products || []);
            setCategoryData(categories || []);
            setLoading(false);
        };

        fetchReports();
    }, [dateRange]);

    if (loading) {
        return <div className="text-center p-10">Memuat laporan...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header Laporan dan Filter Tanggal */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Laporan & Analitik</h2>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Periode:</span>
                    <select value={dateRange} onChange={e => setDateRange(Number(e.target.value))} className="p-2 border rounded-md bg-white text-sm">
                        <option value={7}>7 Hari Terakhir</option>
                        <option value={30}>30 Hari Terakhir</option>
                        <option value={90}>90 Hari Terakhir</option>
                    </select>
                </div>
            </div>

            {/* Kartu Statistik Utama */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Pendapatan" value={formatCurrency(stats.totalRevenue)} color="text-blue-600" />
                <StatCard title="Total Keuntungan" value={formatCurrency(stats.totalProfit)} color="text-green-600" />
                <StatCard title="Total Transaksi" value={stats.totalTransactions.toLocaleString('id-ID')} />
            </div>

            {/* Grafik Tren Penjualan */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-lg mb-4">Tren Penjualan & Keuntungan</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="report_date" />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="total_revenue" name="Pendapatan" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="total_profit" name="Keuntungan" stroke="#16a34a" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Tabel Produk Terlaris & Performa Kategori */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-4">5 Produk Terlaris (by Pendapatan)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-2">Produk</th>
                                    <th className="p-2 text-right">Terjual</th>
                                    <th className="p-2 text-right">Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map(p => (
                                    <tr key={p.product_id} className="border-b">
                                        <td className="p-2">{p.name}</td>
                                        <td className="p-2 text-right">{p.quantity_sold}</td>
                                        <td className="p-2 text-right font-medium">{formatCurrency(p.total_revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-4">Performa Kategori (by Pendapatan)</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-2">Kategori</th>
                                    <th className="p-2 text-right">Terjual</th>
                                    <th className="p-2 text-right">Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryData.map(c => (
                                    <tr key={c.category} className="border-b">
                                        <td className="p-2 capitalize">{c.category.replace('_', ' ')}</td>
                                        <td className="p-2 text-right">{c.quantity_sold}</td>
                                        <td className="p-2 text-right font-medium">{formatCurrency(c.total_revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

