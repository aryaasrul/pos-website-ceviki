import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { Link } from 'react-router-dom';

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            const { error } = await signUp({ email, password });
            if (error) throw error;
            setMessage('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100"><div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center">Buat Akun Baru</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div><label htmlFor="email">Email</label><input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 mt-1 border rounded-md" required /></div>
                <div><label htmlFor="password">Password (min. 6 karakter)</label><input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 mt-1 border rounded-md" required minLength="6"/></div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {message && <p className="text-sm text-green-500">{message}</p>}
                <button type="submit" disabled={loading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:bg-gray-400">{loading ? 'Memproses...' : 'Daftar'}</button>
            </form>
            <p className="text-center text-sm">Sudah punya akun? <Link to="/login" className="font-medium text-blue-600">Masuk</Link></p>
        </div></div>
    );
}
