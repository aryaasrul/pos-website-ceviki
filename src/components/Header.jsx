import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { Link, useNavigate, NavLink } from 'react-router-dom';

// Komponen Ikon
const UserIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> );
const LogoutIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-600"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> );
const MenuIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg> );
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );

export default function Header() {
    const { employee, signOut } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);
    
    // Mencegah body scroll saat menu mobile terbuka
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => { document.body.style.overflow = 'auto'; };
    }, [isMobileMenuOpen]);

    const mobileActiveLinkStyle = "bg-blue-50 text-blue-600";
    const mobileInactiveLinkStyle = "text-gray-700 hover:bg-gray-50 hover:text-gray-900";

    return (
        <>
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Kiri: Tombol Menu Mobile & Nama Toko */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="md:hidden mr-4 p-2 rounded-md text-gray-500 hover:bg-gray-100"
                                aria-label="Buka menu"
                            >
                                <MenuIcon />
                            </button>
                            <Link to="/" className="text-xl font-bold text-gray-800 hover:text-blue-600">
                                Toko LBJ
                            </Link>
                        </div>

                        {/* Tengah: Navigasi Desktop */}
                        <nav className="hidden md:flex md:items-center md:space-x-8">
                            <NavLink to="/kasir" className="text-gray-600 hover:text-blue-600 font-medium px-1 py-2 text-sm border-b-2 border-transparent transition-colors" style={({ isActive }) => isActive ? {color: '#2563EB', borderColor: '#2563EB'} : undefined}>
                                Kasir
                            </NavLink>
                            {(employee?.role === 'owner' || employee?.role === 'kasir_senior') && (
                                <NavLink to="/owner" className="text-gray-600 hover:text-blue-600 font-medium px-1 py-2 text-sm border-b-2 border-transparent transition-colors" style={({ isActive }) => isActive ? {color: '#2563EB', borderColor: '#2563EB'} : undefined}>
                                    Owner Dashboard
                                </NavLink>
                            )}
                        </nav>

                        {/* Kanan: Profil Pengguna */}
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setIsDropdownOpen(prev => !prev)} className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                <span className="font-medium text-sm text-gray-700 hidden sm:block">{employee?.name}</span>
                                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                    {employee?.name?.charAt(0).toUpperCase() || '?'}
                                </div>
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-40">
                                    <div className="px-4 py-3"><p className="text-sm font-semibold text-gray-900">{employee?.name}</p><p className="text-xs text-gray-500 capitalize">{employee?.role?.replace('_', ' ')}</p></div>
                                    <div className="border-t border-gray-100"></div>
                                    <Link to="/account" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><UserIcon /><span>Akun Saya</span></Link>
                                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"><LogoutIcon /><span>Logout</span></button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Menu Mobile Overlay */}
            <div className={`fixed inset-0 z-40 flex md:hidden transition-opacity duration-300 ease-in-out ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}></div>
                <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="absolute top-0 right-0 -mr-14 p-1">
                        <button onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center h-12 w-12 rounded-full focus:outline-none text-white"><CloseIcon /></button>
                    </div>
                    <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                        <div className="flex-shrink-0 flex items-center px-4">
                             <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-gray-800">Toko LBJ</Link>
                        </div>
                        <nav className="mt-8 px-2 space-y-1">
                             <NavLink to="/kasir" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `${isActive ? mobileActiveLinkStyle : mobileInactiveLinkStyle} group flex items-center px-2 py-2 text-base font-medium rounded-md`}>Kasir</NavLink>
                             {(employee?.role === 'owner' || employee?.role === 'kasir_senior') && (
                                <NavLink to="/owner" onClick={() => setIsMobileMenuOpen(false)} className={({isActive}) => `${isActive ? mobileActiveLinkStyle : mobileInactiveLinkStyle} group flex items-center px-2 py-2 text-base font-medium rounded-md`}>Owner Dashboard</NavLink>
                             )}
                        </nav>
                    </div>
                </div>
                <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
            </div>
        </>
    );
}
