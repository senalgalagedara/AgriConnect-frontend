"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from '../../../components/sidebar';
import NavbarHome from '../../../components/navbar';
import Modal from '../../../components/Modal';

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
  // Modal state for editing an order
  const [editOpen, setEditOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState('');

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
              <span className="icon" aria-hidden>🔎</span>
              <input
                placeholder="Search orders by ID, customer, address…"
                value={query}
                onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
                aria-label="Search orders"
              />
              {query && (
                <button
                  className="btn ghost"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  title="Clear"
                >
                  ⨯
                </button>
              )}
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
                    <th className="right">Actions</th>
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
                        <span className={`badge ${o.status.toLowerCase()}`}>
                          <span className="dot" /> {o.status}
                        </span>
                      </td>
                      <td className="small muted">{new Date(o.createdAt).toLocaleString()}</td>
                      <td className="actions right">
                        <div className="btnGroup">
                          <Link
                            href={`/dashboard/orderdelivery/${o.id}/assign`}
                            className={`btn primary ${o.status !== 'PENDING' ? 'isDisabled' : ''}`}
                            aria-disabled={o.status !== 'PENDING'}
                            title={o.status !== 'PENDING' ? 'Only pending orders can be assigned' : 'Assign driver'}
                          >
                            Assign
                          </Link>
                          <button
                            className="btn outline"
                            onClick={() => {
                              setEditingOrder(o);
                              setEditStatus(o.status.toLowerCase());
                              setEditOpen(true);
                            }}
                            title="Edit status"
                          >
                            Edit
                          </button>

                          <button
                            className="btn deleteBtn"
                            onClick={async () => {
                              if (!confirm('Delete this order? This cannot be undone.')) return;
                              try {
                                const res = await fetch(`${API_BASE}/orders/${o.id}`, { method: 'DELETE' });
                                const data = await res.json();
                                if (!res.ok) throw new Error(data?.error ?? data?.message ?? 'Delete failed');
                                // Remove from the table immediately
                                setOrders(prev => prev.filter(x => x.id !== o.id));
                              } catch (e: any) {
                                alert(e.message ?? 'Failed to delete');
                              }
                            }}
                            title="Delete order"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="note center">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <Modal show={editOpen} title={`Edit Order #${editingOrder?.id ?? ''}`} onClose={() => setEditOpen(false)}>
            <form
              className="formGrid"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!editingOrder) return;
                try {
                  setLoading(true);
                  const res = await fetch(`${API_BASE}/orders/${editingOrder.id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: editStatus })
                  });
                  const j = await res.json();
                  if (!res.ok) throw new Error(j?.error ?? j?.message ?? 'Update failed');
                  const rr = await fetch(`${API_BASE}/admin/orders`, { cache: 'no-store' });
                  const pl = await rr.json();
                  const rows = Array.isArray(pl) ? pl : pl?.data ?? [];
                  const d = rows.map((r: any) => ({
                    id: Number(r.order_id ?? r.id),
                    customerName: r.customer_name ?? ((r.contact && `${r.contact.firstName} ${r.contact.lastName}`) || ''),
                    address: r.customer_address ?? (r.shipping?.address ?? ''),
                    contactNo: r.customer_phone ?? (r.contact?.phone ?? ''),
                    quantity: Number(r.quantity ?? r.total ?? 0),
                    status: (r.status ?? '').toUpperCase(),
                    createdAt: r.created_at ?? r.createdAt ?? new Date().toISOString(),
                  }));
                  setOrders(d);
                  setEditOpen(false);
                } catch (err: any) {
                  alert(err.message ?? 'Failed to update');
                } finally { setLoading(false); }
              }}
            >
              <label htmlFor="status">Order Status</label>
              <select
                id="status"
                className="input"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <div className="formActions">
                <button type="button" className="btn ghost" onClick={() => setEditOpen(false)}>Cancel</button>
                <button type="submit" className="btn primary">Save</button>
              </div>
            </form>
          </Modal>

        </main>
      </div>

      <style jsx>{`
        :root {
          --bg: #f6faf6;
          --surface: #ffffff;
          --surface-2: #fbfffb;
          --border: #e6f0ea;
          --shadow: 0 6px 20px rgba(16,24,40,0.06);
          --primary: #16a34a;
          --primary-600: #15803d;
          --primary-700: #166534;
          --text: #0f172a;
          --muted: #6b7280;
          --danger: #dc2626;
          --danger-700: #b91c1c;
          --ring: 0 0 0 3px rgba(22, 163, 74, 0.2);
        }

        .dashboardRoot { background: var(--bg); min-height: 100vh; }
        .layout { display: grid; grid-template-columns: 240px 1fr; gap: 20px; max-width: 1200px; margin: 20px auto; }
        .side { position: sticky; top: 88px; align-self: start; }
        .main {
          background: linear-gradient(180deg,var(--surface),var(--surface-2));
          padding: 18px; border-radius: 16px; box-shadow: var(--shadow);
          border: 1px solid #edf7ef;
        }

        .pageHeader { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:12px; }
        h1 { font-size: 20px; margin: 0; color: #114b34; letter-spacing: .2px; }

        /* Search */
        .search {
          position: relative; display:flex; align-items:center; gap:8px;
          padding: 6px 8px 6px 10px; background:#ffffff; border:1px solid var(--border);
          border-radius: 12px; min-width: 280px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .search .icon { font-size: 14px; opacity: .6; }
        .search input {
          flex:1; padding: 8px 8px; border: none; outline: none; font-size: 14px; background: transparent;
        }
        .search:focus-within { box-shadow: var(--ring); border-color: #cde9d8; }

        /* Cards */
        .cards { display:flex; gap:12px; margin-bottom: 12px; }
        .card.summary { flex:1; padding:14px; border-radius:12px; background: linear-gradient(90deg,#ecfdf3,#f0fdf9); border:1px solid #dff6e8; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .card .label { font-size:12px; color:#16a34a; text-transform: uppercase; letter-spacing: .08em; }
        .card .value { font-size:22px; font-weight:800; color:#064e3b; margin-top: 2px; }

        /* Table */
        .tableWrap { overflow: auto; border-radius: 12px; background: #fff; border: 1px solid #edf7ef; }
        table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 14px; }
        thead th {
          position: sticky; top: 0; z-index: 1;
          text-align: left; padding: 12px; background: linear-gradient(180deg,#f8fff9,#f2fff5);
          border-bottom: 1px solid #f0f7f0; color: #0f5132; font-weight: 700;
        }
        tbody tr:hover { background: #fbfdfb; }
        tbody td { padding: 12px; border-bottom: 1px solid #f5f7f5; vertical-align: top; }
        .right { text-align: right; }
        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace; color:#0b3b2a; }
        .muted { color:#6b7280; }
        .small { font-size: 12px; }
        .rowDisabled { opacity: 0.85; filter: grayscale(5%); }

        /* Buttons */
        .btn {
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          padding: 8px 12px; border-radius: 10px; font-weight:700; text-decoration:none; font-size: 13px;
          border: 1px solid transparent; transition: transform .04s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease, color .2s ease;
          cursor: pointer; user-select: none;
        }
        .btn:active { transform: translateY(1px); }
        .btn:focus-visible { outline: none; box-shadow: var(--ring); }

        .btn.primary {
          background: #16a34a;
          color: #ffffff; 
          border-color: #16a34a; 
          box-shadow: 0 6px 14px rgba(22,163,74,0.18);
        }
        .btn.primary:hover { 
          background: #15803d;
          border-color: #15803d;
        }
        .btn.primary.isDisabled { background: #e5e7eb; color:#6b7280; border-color:#e5e7eb; box-shadow:none; cursor: not-allowed; pointer-events: none; }

        .btn.outline {
          background: #fff; color: #114b34; border-color: #cfeee0;
        }
        .btn.outline:hover { background: #f6fffa; border-color: #b9e9d3; }

        .btn.ghost {
          background: transparent; color: #114b34; border-color: transparent;
        }
        .btn.ghost:hover { background: #f4fbf7; }

        .btn.danger {
          background: linear-gradient(180deg,var(--danger),var(--danger-700)); color:#fff; border-color:#d11f1f;
          box-shadow: 0 6px 14px rgba(220,38,38,0.18);
        }
        .btn.danger:hover { filter: brightness(1.02); }

        .btn.deleteBtn {
          background: #ffffff;
          color: #dc2626;
          border: 1px solid #fecaca;
          font-weight: 700;
        }
        .btn.deleteBtn:hover {
          background: #fef2f2;
          border-color: #fca5a5;
        }

        .btnGroup { display:flex; gap:8px; justify-content: flex-end; }

        /* Badges */
        .badge {
          display:inline-flex; align-items:center; gap:8px;
          padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight:800; letter-spacing:.02em;
          border:1px solid; background:#fff;
        }
        .badge .dot { width:8px; height:8px; border-radius:999px; display:inline-block; }
        .badge.pending { color:#b45309; border-color:#ffedd5; background:#fff7ed; }
        .badge.pending .dot { background:#f59e0b; }
        .badge.assigned { color:#0ea5b7; border-color:#cffafe; background:#ecfeff; }
        .badge.assigned .dot { background:#06b6d4; }
        .badge.dispatched { color:#15803d; border-color:#bbf7d0; background:#f0fdf4; }
        .badge.dispatched .dot { background:#22c55e; }
        .badge.delivered { color:#3730a3; border-color:#e0e7ff; background:#eef2ff; }
        .badge.delivered .dot { background:#6366f1; }

        /* Messages */
        .note { padding: 12px; color: #4b5563; }
        .note.center { text-align: center; }
        .error { padding: 12px; color: #a50000; background: #fff1f0; border: 1px solid #ffa39e; border-radius: 10px; }

        /* Form (modal) */
        .formGrid {
          display: grid; grid-template-columns: 1fr; gap: 10px;
          padding: 6px;
        }
        .formGrid label { font-size: 12px; font-weight: 700; color:#0f5132; text-transform: uppercase; letter-spacing:.08em; }
        .input, select {
          width: 100%; border-radius: 10px; padding: 10px 12px; border: 1px solid #cfeee0; background:#ffffff;
          font-size: 14px; color: var(--text); transition: border-color .2s ease, box-shadow .2s ease;
        }
        .input:focus, select:focus { outline: none; border-color: #b9e9d3; box-shadow: var(--ring); }
        .formActions { display:flex; gap:8px; justify-content: flex-end; margin-top: 6px; }

        @media (max-width: 900px) {
          .layout { grid-template-columns: 1fr; padding: 12px; }
          .side{ display:none; }
          .cards { flex-direction: column; }
          .pageHeader { align-items: stretch; flex-direction: column; }
          .search { width: 100%; }
        }
      `}</style>
    </div>
  );
}
