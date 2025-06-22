import React, { useState } from 'react';

export default function AddEmployeeModal({ isOpen, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'kasir',
        pin: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            alert('Nama, email, dan password wajib diisi');
            return;
        }
        
        if (formData.password.length < 6) {
            alert('Password minimal 6 karakter');
            return;
        }
        
        if (formData.pin && formData.pin.length !== 6) {
            alert('PIN harus 6 digit');
            return;
        }
        
        setIsSubmitting(true);
        await onSave({
            ...formData,
            pin: formData.pin || '000000' // Default PIN
        });
        setIsSubmitting(false);
        
        // Reset form
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'kasir',
            pin: ''
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold mb-4">Tambah Karyawan Baru</h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Email ini akan digunakan untuk login</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                                required
                                minLength="6"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role <span className="text-red-500">*</span>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            PIN (6 digit)
                        </label>
                        <input
                            type="text"
                            name="pin"
                            value={formData.pin}
                            onChange={handleChange}
                            maxLength="6"
                            pattern="[0-9]{6}"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="000000"
                        />
                        <p className="text-xs text-gray-500 mt-1">Kosongkan untuk default 000000</p>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}