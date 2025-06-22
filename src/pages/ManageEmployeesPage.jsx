import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import EditEmployeeModal from '../components/EditEmployeeModal';
import AddEmployeeModal from '../components/AddEmployeeModal';

export default function ManageEmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        try {
            // Mengambil data dari 2 sumber dan menggabungkannya di client.
            const { data: employeesData, error: employeesError } = await supabase
                .from('employees')
                .select('*')
                .order('name', { ascending: true });

            if (employeesError) {
                throw new Error(`Gagal memuat karyawan: ${employeesError.message}`);
            }

            const { data: statsData, error: statsError } = await supabase
                .from('v_employee_performance_stats')
                .select('*');

            if (statsError) {
                throw new Error(`Gagal memuat statistik: ${statsError.message}`);
            }

            const statsMap = new Map(statsData.map(stat => [stat.employee_id, stat]));
            
            const combinedData = employeesData.map(emp => {
                const stats = statsMap.get(emp.id) || { total_transactions_30d: 0, total_sales_value_30d: 0, total_expenses_30d: 0 };
                return {
                    ...emp,
                    email: emp.email || emp.username,
                    stats: stats,
                };
            });
            
            setEmployees(combinedData);

        } catch (error) {
            console.error("Error fetching data:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const filteredEmployees = employees.filter(emp => {
        const searchMatch = 
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const roleMatch = roleFilter === 'all' || emp.role === roleFilter;
        const statusMatch = statusFilter === 'all' || 
            (statusFilter === 'active' ? emp.active : !emp.active);
        
        return searchMatch && roleMatch && statusMatch;
    });

    const handleOpenEditModal = (employee) => {
        setSelectedEmployee(employee);
        setIsEditModalOpen(true);
    };

    const handleSaveEmployee = async (employeeId, updatedData) => {
        try {
            const { error } = await supabase
                .from('employees')
                .update(updatedData)
                .eq('id', employeeId);
            
            if (error) throw error;
            
            alert('Data karyawan berhasil diperbarui');
            fetchEmployees();
        } catch (error) {
            alert(`Gagal memperbarui karyawan: ${error.message}`);
        } finally {
            setIsEditModalOpen(false);
        }
    };

    const handleDeleteEmployee = async (employee) => {
        if (!window.confirm(`Yakin ingin menghapus akun ${employee.name}?`)) {
            return;
        }

        try {
            const { error: empError } = await supabase
                .from('employees')
                .delete()
                .eq('id', employee.id);
            
            if (empError) throw empError;
            
            alert('Data karyawan berhasil dihapus.');
            fetchEmployees();
        } catch (error) {
            alert(`Gagal menghapus karyawan: ${error.message}`);
        }
    };

    const handleAddEmployee = async (newEmployeeData) => {
        setIsAddModalOpen(false);
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: newEmployeeData.email,
                password: newEmployeeData.password,
                options: { data: { name: newEmployeeData.name } }
            });
            
            if (authError) throw authError;
            if (!authData.user) throw new Error("Gagal membuat user di Supabase Auth.");
            
            const { error: empError } = await supabase
                .from('employees')
                .insert([{
                    user_id: authData.user.id,
                    username: newEmployeeData.email,
                    name: newEmployeeData.name,
                    role: newEmployeeData.role,
                    pin: newEmployeeData.pin || '000000',
                    active: true,
                    email: newEmployeeData.email
                }]);
            
            if (empError) throw empError;
            
            alert('Karyawan baru berhasil ditambahkan.');
            fetchEmployees();
        } catch (error) {
            alert(`Gagal menambah karyawan: ${error.message}`);
        }
    };

    return (
        <div>
            {/* Header and Filters */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Kelola Karyawan</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Karyawan
                </button>
            </div>
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Cari nama atau email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-md" />
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                        <option value="all">Semua Role</option>
                        <option value="owner">Owner</option>
                        <option value="kasir_senior">Kasir Senior</option>
                        <option value="kasir">Kasir</option>
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                        <option value="all">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="inactive">Non-Aktif</option>
                    </select>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                    Menampilkan {filteredEmployees.length} dari {employees.length} karyawan
                </div>
            </div>

            {/* Employee Cards with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><p className="mt-2 text-gray-600">Memuat data...</p></div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-gray-500">Tidak ada karyawan ditemukan</div>
                ) : (
                    filteredEmployees.map(emp => (
                        <div key={emp.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1"><h3 className="font-bold text-lg">{emp.name}</h3><p className="text-sm text-gray-600">{emp.email}</p></div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${emp.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{emp.active ? 'Aktif' : 'Non-Aktif'}</span>
                                </div>
                                <div className="space-y-2 mb-4"><div className="flex justify-between text-sm"><span className="text-gray-600">Role:</span><span className="font-medium capitalize">{emp.role.replace('_', ' ')}</span></div></div>
                                <div className="border-t pt-4 mb-4">
                                    <div className="text-sm text-gray-600">Statistik 30 Hari Terakhir:</div>
                                    {/* PERBAIKAN: Grid diubah menjadi 3 kolom untuk pengeluaran */}
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        <div className="text-center p-2 bg-gray-50 rounded"><div className="text-xs text-gray-500">Transaksi</div><div className="font-bold">{emp.stats?.total_transactions_30d}</div></div>
                                        <div className="text-center p-2 bg-gray-50 rounded"><div className="text-xs text-gray-500">Penjualan</div><div className="font-bold text-green-600">Rp{(emp.stats?.total_sales_value_30d || 0).toLocaleString('id-ID')}</div></div>
                                        {/* ELEMEN BARU: Menampilkan data pengeluaran */}
                                        <div className="text-center p-2 bg-gray-50 rounded"><div className="text-xs text-gray-500">Pengeluaran</div><div className="font-bold text-red-600">Rp{(emp.stats?.total_expenses_30d || 0).toLocaleString('id-ID')}</div></div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenEditModal(emp)} className="flex-1 bg-blue-100 text-blue-700 text-sm font-bold py-2 px-3 rounded hover:bg-blue-200 transition-colors">Edit</button>
                                    {emp.role !== 'owner' && (<button onClick={() => handleDeleteEmployee(emp)} className="bg-red-100 text-red-700 text-sm font-bold py-2 px-3 rounded hover:bg-red-200 transition-colors">Hapus</button>)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <EditEmployeeModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} employee={selectedEmployee} onSave={handleSaveEmployee} />
            <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddEmployee} />
        </div>
    );
}
