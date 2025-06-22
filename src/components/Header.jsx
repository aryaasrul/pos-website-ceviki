import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
    const { employee, signOut } = useAuth();
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

    return (
        <header className="bg-white text-gray-800 p-4 flex justify-between items-center shadow-md">
            <h1 className="text-xl font-bold text-blue-600">Toko Elektronik LBJ</h1>
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(prev => !prev)} className="flex items-center gap-2">
                    <span>{employee ? employee.name : 'Memuat...'}</span>
                    {employee && (
                        <span className="text-xs text-gray-500">({employee.role})</span>
                    )}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                        <Link to="/account" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Akun Saya
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}