import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const StatCard = ({ title, value, unit = '', color = 'text-gray-900' }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className={`mt-2 text-3xl font-bold ${color}`}>
            {unit}{typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </p>
    </div>
);

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [profit, setProfit] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            
            // Fetch basic stats
            const { data: statsData, error: statsError } = await supabase
                .from('v_dashboard_stats')
                .select('*')
                .single();

            if (statsError) {
                console.error("Error fetching dashboard stats:", statsError);
            } else {
                setStats(statsData);
            }

            // Calculate profit for today
            const { data: profitData, error: profitError } = await supabase
                .from('orders')
                .select('quantity, price, discount_amount, hpp_at_sale')
                .gte('date', new Date().toISOString().split('T')[0])
                .eq('status', 'completed');

            if (!profitError && profitData) {
                let totalRevenue = 0;
                let totalCost = 0;
                
                profitData.forEach(order => {
                    const revenue = (order.price * order.quantity) - (order.discount_amount * order.quantity);
                    const cost = (order.hpp_at_sale || 0) * order.quantity;
                    
                    totalRevenue += revenue;
                    totalCost += cost;
                });
                
                const totalProfit = totalRevenue - totalCost;
                const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
                
                setProfit({
                    total: totalProfit,
                    margin: profitMargin
                });
            }
            
            setLoading(false);
        };
        
        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="p-8">Memuat statistik...</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Dashboard Hari Ini</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <StatCard 
                    title="Total Penjualan" 
                    value={stats?.total_penjualan_hari_ini || 0} 
                    unit="Rp " 
                />
                <StatCard 
                    title="Keuntungan" 
                    value={profit?.total || 0} 
                    unit="Rp " 
                    color={profit?.total > 0 ? 'text-green-600' : 'text-red-600'}
                />
                <StatCard 
                    title="Margin Profit" 
                    value={profit?.margin?.toFixed(1) || 0} 
                    unit="" 
                    color="text-blue-600"
                />
                <StatCard 
                    title="Jumlah Transaksi" 
                    value={stats?.total_transaksi_hari_ini || 0} 
                />
                <StatCard 
                    title="Stok Menipis" 
                    value={stats?.stok_menipis || 0} 
                    color="text-orange-600"
                />
            </div>
        </div>
    );
}
