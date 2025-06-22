import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function EditEmployeeModal({ isOpen, onClose, employee, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        active: true,
        pin: '',
        newPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('basic'); // basic, security, stats

    useEffect(() => {
        if (employee) {
            setFormData({
                name: employee.name,
                email: employee.email || employee.username,
                role: employee.role,
                active: employee.active,
                pin: '', // Don't show existing PIN
                newPassword: ''
            });
            setActiveTab('basic');
        }
    }, [employee]);

    if (!isOpen || !employee) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        
        try {
            // Update employee basic data
            const updates = {
                name: formData.name,
                role: formData.role,
                active: formData.active
            };
            
            // Update PIN if provided
            if (formData.pin) {
                if (formData.pin.length !== 6) {
                    alert('PIN harus 6 digit');
                    setIsSubmitting(false);
                    return;
                }
                updates.pin = formData.pin;
            }
            
            await onSave(employee.id, updates);
            
            // Update auth email if changed
            if (formData.email !== employee.email && employee.user_id) {
                const { error: emailError } = await supabase.auth.admin.updateUserById(
                    employee.user_id,
                    { email: formData.email }
                );
                
                if (emailError) {
                    console.error('Email update error:', emailError);
                    alert('Email berhasil diupdate di database, tapi perlu update manual di Auth Dashboard');
                }
            }
            
            // Update password if provided
            if (formData.newPassword && employee.user_id) {
                if (formData.newPassword.length < 6) {
                    alert('Password minimal 6 karakter');
                    setIsSubmitting(false);
                    return;
                }
                
                // Note: This requires admin API
                alert('Password perlu diupdate manual via Supabase Auth Dashboard');
            }
            
            setIsSubmitting(false);
            onClose();
        } catch (error) {
            alert(`Error: ${error.message}`);
            setIsSubmitting(false);
        }
    };

    const TabButton = ({ tab, children }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
                activeTab === tab
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                {/* Header */}
                <div className="p-6 pb-0">
                    <h3 className="text-xl font-bold mb-1">Edit Karyawan</h3>
                    <p className="text-gray-600 mb-4">{employee.name}</p>
                    
                    {/* Tabs */}
                    <div className="flex gap-2 border-b">
                        <TabButton tab="basic">Data Dasar</TabButton>
                        <TabButton tab="security">Keamanan</TabButton>
                        <TabButton tab="stats">Statistik</TabButton>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'basic' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Perubahan email perlu konfirmasi via email
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                                >
                                    <option value="kasir">Kasir</option>
                                    <option value="kasir_senior">Kasir Senior</option>
                                    <option value="owner">Owner</option>
                                </select>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="active-checkbox"
                                    name="active"
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                                <label htmlFor="active-checkbox" className="ml-2 block text-sm text-gray-900">
                                    Akun Aktif
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    PIN Baru (6 digit)
                                </label>
                                <input
                                    type="text"
                                    name="pin"
                                    value={formData.pin}
                                    onChange={handleChange}
                                    maxLength="6"
                                    pattern="[0-9]{6}"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="Kosongkan jika tidak ingin mengubah"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password Baru
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                                        placeholder="Kosongkan jika tidak ingin mengubah"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Minimal 6 karakter. Perlu update manual di Dashboard.
                                </p>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <p className="text-sm text-yellow-800">
                                    <strong>Catatan:</strong> Update email dan password memerlukan akses admin ke Supabase Dashboard.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium mb-3">Statistik Bulan Ini</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Transaksi</p>
                                        <p className="text-2xl font-bold">0</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Nilai Transaksi</p>
                                        <p className="text-2xl font-bold">Rp 0</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Pengeluaran</p>
                                        <p className="text-2xl font-bold text-red-600">Rp 0</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Item Terjual</p>
                                        <p className="text-2xl font-bold">0</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Info:</strong> Fitur tracking pengeluaran per karyawan akan segera hadir.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex gap-2 rounded-b-lg">
                    <button 
                        onClick={onClose} 
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                        Batal
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={isSubmitting} 
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
}