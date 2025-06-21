import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import EditEmployeeModal from '../components/EditEmployeeModal';

export default function ManageEmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .order('name', { ascending: true });

        if (error) console.error("Error fetching employees:", error);
        else setEmployees(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleOpenEditModal = (employee) => {
        setSelectedEmployee(employee);
        setIsEditModalOpen(true);
    };

    const handleSaveEmployee = async (employeeId, updatedData) => {
        const { error } = await supabase.from('employees').update(updatedData).eq('id', employeeId);
        if (error) alert(`Gagal memperbarui karyawan: ${error.message}`);
        else fetchEmployees();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-bold">Kelola Karyawan</h2>
                 {/* Tombol Tambah Karyawan bisa ditambahkan di sini nanti */}
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3 text-left">Nama</th>
                            <th className="p-3 text-left">Email / Username</th>
                            <th className="p-3 text-left">Peran</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-4">Memuat data...</td></tr>
                        ) : (
                            employees.map(e => (
                                <tr key={e.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-bold">{e.name}</td>
                                    <td className="p-3 text-sm text-gray-600">{e.username}</td>
                                    <td className="p-3 text-sm capitalize">{e.role.replace('_', ' ')}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${e.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {e.active ? 'Aktif' : 'Non-Aktif'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => handleOpenEditModal(e)} className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <EditEmployeeModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} employee={selectedEmployee} onSave={handleSaveEmployee} />
        </div>
    );
}
