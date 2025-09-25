'use client';

import { useEffect, useMemo, useState } from 'react';
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

export default function PaymentManagerPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem('transactions') || '[]') as Transaction[];
    setTxs(all);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return txs;
    return txs.filter(
      (t) =>
        t.id.includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q)
    );
  }, [txs, query]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <h1 className="text-2xl font-semibold text-green-700 mb-6">AgriConnect</h1>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Transactions</h2>
        <input
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-64 rounded-lg border border-gray-200 px-3 py-2 outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Email</Th>
              <Th>Order Date</Th>
              <Th className="text-right">Total</Th>
            </tr>
          </thead>
        <tbody className="divide-y">
          {filtered.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50">
              <Td>{t.id}</Td>
              <Td>{t.customerName || '—'}</Td>
              <Td>{t.email}</Td>
              <Td>{new Date(t.createdAt).toLocaleDateString()}</Td>
              <Td className="text-right">Rs.{t.total.toFixed(2)}</Td>
            </tr>
          ))}
          {!filtered.length && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500">
                No transactions yet.
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-500">View-only: Payment Manager has no edit permissions.</p>
    </div>
  );
}

function Th({ children, className = '' }: any) {
  return <th className={`px-4 py-3 font-medium text-gray-600 ${className}`}>{children}</th>;
}
function Td({ children, className = '' }: any) {
  return <td className={`px-4 py-3 text-gray-800 ${className}`}>{children}</td>;
}
