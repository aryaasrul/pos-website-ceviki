import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import KasirPage from './pages/KasirPage';
import OwnerPage from './pages/OwnerPage';
import AccountPage from './pages/AccountPage';
import TestPage from './pages/TestPage';


// Layout dengan navigasi sederhana untuk development
function AppLayout({ children }) {
    const { employee, signOut } = useAuth();
    
    if (!employee) return <>{children}</>;
    
    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Development Navigation Bar */}
            <nav className="bg-white shadow-md p-2 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold">
                        {employee.name} ({employee.role})
                    </span>
                    
                    {/* Navigation Links berdasarkan role */}
                    <div className="flex gap-2">
                        <a 
                            href="/kasir" 
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Kasir
                        </a>
                        
                        {(employee.role === 'owner' || employee.role === 'kasir_senior') && (
                            <a 
                                href="/owner" 
                                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                                Owner/Admin
                            </a>
                        )}
                        
                        <a 
                            href="/account" 
                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                        >
                            Akun
                        </a>
                    </div>
                </div>
                
                <button 
                    onClick={() => signOut().then(() => window.location.href = '/login')}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Logout
                </button>
            </nav>
            
            <div className="flex-grow overflow-y-auto">
                {children}
            </div>
        </div>
    );
}

// Komponen untuk redirect berdasarkan role
function HomeRedirect() {
    const { employee } = useAuth();
    
    if (!employee) return <Navigate to="/login" />;
    
    // Redirect berdasarkan role
    if (employee.role === 'owner') {
        return <Navigate to="/owner" />;
    }
    
    // Default redirect ke kasir
    return <Navigate to="/kasir" />;
}

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    
                    {/* Protected Routes - Kasir (semua role bisa akses) */}
                    <Route path="/kasir" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <KasirPage />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    
                    {/* Protected Routes - Owner/Admin only */}
                    <Route path="/owner" element={
                        <ProtectedRoute allowedRoles={['owner', 'kasir_senior']}>
                            <AppLayout>
                                <OwnerPage />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    
                    {/* Protected Routes - Account (semua role bisa akses) */}
                    <Route path="/account" element={
                        <ProtectedRoute>
                            <AppLayout>
                                <AccountPage />
                            </AppLayout>
                        </ProtectedRoute>
                    } />
                    
                    {/* Default Route - redirect berdasarkan role */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <HomeRedirect />
                        </ProtectedRoute>
                    } />
                    
                    {/* 404 Route */}
                    <Route path="*" element={<Navigate to="/" />} />
                    <Route path="/test" element={
    <ProtectedRoute>
        <AppLayout>
            <TestPage />
        </AppLayout>
    </ProtectedRoute>
} />
                
                
                </Routes>
            </AuthProvider>
        </Router>
    );
}