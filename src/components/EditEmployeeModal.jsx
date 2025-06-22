import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function EditEmployeeModal({ isOpen, onClose, employee, onSave }) {
    const [formData, setFormData] = useState({ name: '', email: '', role: '', active: true, pin: '', newPassword: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        if (employee) {
            setFormData({ name: employee.name, email: employee.email || employee.username, role: employee.role, active: employee.active, pin: '', newPassword: '' });
            setActiveTab('basic');
        }
    }, [employee]);

    if (!isOpen || !employee) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const updates = { name: formData.name, role: formData.role, active: formData.active, email: formData.email };
            if (formData.pin) {
                if (formData.pin.length !== 6) {
                    alert('PIN harus 6 digit');
                    setIsSubmitting(false);
                    return;
                }
                updates.pin = formData.pin;
            }
            await onSave(employee.id, updates);
        } catch (error) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
            onClose();
        }
    };

    const TabButton = ({ tab, children }) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-medium text-sm rounded-t-lg ${activeTab === tab ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 pb-0">
                    <h3 className="text-xl font-bold mb-1">Edit Karyawan</h3>
                    <p className="text-gray-600 mb-4">{employee.name}</p>
                    <div className="flex gap-2 border-b">
                        <TabButton tab="basic">Data Dasar</TabButton>
                        <TabButton tab="security">Keamanan</TabButton>
                        <TabButton tab="stats">Statistik</TabButton>
                    </div>
                </div>
                <div className="p-6">
                    {activeTab === 'basic' && (
                        <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" /><p className="text-xs text-gray-500 mt-1">Mengubah email di sini tidak akan mengubah email login.</p></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Role</label><select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"><option value="kasir">Kasir</option><option value="kasir_senior">Kasir Senior</option><option value="owner">Owner</option></select></div>
                            <div className="flex items-center"><input id="active-checkbox" name="active" type="checkbox" checked={formData.active} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" /><label htmlFor="active-checkbox" className="ml-2 block text-sm text-gray-900">Akun Aktif</label></div>
                        </div>
                    )}
                    {activeTab === 'security' && (
                         <div className="space-y-4">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">PIN Baru (6 digit)</label><input type="text" name="pin" value={formData.pin} onChange={handleChange} maxLength="6" pattern="[0-9]{6}" className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Kosongkan jika tidak ingin mengubah" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password Login Baru</label><input type="password" name="newPassword" readOnly value="******" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" /></div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3"><p className="text-sm text-yellow-800"><strong>Catatan:</strong> Untuk mengubah password login, lakukan dari Supabase Dashboard untuk keamanan.</p></div>
                        </div>
                    )}
                    {activeTab === 'stats' && (
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium mb-3">Statistik 30 Hari Terakhir</h4>
                                {/* PERBAIKAN: Grid diubah menjadi 3 kolom untuk pengeluaran */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div><p className="text-sm text-gray-600">Total Transaksi</p><p className="text-2xl font-bold">{employee.stats?.total_transactions_30d}</p></div>
                                    <div><p className="text-sm text-gray-600">Nilai Penjualan</p><p className="text-2xl font-bold text-green-600">Rp{(employee.stats?.total_sales_value_30d || 0).toLocaleString('id-ID')}</p></div>
                                    {/* ELEMEN BARU: Menampilkan data pengeluaran */}
                                    <div><p className="text-sm text-gray-600">Nilai Pengeluaran</p><p className="text-2xl font-bold text-red-600">Rp{(employee.stats?.total_expenses_30d || 0).toLocaleString('id-ID')}</p></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 px-6 py-4 flex gap-2 rounded-b-lg">
                    <button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Batal</button>
                    <button onClick={handleSave} disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
