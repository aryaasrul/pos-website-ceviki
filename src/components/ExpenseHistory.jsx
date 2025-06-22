import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function ExpenseHistory({ employee }) {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            if (!employee) return;

            setLoading(true);
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('created_by', employee.id)
                .order('date', { ascending: false })
                .limit(5);

            if (error) {
                console.error("Error fetching expenses:", error);
            } else {
                setExpenses(data);
            }
            setLoading(false);
        };

        fetchExpenses();
    }, [employee]); // Re-fetch jika employee berubah

    if (loading) {
        return <p className="text-center text-gray-500">Memuat riwayat...</p>;
    }

    if (expenses.length === 0) {
        return <p className="text-center text-gray-500">Belum ada pengeluaran yang dicatat.</p>;
    }

    return (
        <div className="space-y-3">
            {expenses.map(expense => (
                <div key={expense.id} className="p-3 bg-gray-50 rounded-md border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <span className="font-semibold text-sm">{expense.name}</span>
                        <span className="text-sm font-bold text-red-600">
                            -Rp{expense.amount.toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        <span>{new Date(expense.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="mx-1">•</span>
                        <span>{expense.category}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
