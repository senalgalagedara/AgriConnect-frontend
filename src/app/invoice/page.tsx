'use client';

import { useEffect, useState } from 'react';
export type CartItem = {
  id: string;
  name: string;
  price: number; // per item
  qty: number;
  image?: string;
};
export type Transaction = {
  id: string; // order id
  customerName: string;
  email: string;
  total: number;
  paymentMethod: 'COD' | 'CARD';
  createdAt: string; // ISO
  items: CartItem[];
};

export default function InvoicePage() {
  const [tx, setTx] = useState<Transaction | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lastInvoice');
    if (saved) setTx(JSON.parse(saved));
  }, []);

  if (!tx) return <div className="p-8 text-gray-500">No invoice found.</div>;

  const date = new Date(tx.createdAt);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <span className="text-2xl">✅</span>
        </div>
        <h1 className="text-center text-xl font-semibold mb-8">Payment Success!</h1>

        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <span className="text-gray-500">Order ID:</span><span className="font-medium">{tx.id}</span>
          <span className="text-gray-500">Customer:</span><span className="font-medium">{tx.customerName || '—'}</span>
          <span className="text-gray-500">Email</span><span className="font-medium">{tx.email}</span>
        </div>

        <h3 className="mt-8 mb-3 text-center font-medium">Items</h3>
        <div className="divide-y rounded-xl border">
          {tx.items.map((i) => (
            <div key={i.id} className="grid grid-cols-3 px-4 py-3 text-sm">
              <span>{i.name}</span>
              <span className="text-center">x {i.qty}</span>
              <span className="text-right">${(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-600">Total due</span><span className="font-semibold">${tx.total.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Payment Method</span><span className="font-medium">{tx.paymentMethod === 'CARD' ? 'Credit Card' : 'Cash on Delivery'}</span></div>
          <div className="flex justify-between"><span className="text-gray-600">Date</span><span className="font-medium">{date.toLocaleString()}</span></div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800"
          >
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
