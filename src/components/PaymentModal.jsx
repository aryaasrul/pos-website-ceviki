import React, { useState } from 'react';
export default function PaymentModal({ isOpen, onClose, totalAmount, onConfirmPayment, isSubmitting }) {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    if (!isOpen) return null;
    const handleConfirm = () => { onConfirmPayment({ customerName, customerPhone, customerAddress, paymentMethod }); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3"><h3 className="text-xl font-bold">Detail Pembayaran</h3><button onClick={onClose} className="text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button></div>
                <div className="mt-4 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center"><p className="text-sm text-gray-600">Total</p><p className="text-3xl font-bold text-blue-600">Rp{totalAmount.toLocaleString('id-ID')}</p></div>
                    <div><label>Nama Pelanggan</label><input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" /></div>
                    <div><label>No. HP</label><input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="mt-1 block w-full p-2 border rounded-md" /></div>
                    <div><label>Alamat</label><textarea value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} rows="3" className="mt-1 block w-full p-2 border rounded-md"></textarea></div>
                    <div><label>Metode Pembayaran</label><select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="mt-1 block w-full p-2 border bg-white rounded-md"><option value="cash">Tunai</option><option value="qris">QRIS</option><option value="card">Kartu</option></select></div>
                </div>
                <div className="mt-6"><button onClick={handleConfirm} disabled={isSubmitting} className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600 disabled:bg-gray-400">{isSubmitting ? 'Menyimpan...' : 'Konfirmasi'}</button></div>
            </div>
        </div>
    );
}
