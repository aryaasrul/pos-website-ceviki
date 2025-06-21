import React from 'react';
const ItemDiscount = ({ item, onItemDiscountChange }) => {
    return (
        <div className="flex gap-2 mt-2">
            <input type="number" placeholder="Diskon Item" value={item.discount.value === 0 ? '' : item.discount.value} onChange={(e) => onItemDiscountChange(item.id, item.discount.type, e.target.value)} className="w-full border rounded-md px-2 py-1 text-sm"/>
            <select value={item.discount.type} onChange={(e) => onItemDiscountChange(item.id, e.target.value, item.discount.value)} className="text-sm border rounded-md bg-gray-50"><option value="fixed">Rp</option><option value="percentage">%</option></select>
        </div>
    );
};
export default function CartItem({ item, onQuantityChange, onRemoveItem, onItemDiscountChange }) {
    const originalPrice = item.price * item.quantity;
    let finalPrice = originalPrice;
    if(item.discount.type === 'percentage') {
        finalPrice = originalPrice - (originalPrice * (item.discount.value / 100));
    } else {
        finalPrice = originalPrice - item.discount.value;
    }
    const hasItemDiscount = item.discount.value > 0;
    return (
        <div className="py-2 border-b">
            <div className="flex justify-between items-start"><span className="font-semibold w-4/5">{item.name}</span><button onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700 text-sm font-semibold">X</button></div>
            <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2"><button onClick={() => onQuantityChange(item.id, item.quantity - 1)} className="border rounded-md w-6 h-6 font-bold">-</button><span>{item.quantity}</span><button onClick={() => onQuantityChange(item.id, item.quantity + 1)} className="border rounded-md w-6 h-6 font-bold">+</button></div>
                <div>{hasItemDiscount && <span className="text-xs text-gray-500 line-through mr-2">Rp{originalPrice.toLocaleString('id-ID')}</span>}<span className="font-semibold">Rp{finalPrice.toLocaleString('id-ID')}</span></div>
            </div>
            <ItemDiscount item={item} onItemDiscountChange={onItemDiscountChange} />
        </div>
    );
}
