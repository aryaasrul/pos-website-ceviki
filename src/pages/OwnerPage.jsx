import React, { useState } from 'react';
import DashboardPage from './DashboardPage';
import TransactionHistoryPage from './TransactionHistoryPage';
import ManageProductsPage from './ManageProductsPage';
import ManageEmployeesPage from './ManageEmployeesPage'; // Impor halaman baru

const HamburgerButton = ({ onClick }) => ( <button onClick={onClick} className="md:hidden p-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button> );

export default function OwnerPage() {
    const [activeView, setActiveView] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleNavClick = (view) => { setActiveView(view); setIsSidebarOpen(false); };

    const NavLink = ({ view, children }) => (<button onClick={() => handleNavClick(view)} className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md flex items-center gap-3 ${ activeView === view ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100' }`}>{children}</button>);

    const SidebarContent = () => (
         <nav className="flex flex-col gap-2">
            <NavLink view="dashboard">📊 Dashboard</NavLink>
            <NavLink view="transactions">📈 Riwayat Transaksi</NavLink>
            <NavLink view="products">📦 Kelola Produk</NavLink>
            <NavLink view="employees">👥 Kelola Karyawan</NavLink> {/* Link baru */}
        </nav>
    );

    return (
        <div className="relative md:flex min-h-screen">
            <div className="bg-white border-b p-2 flex justify-between items-center md:hidden"><HamburgerButton onClick={() => setIsSidebarOpen(true)} /><h1 className="text-lg font-bold capitalize">{activeView.replace('_', ' ')}</h1></div>
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"></div>}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r p-4 z-20 transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}><h2 className="text-xl font-bold mb-4">Toko LBJ</h2><SidebarContent /></aside>
            <main className="flex-grow p-4 md:p-8 bg-gray-50">
                {activeView === 'dashboard' && <DashboardPage />}
                {activeView === 'transactions' && <TransactionHistoryPage />}
                {activeView === 'products' && <ManageProductsPage />}
                {activeView === 'employees' && <ManageEmployeesPage />} {/* View baru */}
            </main>
        </div>
    );
}
