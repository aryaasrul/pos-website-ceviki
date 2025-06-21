import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { supabase } from '../lib/supabaseClient';

export default function AccountPage() {
    const { user, employee } = useAuth();
    const [name, setName] = useState(employee?.name || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const { error } = await supabase.from('employees').update({ name }).eq('id', employee.id);
        if (error) setMessage(`Error: ${error.message}`);
        else setMessage('Profil berhasil diperbarui!');
        setLoading(false);
    };

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-4">Akun Saya</h1>
            <div className="max-w-lg bg-white p-6 rounded-lg shadow">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div><label className="block text-sm font-medium">Email</label><input type="text" value={user?.email || ''} disabled className="w-full p-2 mt-1 border rounded-md bg-gray-100" /></div>
                    <div><label className="block text-sm font-medium">Nama Lengkap</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 mt-1 border rounded-md" /></div>
                    {message && <p className="text-sm text-green-600">{message}</p>}
                    <button type="submit" disabled={loading} className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md disabled:bg-gray-400">{loading ? 'Menyimpan...' : 'Perbarui Profil'}</button>
                </form>
            </div>
        </div>
    );
}
