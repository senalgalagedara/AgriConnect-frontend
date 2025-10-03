'use client';

import { useEffect, useState } from 'react';

type Row = {
  assignmentId: number;
  orderId: number;
  driverId: number;
  customerName: string;
  address: string;
  scheduleStatus: 'Scheduled' | 'In Transit' | 'Completed' | 'Cancelled';
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api';

export default function AssignmentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/assignments`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const payload = await res.json();
        const rows = Array.isArray(payload) ? payload : payload?.data ?? [];
        setRows(rows.map((r: any) => ({
          assignmentId: r.id,
          orderId: r.order_id,
          driverId: r.driver_id,
          customerName: r.customer_name,
          address: r.customer_address,
          scheduleStatus: (r.status || 'Scheduled').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        })));
      } catch (e: any) {
        setErr(e.message ?? 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="wrap">
      <h1>Assigned Drivers</h1>

      {loading && <div className="note">Loading…</div>}
      {err && <div className="error">Error: {err}</div>}

      {!loading && !err && (
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Assignment ID</th>
                <th>Order id</th>
                <th>Driverid</th>
                <th>Customer name</th>
                <th>Address</th>
                <th>ScheduleStatus</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.assignmentId}>
                  <td>{r.assignmentId}</td>
                  <td>{r.orderId}</td>
                  <td>{r.driverId}</td>
                  <td>{r.customerName}</td>
                  <td>{r.address}</td>
                  <td><span className={`badge ${r.scheduleStatus.replace(/\s+/g,'').toLowerCase()}`}>{r.scheduleStatus}</span></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="note">No assignments yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .wrap { display: grid; gap: 12px; }
        h1 { font-size: 20px; margin: 0; }
        .tableWrap { overflow: auto; border: 1px solid #eee; border-radius: 10px; background: #fff; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        thead th { text-align: left; padding: 10px; background: #fafafa; border-bottom: 1px solid #eee; white-space: nowrap; }
        tbody td { padding: 10px; border-bottom: 1px solid #f2f2f2; vertical-align: top; }
        .badge { padding: 3px 8px; border-radius: 999px; font-size: 12px; border: 1px solid #e5e5e5; background: #f7f7f7; }
        .badge.scheduled { background: #e6f7ff; border-color: #91d5ff; }
        .badge.intransit { background: #fffbe6; border-color: #ffe58f; }
        .badge.completed { background: #f6ffed; border-color: #b7eb8f; }
        .badge.cancelled { background: #fff1f0; border-color: #ffa39e; }
        .note { padding: 10px; color: #666; }
        .error { padding: 10px; color: #a50000; background: #fff1f0; border: 1px solid #ffa39e; border-radius: 8px; }
      `}</style>
    </div>
  );
}
