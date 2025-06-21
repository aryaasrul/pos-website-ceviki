import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Komponen kecil untuk setiap kartu statistik
const StatCard = ({ title, value, unit = '' }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">
            {unit}{typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        </p>
    </div>
);

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('v_dashboard_stats')
                .select('*')
                .single(); // Kita hanya mengharapkan satu baris data statistik

            if (error) {
                console.error("Error fetching dashboard stats:", error);
                alert(`Gagal mengambil data statistik: ${error.message}`);
            } else {
                setStats(data);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="p-8">Memuat statistik...</div>;
    }

    if (!stats) {
        return <div className="p-8">Gagal memuat data statistik.</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Dashboard Hari Ini</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Penjualan" value={stats.total_penjualan_hari_ini} unit="Rp " />
                <StatCard title="Jumlah Transaksi" value={stats.total_transaksi_hari_ini} />
                <StatCard title="Produk Terjual" value={stats.produk_terjual_hari_ini} />
                <StatCard title="Stok Menipis (< 3)" value={stats.stok_menipis} />
            </div>
        </div>
    );
}
