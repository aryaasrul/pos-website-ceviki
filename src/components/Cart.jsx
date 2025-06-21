import React, { useState } from 'react';
import CartItem from './CartItem';

const TransactionDiscount = ({ onApplyDiscount }) => {
    const [manualDiscount, setManualDiscount] = useState('');
    const [discountType, setDiscountType] = useState('fixed');
    const handleApply = () => onApplyDiscount(discountType, manualDiscount);

    return (
        <div className="bg-gray-50 p-3 rounded-md mt-2">
            <p className="text-sm font-semibold mb-2">Potongan Harga Transaksi</p>
            <div className="flex gap-2">
                <input type="number" placeholder="Diskon Total" value={manualDiscount} onChange={(e) => setManualDiscount(e.target.value)} onBlur={handleApply} className="w-full border rounded-md px-2 py-1 text-sm" />
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} className="text-sm border rounded-md"><option value="fixed">Rp</option><option value="percentage">%</option></select>
            </div>
        </div>
    );
};

export default function Cart({ cartItems, totals, onQuantityChange, onRemoveItem, onItemDiscountChange, onTransactionDiscountChange, className = '', isMobile, onCloseCart, onCheckout }) {
    return (
        <section className={`bg-white p-4 rounded-lg shadow flex flex-col ${className}`}>
            <div className="flex justify-between items-center border-b pb-2 mb-2"><h2 className="text-xl font-bold">Keranjang</h2>{isMobile && (<button onClick={onCloseCart} className="text-2xl font-bold text-gray-500 hover:text-gray-800">&times;</button>)}</div>
            <div className="flex-grow overflow-y-auto pr-2">
                {cartItems.length === 0 ? (<div className="flex h-full items-center justify-center text-gray-500"><p>Keranjang masih kosong</p></div>) : (cartItems.map(item => (<CartItem key={item.id} item={item} onQuantityChange={onQuantityChange} onRemoveItem={onRemoveItem} onItemDiscountChange={onItemDiscountChange} />)))}
            </div>
            {cartItems.length > 0 && <TransactionDiscount onApplyDiscount={onTransactionDiscountChange} />}
            <div className="border-t pt-4 mt-2">
                 <div className="flex justify-between mb-1"><span>Subtotal</span><span>Rp{totals.subtotal.toLocaleString('id-ID')}</span></div>
                 <div className="flex justify-between mb-2 text-red-500"><span>Diskon</span><span>- Rp{totals.discount.toLocaleString('id-ID')}</span></div>
                 <div className="flex justify-between font-bold text-lg"><span>Total</span><span>Rp{totals.total.toLocaleString('id-ID')}</span></div>
                 <button onClick={onCheckout} disabled={cartItems.length === 0} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded mt-4 hover:bg-blue-700 disabled:bg-gray-400">Proses Pembayaran</button>
            </div>
        </section>
    );
}
