import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import KasirPage from './pages/KasirPage';
import OwnerPage from './pages/OwnerPage';
import AccountPage from './pages/AccountPage';
import TestPage from './pages/TestPage';

// Layout utama aplikasi yang sekarang lebih simpel dan KONSISTEN
function AppLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
        </div>
    );
}

// Komponen untuk redirect berdasarkan role setelah login
function HomeRedirect() {
    const { employee } = useAuth();
    if (!employee) return <Navigate to="/login" />;
    if (employee.role === 'owner' || employee.role === 'kasir_senior') {
        return <Navigate to="/owner" />;
    }
    return <Navigate to="/kasir" />;
}

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Rute Publik */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    
                    {/* Rute yang Dilindungi */}
                    <Route path="/kasir" element={<ProtectedRoute><AppLayout><KasirPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/owner" element={<ProtectedRoute allowedRoles={['owner', 'kasir_senior']}><AppLayout><OwnerPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/account" element={<ProtectedRoute><AppLayout><AccountPage /></AppLayout></ProtectedRoute>} />
                    <Route path="/test" element={<ProtectedRoute><AppLayout><TestPage /></AppLayout></ProtectedRoute>} />
                    
                    {/* Rute default */}
                    <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}
