import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TransactionHistoryPage() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('v_transactions_summary')
                .select('*');

            if (error) {
                console.error("Error fetching transactions:", error);
                alert(`Gagal mengambil data transaksi: ${error.message}`);
            } else {
                setTransactions(data);
            }
            setLoading(false);
        };
        fetchTransactions();
    }, []);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Riwayat Transaksi</h2>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="text-left p-3 font-semibold text-sm">ID Transaksi</th>
                            <th className="text-left p-3 font-semibold text-sm">Tanggal</th>
                            <th className="text-left p-3 font-semibold text-sm">Pelanggan</th>
                            <th className="text-left p-3 font-semibold text-sm">Kasir</th>
                            <th className="text-right p-3 font-semibold text-sm">Total Item</th>
                            <th className="text-right p-3 font-semibold text-sm">Total Akhir</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center p-4">Memuat data...</td></tr>
                        ) : (
                            transactions.map(trx => (
                                <tr key={trx.transaction_id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 text-sm">{trx.transaction_id}</td>
                                    <td className="p-3 text-sm">{new Date(trx.transaction_date).toLocaleString('id-ID')}</td>
                                    <td className="p-3 text-sm">{trx.customer_name || '-'}</td>
                                    <td className="p-3 text-sm">{trx.cashier_name}</td>
                                    <td className="p-3 text-sm text-right">{trx.total_items}</td>
                                    <td className="p-3 text-sm text-right font-semibold">Rp{trx.net_total.toLocaleString('id-ID')}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                 { !loading && transactions.length === 0 && (
                    <p className="text-center p-4">Belum ada transaksi.</p>
                )}
            </div>
        </div>
    );
}
