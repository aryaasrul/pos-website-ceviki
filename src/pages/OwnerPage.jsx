import React, { useState } from 'react';
import DashboardPage from './DashboardPage';
import TransactionHistoryPage from './TransactionHistoryPage';
import ManageProductsPage from './ManageProductsPage';
import ManageEmployeesPage from './ManageEmployeesPage';
import ReportsPage from './ReportsPage'; // Impor halaman baru

const HamburgerButton = ({ onClick }) => ( <button onClick={onClick} className="md:hidden p-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button> );

export default function OwnerPage() {
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleNavClick = (view) => { setActiveView(view); setIsSidebarOpen(false); };

    const NavLink = ({ view, icon, children }) => (
        <button onClick={() => handleNavClick(view)} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md flex items-center gap-3 transition-colors ${ activeView === view ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100' }`}>
            {icon}
            <span>{children}</span>
        </button>
    );

    const SidebarContent = () => (
         <nav className="flex flex-col gap-1">
            <NavLink view="dashboard" icon={<span className="text-lg">🏠</span>}>Dashboard</NavLink>
            {/* PENAMBAHAN FITUR: Link ke halaman Laporan */}
            <NavLink view="reports" icon={<span className="text-lg">📊</span>}>Laporan</NavLink>
            <NavLink view="transactions" icon={<span className="text-lg">🧾</span>}>Riwayat Transaksi</NavLink>
            <NavLink view="products" icon={<span className="text-lg">📦</span>}>Kelola Produk</NavLink>
            <NavLink view="employees" icon={<span className="text-lg">👥</span>}>Kelola Karyawan</NavLink>
        </nav>
    );

    return (
        <div className="md:flex">
            <aside className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r p-4 z-20 transform transition-transform md:relative md:top-0 md:h-screen md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">Menu Owner</h2>
                <SidebarContent />
            </aside>
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"></div>}
            
            <main className="flex-grow p-4 md:p-6 bg-gray-50">
                <div className="flex items-center gap-2 md:hidden mb-4">
                    <HamburgerButton onClick={() => setIsSidebarOpen(true)} />
                    <h1 className="text-lg font-bold capitalize">{activeView.replace('_', ' ')}</h1>
                </div>

                {activeView === 'dashboard' && <DashboardPage />}
                {/* PENAMBAHAN FITUR: Render konten halaman Laporan */}
                {activeView === 'reports' && <ReportsPage />}
                {activeView === 'transactions' && <TransactionHistoryPage />}
                {activeView === 'products' && <ManageProductsPage />}
                {activeView === 'employees' && <ManageEmployeesPage />}
            </main>
        </div>
    );
}
