import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TransactionHistoryPage() {
    const [transactions, setTransactions] = useState([]);
    const [expandedTx, setExpandedTx] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            
            // Fetch transaction summary
            const { data: txData, error: txError } = await supabase
                .from('v_transactions_summary')
                .select('*')
                .order('transaction_date', { ascending: false });

            if (txError) {
                console.error("Error fetching transactions:", txError);
                alert(`Gagal mengambil data transaksi: ${txError.message}`);
            } else {
                setTransactions(txData || []);
            }
            
            setLoading(false);
        };
        
        fetchTransactions();
    }, []);

    const fetchTransactionDetails = async (transactionId) => {
        const { data, error } = await supabase
            .from('orders')
            .select('*, products(name)')
            .eq('transaction_id', transactionId);
        
        if (!error && data) {
            setExpandedTx(prev => ({
                ...prev,
                [transactionId]: data
            }));
        }
    };

    const toggleExpand = (transactionId) => {
        if (expandedTx[transactionId]) {
            setExpandedTx(prev => {
                const newState = { ...prev };
                delete newState[transactionId];
                return newState;
            });
        } else {
            fetchTransactionDetails(transactionId);
        }
    };

    const calculateTransactionTotals = (items) => {
        let subtotal = 0;
        let totalDiscount = 0;
        
        items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const itemDiscount = item.discount_amount * item.quantity;
            subtotal += itemTotal;
            totalDiscount += itemDiscount;
        });
        
        return {
            subtotal,
            totalDiscount,
            grandTotal: subtotal - totalDiscount
        };
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Riwayat Transaksi</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-3 font-semibold text-sm">ID Transaksi</th>
                                <th className="text-left p-3 font-semibold text-sm">Tanggal</th>
                                <th className="text-left p-3 font-semibold text-sm">Pelanggan</th>
                                <th className="text-left p-3 font-semibold text-sm">Kasir</th>
                                <th className="text-right p-3 font-semibold text-sm">Items</th>
                                <th className="text-right p-3 font-semibold text-sm">Total</th>
                                <th className="text-center p-3 font-semibold text-sm">Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center p-4">Memuat data...</td>
                                </tr>
                            ) : (
                                transactions.map(trx => (
                                    <React.Fragment key={trx.transaction_id}>
                                        <tr className="border-b hover:bg-gray-50">
                                            <td className="p-3 text-sm font-mono">{trx.transaction_id}</td>
                                            <td className="p-3 text-sm">
                                                {new Date(trx.transaction_date).toLocaleString('id-ID')}
                                            </td>
                                            <td className="p-3 text-sm">{trx.customer_name || '-'}</td>
                                            <td className="p-3 text-sm">{trx.cashier_name}</td>
                                            <td className="p-3 text-sm text-right">{trx.total_items}</td>
                                            <td className="p-3 text-sm text-right font-semibold">
                                                Rp{trx.net_total.toLocaleString('id-ID')}
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => toggleExpand(trx.transaction_id)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    {expandedTx[trx.transaction_id] ? 'Tutup' : 'Lihat'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedTx[trx.transaction_id] && (
                                            <tr>
                                                <td colSpan="7" className="bg-gray-50 p-4">
                                                    <div className="space-y-2">
                                                        <h4 className="font-semibold text-sm">Detail Items:</h4>
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="border-b">
                                                                    <th className="text-left py-1">Produk</th>
                                                                    <th className="text-right py-1">Qty</th>
                                                                    <th className="text-right py-1">Harga</th>
                                                                    <th className="text-right py-1">Diskon</th>
                                                                    <th className="text-right py-1">Subtotal</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {expandedTx[trx.transaction_id].map((item, idx) => {
                                                                    const subtotal = item.price * item.quantity;
                                                                    const discount = item.discount_amount * item.quantity;
                                                                    const total = subtotal - discount;
                                                                    
                                                                    return (
                                                                        <tr key={idx} className="border-b">
                                                                            <td className="py-1">{item.name}</td>
                                                                            <td className="text-right py-1">{item.quantity}</td>
                                                                            <td className="text-right py-1">
                                                                                Rp{item.price.toLocaleString('id-ID')}
                                                                            </td>
                                                                            <td className="text-right py-1 text-red-600">
                                                                                {discount > 0 ? `- Rp${discount.toLocaleString('id-ID')}` : '-'}
                                                                            </td>
                                                                            <td className="text-right py-1 font-medium">
                                                                                Rp{total.toLocaleString('id-ID')}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                            <tfoot>
                                                                {(() => {
                                                                    const totals = calculateTransactionTotals(
                                                                        expandedTx[trx.transaction_id]
                                                                    );
                                                                    return (
                                                                        <>
                                                                            {totals.totalDiscount > 0 && (
                                                                                <>
                                                                                    <tr>
                                                                                        <td colSpan="4" className="text-right py-1">
                                                                                            Subtotal:
                                                                                        </td>
                                                                                        <td className="text-right py-1">
                                                                                            Rp{totals.subtotal.toLocaleString('id-ID')}
                                                                                        </td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td colSpan="4" className="text-right py-1 text-red-600">
                                                                                            Total Diskon:
                                                                                        </td>
                                                                                        <td className="text-right py-1 text-red-600">
                                                                                            - Rp{totals.totalDiscount.toLocaleString('id-ID')}
                                                                                        </td>
                                                                                    </tr>
                                                                                </>
                                                                            )}
                                                                            <tr className="font-bold">
                                                                                <td colSpan="4" className="text-right py-2">
                                                                                    Grand Total:
                                                                                </td>
                                                                                <td className="text-right py-2 text-lg">
                                                                                    Rp{totals.grandTotal.toLocaleString('id-ID')}
                                                                                </td>
                                                                            </tr>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </tfoot>
                                                        </table>
                                                        <div className="mt-2 text-xs text-gray-600">
                                                            <p>Metode Pembayaran: {expandedTx[trx.transaction_id][0]?.payment_method || 'cash'}</p>
                                                            {expandedTx[trx.transaction_id][0]?.customer_phone && (
                                                                <p>No. HP: {expandedTx[trx.transaction_id][0].customer_phone}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && transactions.length === 0 && (
                    <p className="text-center p-4 text-gray-500">Belum ada transaksi.</p>
                )}
            </div>
        </div>
    );
}