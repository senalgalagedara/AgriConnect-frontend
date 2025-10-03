"use client";
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from '../../../components/sidebar';
import NavbarHome from '../../../components/NavbarHome';

type Order = {
  id: number;
  customerName: string;
  address: string;
  contactNo: string;
  quantity: number;
  status: 'PENDING' | 'ASSIGNED' | 'DISPATCHED' | 'DELIVERED' | string;
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
        const res = await fetch(`${API_BASE}/admin/orders`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const payload = await res.json();
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
    <div className="dashboardRoot">
      <NavbarHome />
      <div className="layout">
        <aside className="side"><Sidebar /></aside>
        <main className="main">
          <div className="pageHeader">
            <h1>Order & Delivery — Orders</h1>
            <div className="search">
              <input
                placeholder="Search orders..."
                value={query}
                onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
              />
            </div>
          </div>

          {loading && <div className="note">Loading orders…</div>}
          {err && <div className="error">Error: {err}</div>}

          <div className="cards">
            <div className="card summary">
              <div className="label">Total Orders</div>
              <div className="value">{orders.length}</div>
            </div>
            <div className="card summary">
              <div className="label">Pending</div>
              <div className="value">{orders.filter(o => o.status === 'PENDING').length}</div>
            </div>
            <div className="card summary">
              <div className="label">Assigned</div>
              <div className="value">{orders.filter(o => o.status === 'ASSIGNED').length}</div>
            </div>
          </div>

          {!loading && !err && (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Address</th>
                    <th>Contact</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className={o.status !== 'PENDING' ? 'rowDisabled' : ''}>
                      <td className="mono">#{o.id}</td>
                      <td>{o.customerName}</td>
                      <td className="muted small">{o.address}</td>
                      <td>{o.contactNo}</td>
                      <td>{o.quantity}</td>
                      <td>
                        <span className={`badge ${o.status.toLowerCase()}`}>{o.status}</span>
                      </td>
                      <td className="small muted">{new Date(o.createdAt).toLocaleString()}</td>
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
                      <td colSpan={8} className="note">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </main>
      </div>

      <style jsx>{`
        .dashboardRoot { background: #f6faf6; min-height: 100vh; }
        .layout { display: grid; grid-template-columns: 240px 1fr; gap: 20px; max-width: 1200px; margin: 20px auto; }
        .side { position: sticky; top: 88px; align-self: start; }
        .main { background: linear-gradient(180deg,#ffffff,#fbfffb); padding: 18px; border-radius: 12px; box-shadow: 0 6px 20px rgba(16,24,40,0.06); }
        .pageHeader { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; }
        h1 { font-size: 20px; margin: 0; color: #114b34; }
        .search input { padding: 10px 12px; border-radius: 10px; border: 1px solid #e6f0ea; min-width: 260px; }
        .cards { display:flex; gap:12px; margin-bottom: 12px; }
        .card.summary { flex:1; padding:12px; border-radius:10px; background: linear-gradient(90deg,#ecfdf3,#f0fdf9); border:1px solid #dff6e8; }
        .card .label { font-size:12px; color:#16a34a; }
        .card .value { font-size:20px; font-weight:700; color:#064e3b; }
        .tableWrap { overflow: auto; border-radius: 10px; background: #fff; border: 1px solid #edf7ef; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        thead th { text-align: left; padding: 12px; background: linear-gradient(180deg,#f8fff9,#f2fff5); border-bottom: 1px solid #f0f7f0; color: #0f5132; }
        tbody td { padding: 12px; border-bottom: 1px solid #f5f7f5; vertical-align: top; }
        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace; color:#0b3b2a; }
        .muted { color:#6b7280; }
        .small { font-size: 12px; }
        .actions { white-space: nowrap; }
        .btn { display:inline-flex; align-items:center; gap:8px; padding: 8px 12px; border-radius: 10px; font-weight:600; text-decoration:none; }
        .btn.primary { background:#16a34a; color:#fff; }
        .btn.disabled { background:#e5e7eb; color:#6b7280; pointer-events:none; }
        .badge { padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight:700; }
        .badge.pending { background:#fff7ed; color:#b45309; border:1px solid #ffedd5; }
        .badge.assigned { background:#ecfeff; color:#0ea5b7; border:1px solid #cffafe; }
        .badge.dispatched { background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; }
        .badge.delivered { background:#eef2ff; color:#3730a3; border:1px solid #e0e7ff; }
        .rowDisabled { opacity: 0.7; }
        .note { padding: 12px; color: #4b5563; }
        .error { padding: 12px; color: #a50000; background: #fff1f0; border: 1px solid #ffa39e; border-radius: 8px; }
        @media (max-width: 900px) { .layout { grid-template-columns: 1fr; padding: 12px; } .side{ display:none; } }
      `}</style>
    </div>
  );
}

