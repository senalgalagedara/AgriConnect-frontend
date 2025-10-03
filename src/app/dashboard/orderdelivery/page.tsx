'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Order = {
  id: number;
  customerName: string;
  address: string;
  contactNo: string;
  quantity: number;
  status: 'PENDING' | 'ASSIGNED' | 'DISPATCHED' | 'DELIVERED';
  createdAt: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // Admin endpoint returns { success, message, data }
        const res = await fetch(`${API_BASE}/admin/orders`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const payload = await res.json();

        // Support both direct array responses and APIResponse { data }
        const rows = Array.isArray(payload) ? payload : payload?.data ?? [];

        const data: Order[] = rows.map((r: any) => ({
          id: Number(r.order_id ?? r.id),
          customerName: r.customer_name ?? ((r.contact && `${r.contact.firstName} ${r.contact.lastName}`) || ''),
          address: r.customer_address ?? (r.shipping?.address ?? ''),
          contactNo: r.customer_phone ?? (r.contact?.phone ?? ''),
          quantity: Number(r.quantity ?? r.total ?? 0),
          status: (r.status ?? '').toUpperCase(),
          createdAt: r.created_at ?? r.createdAt ?? new Date().toISOString(),
        }));

        setOrders(data);
      } catch (e: any) {
        setErr(e.message ?? 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter(o =>
      [o.id.toString(), o.customerName, o.address, o.contactNo, o.status, o.createdAt]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [orders, query]);

  return (
    <div className="wrap">
      <h1>Order List</h1>

      <div className="toolbar">
        <input
          placeholder="Search orders..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading && <div className="note">Loading orders…</div>}
      {err && <div className="error">Error: {err}</div>}

      {!loading && !err && (
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Address</th>
                <th>Contact No</th>
                <th>Quentity</th>
                <th>Status</th>
                <th>Created date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className={o.status !== 'PENDING' ? 'rowDisabled' : ''}>
                  <td>{o.id}</td>
                  <td>{o.customerName}</td>
                  <td>{o.address}</td>
                  <td>{o.contactNo}</td>
                  <td>{o.quantity}</td>
                  <td>
                    <span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span>
                  </td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                  <td className="actions">
                    <Link
                      href={`/dashboard/orderdelivery/${o.id}/assign`}
                      className={`btn ${o.status === 'PENDING' ? 'primary' : 'disabled'}`}
                      aria-disabled={o.status !== 'PENDING'}
                    >
                      Assign
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="note">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .wrap { display: grid; gap: 12px; }
        h1 { font-size: 20px; margin: 0; }
        .toolbar { display: flex; gap: 8px; }
        input {
          width: 320px; max-width: 100%;
          padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; outline: none;
        }
        .tableWrap { overflow: auto; border: 1px solid #eee; border-radius: 10px; background: #fff; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        thead th {
          text-align: left; padding: 10px; background: #fafafa; border-bottom: 1px solid #eee; white-space: nowrap;
        }
        tbody td { padding: 10px; border-bottom: 1px solid #f2f2f2; vertical-align: top; }
        .actions { white-space: nowrap; }
        .btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 6px 12px; border-radius: 8px; text-decoration: none; font-weight: 600;
          border: 1px solid transparent; transition: 0.15s ease;
        }
        .btn.primary { background: #111; color: #fff; }
        .btn.primary:hover { background: #000; }
        .btn.disabled { background: #999; cursor: not-allowed; pointer-events: none; }
        .badge {
          padding: 3px 8px; border-radius: 999px; font-size: 12px; border: 1px solid #e5e5e5; background: #f7f7f7;
        }
        .badge.pending { background: #fffbe6; border-color: #ffe58f; }
        .badge.assigned { background: #e6f7ff; border-color: #91d5ff; }
        .badge.dispatched { background: #f6ffed; border-color: #b7eb8f; }
        .badge.delivered { background: #f0f5ff; border-color: #adc6ff; }
        .rowDisabled { opacity: 0.75; }
        .note { padding: 10px; color: #666; }
        .error { padding: 10px; color: #a50000; background: #fff1f0; border: 1px solid #ffa39e; border-radius: 8px; }
      `}</style>
    </div>
  );
}
