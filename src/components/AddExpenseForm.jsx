import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { supabase } from '../lib/supabaseClient';

export default function AddExpenseForm({ onExpenseAdded }) {
    const { employee } = useAuth();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Operasional');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default tanggal hari ini
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !amount) {
            setMessage('Nama pengeluaran dan jumlah wajib diisi.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const { error } = await supabase.from('expenses').insert([{
                name,
                amount: parseFloat(amount),
                category,
                notes,
                date,
                created_by: employee.id
            }]);

            if (error) throw error;

            setMessage('Pengeluaran berhasil dicatat!');
            // Reset form
            setName('');
            setAmount('');
            setCategory('Operasional');
            setNotes('');
            setDate(new Date().toISOString().split('T')[0]);
            
            // Beritahu parent component untuk refresh riwayat
            if (onExpenseAdded) onExpenseAdded();

        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nama Pengeluaran</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Beli Galon Air" className="w-full p-2 mt-1 border rounded-md" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Jumlah (Rp)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="50000" className="w-full p-2 mt-1 border rounded-md" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 mt-1 border rounded-md" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Kategori</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 mt-1 border rounded-md bg-white">
                    <option>Operasional</option>
                    <option>Transportasi</option>
                    <option>Makan</option>
                    <option>ATK</option>
                    <option>Lainnya</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="3" placeholder="Catatan tambahan..." className="w-full p-2 mt-1 border rounded-md"></textarea>
            </div>
            {message && <p className="text-sm text-center py-2 bg-green-50 text-green-700 rounded-md">{message}</p>}
            <div className="text-right">
                <button type="submit" disabled={loading} className="py-2 px-5 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400">
                    {loading ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                </button>
            </div>
        </form>
    );
}
