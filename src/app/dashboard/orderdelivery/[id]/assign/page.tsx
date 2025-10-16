"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../../../../components/sidebar';
import NavbarHome from '../../../../../components/navbar';

type Order = {
  id: number; customerName: string; address: string; contactNo: string;
  quantity: number; status: string; createdAt: string;
};
type Driver = {
  id: number; name: string; vehicle: string; capacity: number; allocated: number; remaining?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api';

export default function AssignDriverPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = Number(id);

  const [order, setOrder] = useState<Order | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        // Fetch all orders and find the one with this ID
        const oRes = await fetch(`${API_BASE}/admin/orders`, { cache: 'no-store' });
        if (!oRes.ok) throw new Error('Order not found');
        const oPayload = await oRes.json();
        const oRows = Array.isArray(oPayload) ? oPayload : oPayload?.data ?? [];
        const found = oRows.find((r: any) => Number(r.order_id ?? r.id) === orderId);
        if (!found) throw new Error('Order not found');
        setOrder({
          id: Number(found.order_id ?? found.id),
          customerName: found.customer_name,
          address: found.customer_address,
          contactNo: found.customer_phone,
          quantity: Number(found.quantity ?? 0),
          status: (found.status ?? '').toUpperCase(),
          createdAt: found.created_at ?? '',
        });

        // Fetch available drivers from admin endpoint
        const dRes = await fetch(`${API_BASE}/admin/drivers/available`, { cache: 'no-store' });
        if (!dRes.ok) throw new Error('Failed to load drivers');
        const dPayload = await dRes.json();
        const dRows = Array.isArray(dPayload) ? dPayload : dPayload?.data ?? [];
        setDrivers(dRows.map((d: any) => ({
          id: d.id,
          name: d.name,
          vehicle: d.vehicle_type,
          capacity: Number(d.capacity),
          allocated: d.capacity - d.remaining_capacity,
          remaining: d.remaining_capacity
        })));
      } catch (e: any) {
        setErr(e.message ?? 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return drivers;
    return drivers.filter(d => [d.name, d.vehicle, d.id].join(' ').toLowerCase().includes(q));
  }, [drivers, search]);

  async function assign(driverId: number) {
    try {
      // Require a schedule time (now + 1 hour)
      const scheduleTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      
      // Use the correct endpoint format
      const res = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          driver_id: driverId,
          schedule_time: scheduleTime
        })
      });

      const result = await res.json();
      console.log('Assignment created successfully:', result);
      
      // Success - show message and redirect
      alert('Driver assigned successfully! Order status updated.');
      router.push('/dashboard/orderdelivery/assigneddrivers');
    } catch (e: any) {
      console.error('Assignment error:', e);
      alert(e.message ?? 'Failed to assign driver');
    }
  }

  return (
    <div className="dashboardRoot">
      <NavbarHome />
      <div className="layout">
        <aside className="side"><Sidebar /></aside>
        <main className="main">
          <h1>Assign Driver</h1>

          {loading && <div className="note">Loading…</div>}
          {err && <div className="error">Error: {err}</div>}

          {order && (
            <div className="card">
              <div className="row">
                <div><b>Order ID:</b> {order.id}</div>
                <div><b>Customer:</b> {order.customerName}</div>
                <div><b>Address:</b> {order.address}</div>
                <div><b>Contact:</b> {order.contactNo}</div>
                <div><b>Quantity:</b> {order.quantity}</div>
              </div>
            </div>
          )}

          <div className="toolbar">
            <input
              placeholder="Search drivers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Vehicle</th>
                  <th>Capacity</th>
                  <th>Allocated</th>
                  <th>Remaining</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => {
                  const remaining = d.remaining ?? Math.max(0, d.capacity - d.allocated);
                  const disabled = !order || remaining < order.quantity;
                  return (
                    <tr key={d.id} className={disabled ? 'rowDisabled' : ''}>
                      <td>#{d.id}  {d.name}</td>
                      <td>{d.vehicle}</td>
                      <td>{d.capacity}</td>
                      <td>{d.allocated}</td>
                      <td>{remaining}</td>
                      <td className="actions">
                        <button
                          disabled={disabled}
                          onClick={() => assign(d.id)}
                          className={`btn ${disabled ? 'disabled' : 'primary'}`}
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="note">No drivers available</td></tr>
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>

      <style jsx>{`
        .dashboardRoot { background: #f6faf6; min-height: 100vh; }
        .layout { display: grid; grid-template-columns: 240px 1fr; gap: 20px; max-width: 1100px; margin: 20px auto; }
        .side { position: sticky; top: 88px; align-self: start; }
        .main { background: #fff; padding: 18px; border-radius: 12px; box-shadow: 0 6px 18px rgba(16,24,40,0.05); }
        h1 { margin: 0 0 12px 0; color: #0f5132; }
        .card { background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 12px; margin-bottom:12px; }
        .row { display: grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap: 8px; }
        .toolbar { display:flex; gap:8px; margin-bottom:12px; }
        input { width: 320px; max-width: 100%; padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; }
        .tableWrap { overflow: auto; border-radius: 10px; background: #fff; border: 1px solid #eefaf0; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        thead th { text-align:left; padding:12px; background: linear-gradient(180deg,#f8fff9,#f2fff5); border-bottom:1px solid #eef6ee; color:#065f46; }
        tbody td { padding:12px; border-bottom:1px solid #f3f7f4; }
        .actions { white-space: nowrap; }
        .btn { display:inline-flex; align-items:center; justify-content:center; padding:6px 12px; border-radius:8px; font-weight:600; }
        .btn.primary { background:#16a34a; color:#fff; }
        .btn.disabled { background:#e5e7eb; color:#6b7280; cursor:not-allowed; }
        .rowDisabled { opacity:0.6; }
        .note { padding:12px; color:#4b5563; }
        .error { padding:12px; color:#a50000; background:#fff1f0; border:1px solid #ffa39e; border-radius:8px; }
        @media (max-width:900px){ .layout{ grid-template-columns:1fr; } .side{ display:none; } }
      `}</style>
    </div>
  );
}
