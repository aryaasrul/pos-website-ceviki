import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const { error } = await signIn({ email, password });
            if (error) {
                // Translate error messages to Indonesian
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error('Email atau password salah');
                } else if (error.message.includes('Email not confirmed')) {
                    throw new Error('Email belum diverifikasi. Cek inbox email Anda.');
                } else {
                    throw error;
                }
            }
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">Selamat Datang</h1>
                <p className="text-center text-gray-600">Silakan masuk</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email">Email</label>
                        <input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            required 
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password" 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full p-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                            required 
                            disabled={loading}
                        />
                    </div>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>
                <p className="text-center text-sm">
                    Belum punya akun? <Link to="/signup" className="font-medium text-blue-600 hover:underline">Daftar</Link>
                </p>
            </div>
        </div>
    );
}