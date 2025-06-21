import React, { useState } from 'react';
import KasirPage from './pages/KasirPage';
import OwnerPage from './pages/OwnerPage'; // Pastikan OwnerPage diimpor

export default function App() {
  const [activePage, setActivePage] = useState('kasir');

  const NavButton = ({ page, children }) => (
    <button
      onClick={() => setActivePage(page)}
      className={`px-4 py-2 text-sm font-medium rounded-md ${
        activePage === page 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-2 flex justify-center items-center gap-2 flex-wrap">
        <span className="text-sm font-bold mr-4">DEV-MODE Navigation:</span>
        <NavButton page="kasir">Halaman Kasir</NavButton>
        <NavButton page="owner">Halaman Owner</NavButton>
      </nav>

      <div className="flex-grow overflow-y-auto">
        {activePage === 'kasir' && <KasirPage />}
        {/* [FIX] Mengganti placeholder dengan komponen OwnerPage yang asli */}
        {activePage === 'owner' && <OwnerPage />}
      </div>
    </div>
  );
}
