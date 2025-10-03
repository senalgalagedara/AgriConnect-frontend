'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type Order = {
  id: number; customerName: string; address: string; contactNo: string;
  quantity: number; status: string; createdAt: string;
};
type Driver = {
  id: number; name: string; vehicle: string; capacity: number; allocated: number; remaining?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api';

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
      const res = await fetch(`${API_BASE}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, driverId, scheduleTime })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? data?.message ?? 'Assign failed');
      // success -> go to assigned drivers page
      router.push('/dashboard/orderdelivery/assigneddrivers');
    } catch (e: any) {
      alert(e.message ?? 'Failed to assign');
    }
  }

  return (
    <div className="wrap">
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
                  <td>#{d.id} • {d.name}</td>
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

      <style jsx>{`
        .wrap { display: grid; gap: 12px; }
        h1 { font-size: 20px; margin: 0; }
        .card { background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 12px; }
        .row { display: grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap: 8px; }
        .toolbar { display: flex; gap: 8px; }
        input {
          width: 320px; max-width: 100%;
          padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px; outline: none;
        }
        .tableWrap { overflow: auto; border: 1px solid #eee; border-radius: 10px; background: #fff; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        thead th { text-align: left; padding: 10px; background: #fafafa; border-bottom: 1px solid #eee; white-space: nowrap; }
        tbody td { padding: 10px; border-bottom: 1px solid #f2f2f2; vertical-align: top; }
        .actions { white-space: nowrap; }
        .btn {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 6px 12px; border-radius: 8px; font-weight: 600; border: 1px solid transparent; transition: 0.15s;
        }
        .btn.primary { background: #111; color: #fff; }
        .btn.primary:hover { background: #000; }
        .btn.disabled { background: #999; color: #eee; cursor: not-allowed; }
        .rowDisabled { opacity: 0.6; }
        .note { padding: 10px; color: #666; }
        .error { padding: 10px; color: #a50000; background: #fff1f0; border: 1px solid #ffa39e; border-radius: 8px; }
      `}</style>
    </div>
  );
}
