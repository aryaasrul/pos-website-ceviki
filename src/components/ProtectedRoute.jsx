import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, employee, loading, error, refreshEmployee } = useAuth();

    // Auto refresh employee data jika ada error RLS
    useEffect(() => {
        if (user && !employee && !loading && !error) {
            refreshEmployee();
        }
    }, [user, employee, loading, error, refreshEmployee]);

    // Tampilkan loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect ke login jika belum authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Jika ada error auth context (misal: user tidak aktif)
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                    </div>
                    <button 
                        onClick={() => {
                            localStorage.clear();
                            sessionStorage.clear();
                            window.location.href = '/login';
                        }} 
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Kembali ke Login
                    </button>
                </div>
            </div>
        );
    }

    // Tunggu sampai data employee loaded (dengan timeout)
    if (!employee) {
        const [waitTime, setWaitTime] = React.useState(0);
        
        React.useEffect(() => {
            const timer = setInterval(() => {
                setWaitTime(prev => prev + 1);
            }, 1000);
            
            return () => clearInterval(timer);
        }, []);
        
        // Jika sudah tunggu 5 detik, tampilkan option untuk skip
        if (waitTime > 5) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center max-w-md">
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                            <p className="font-bold">Loading Terlalu Lama</p>
                            <p className="text-sm">Kemungkinan ada masalah dengan koneksi atau permission.</p>
                        </div>
                        <button 
                            onClick={() => refreshEmployee()}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
                        >
                            Coba Lagi
                        </button>
                        <button 
                            onClick={() => {
                                // Force proceed dengan data minimal
                                window.location.reload();
                            }}
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                        >
                            Reload Halaman
                        </button>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Memuat data karyawan...</p>
                    <button 
                        onClick={() => refreshEmployee()}
                        className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>
        );
    }

    // Cek role jika ada pembatasan
    if (allowedRoles.length > 0 && !allowedRoles.includes(employee.role)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                        <p className="font-bold">Akses Ditolak</p>
                        <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
                        <p className="text-sm mt-2">Role Anda: {employee.role}</p>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/'} 
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    // Render children jika semua validasi passed
    return children;
}