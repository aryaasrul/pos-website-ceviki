import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
    const { user, employee, loading, error } = useAuth();

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
                        onClick={() => window.location.href = '/login'} 
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Kembali ke Login
                    </button>
                </div>
            </div>
        );
    }

    // Tunggu sampai data employee loaded
    if (!employee) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Memuat data karyawan...</p>
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

