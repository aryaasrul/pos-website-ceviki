import React, { useState, useEffect } from 'react';

export default function EditEmployeeModal({ isOpen, onClose, employee, onSave }) {
    const [role, setRole] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (employee) {
            setRole(employee.role);
            setIsActive(employee.active);
        }
    }, [employee]);

    if (!isOpen || !employee) return null;

    const handleSave = async () => {
        setIsSubmitting(true);
        await onSave(employee.id, {
            role: role,
            active: isActive
        });
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold mb-1">Edit Karyawan</h3>
                <p className="text-gray-600 mb-4">{employee.name}</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Peran (Role)</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm sm:text-sm"
                        >
                            <option value="kasir">Kasir</option>
                            <option value="kasir_senior">Kasir Senior</option>
                            <option value="owner">Owner</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="active-checkbox"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label htmlFor="active-checkbox" className="ml-2 block text-sm text-gray-900">
                            Akun Aktif
                        </label>
                    </div>
                </div>
                <div className="mt-6 flex gap-2">
                    <button onClick={onClose} className="w-full bg-gray-200 py-2 px-4 rounded">Batal</button>
                    <button onClick={handleSave} disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400">
                        {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
