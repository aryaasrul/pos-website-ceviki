import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { supabase } from '../lib/supabaseClient';
import AddExpenseForm from '../components/AddExpenseForm'; // Impor komponen baru
import ExpenseHistory from '../components/ExpenseHistory'; // Impor komponen baru

export default function AccountPage() {
    const { user, employee, signOut } = useAuth();
    const [name, setName] = useState(employee?.name || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [key, setKey] = useState(0); // Kunci untuk me-refresh riwayat

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const { error } = await supabase.from('employees').update({ name }).eq('id', employee.id);
        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Profil berhasil diperbarui!');
        }
        setLoading(false);
    };

    const handleExpenseAdded = () => {
        // Mengubah kunci untuk memicu re-fetch data di ExpenseHistory
        setKey(prevKey => prevKey + 1);
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Akun Saya</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kolom Kiri: Profil & Form Pengeluaran */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bagian Profil */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Profil Pengguna</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="text" value={user?.email || ''} disabled className="w-full p-2 mt-1 border rounded-md bg-gray-100 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 mt-1 border rounded-md" />
                            </div>
                            {message && <p className="text-sm text-green-600">{message}</p>}
                            <div className="text-right">
                                <button type="submit" disabled={loading} className="py-2 px-5 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                                    {loading ? 'Menyimpan...' : 'Perbarui Profil'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Bagian Catat Pengeluaran */}
                    <div className="bg-white p-6 rounded-lg shadow">
                         <h2 className="text-xl font-semibold mb-4 border-b pb-2">Catat Pengeluaran Baru</h2>
                        <AddExpenseForm employee={employee} onExpenseAdded={handleExpenseAdded} />
                    </div>
                </div>

                {/* Kolom Kanan: Riwayat Pengeluaran */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Riwayat Pengeluaran</h2>
                        <ExpenseHistory employee={employee} key={key} />
                    </div>
                </div>
            </div>
        </div>
    );
}
