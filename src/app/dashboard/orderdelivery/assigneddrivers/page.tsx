"use client";

import { useEffect, useState } from 'react';
import Sidebar from '../../../../components/sidebar';
import NavbarHome from '../../../../components/NavbarHome';
import Modal from '../../../../components/Modal';

type Row = {
  assignmentId: number;
  orderId: number;
  driverId: number;
  customerName: string;
  address: string;
  scheduleStatus: 'Scheduled' | 'In Transit' | 'Completed' | 'Cancelled' | string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api';

export default function AssignmentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  // modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editSchedule, setEditSchedule] = useState('');

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
    <div className="dashboardRoot">
      <NavbarHome />
      <div className="layout">
        <aside className="side"><Sidebar /></aside>
        <main className="main">
          <h1>Assigned Drivers</h1>

          {loading && <div className="note">Loading…</div>}
          {err && <div className="error">Error: {err}</div>}

          {!loading && !err && (
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Assignment ID</th>
                    <th>Order</th>
                    <th>Driver</th>
                    <th>Customer</th>
                    <th>Address</th>
                    <th>Schedule</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.assignmentId}>
                      <td className="mono">#{r.assignmentId}</td>
                      <td className="muted">#{r.orderId}</td>
                      <td>#{r.driverId}</td>
                      <td>{r.customerName}</td>
                      <td className="small muted">{r.address}</td>
                      <td><span className={`badge ${r.scheduleStatus.replace(/\s+/g,'').toLowerCase()}`}>{r.scheduleStatus}</span></td>
                      <td className="small">
                        <button
                          className="btnDelete"
                          onClick={async () => {
                            if (!confirm('Delete this assignment? This will free up the driver\'s capacity.')) return;
                            try {
                              const url = `${API_BASE}/assignments/${r.assignmentId}`;
                              console.log('Deleting assignment:', url);
                              
                              const res = await fetch(url, { method: 'DELETE' });
                              
                              // Consider 2xx, 204, and 404 (already deleted) as success
                              let ok = (res.status >= 200 && res.status < 300) || res.status === 204 || res.status === 404;
                              
                              // Fallback to admin endpoint if primary not ok
                              if (!ok) {
                                const altUrl = `${API_BASE}/admin/assignments/${r.assignmentId}`;
                                const res2 = await fetch(altUrl, { method: 'DELETE' });
                                ok = (res2.status >= 200 && res2.status < 300) || res2.status === 204 || res2.status === 404;
                              }
                              
                              // Optimistic UI update regardless
                              setRows(prev => prev.filter(x => x.assignmentId !== r.assignmentId));
                              alert(ok ? 'Assignment deleted successfully!' : 'Assignment removed locally. Refresh to sync if needed.');
                            } catch (e: any) {
                              console.error('Delete error:', e);
                              alert(e?.message ?? 'Failed to delete assignment');
                            }
                          }}
                        >Delete</button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="note">No assignments yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <Modal show={editOpen} title={`Edit Assignment #${editing?.assignmentId ?? ''}`} onClose={() => setEditOpen(false)}>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!editing) return;
              try {
                setLoading(true);
                const res = await fetch(`${API_BASE}/assignments/${editing.assignmentId}`, {
                  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ notes: editNotes, schedule_time: editSchedule })
                });
                const j = await res.json();
                if (!res.ok) throw new Error(j?.error ?? j?.message ?? 'Update failed');
                // refresh
                const rr = await fetch(`${API_BASE}/assignments`, { cache: 'no-store' });
                const pl = await rr.json();
                const rows = Array.isArray(pl) ? pl : pl?.data ?? [];
                setRows(rows.map((r2: any) => ({
                  assignmentId: r2.id,
                  orderId: r2.order_id,
                  driverId: r2.driver_id,
                  customerName: r2.customer_name,
                  address: r2.customer_address,
                  scheduleStatus: (r2.status || 'Scheduled').replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
                })));
                setEditOpen(false);
              } catch (e: any) { alert(e.message ?? 'Failed to update'); }
              finally { setLoading(false); }
            }}>
              <div style={{ display: 'grid', gap: 8 }}>
                <label>Notes</label>
                <textarea value={editNotes} onChange={(e) => setEditNotes((e.target as HTMLTextAreaElement).value)} rows={4} />
                <label>Schedule (ISO)</label>
                <input value={editSchedule} onChange={(e) => setEditSchedule((e.target as HTMLInputElement).value)} />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn outline" onClick={() => setEditOpen(false)}>Cancel</button>
                  <button type="submit" className="btn primary">Save</button>
                </div>
              </div>
            </form>
          </Modal>

        </main>
      </div>

      <style jsx>{`
        .dashboardRoot { background: #f6faf6; min-height: 100vh; }
        .layout { display: grid; grid-template-columns: 240px 1fr; gap: 20px; max-width: 1100px; margin: 20px auto; }
        .side { position: sticky; top: 88px; align-self: start; }
        .main { background: #fff; padding: 18px; border-radius: 12px; box-shadow: 0 6px 18px rgba(16,24,40,0.05); }
        h1 { margin: 0 0 12px 0; color: #0f5132; }
        .tableWrap { overflow: auto; border-radius: 10px; background: #fff; border: 1px solid #eefaf0; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        thead th { text-align:left; padding:12px; background: linear-gradient(180deg,#f8fff9,#f2fff5); border-bottom:1px solid #eef6ee; color:#065f46; }
        tbody td { padding:12px; border-bottom:1px solid #f3f7f4; }
        .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace; color:#064e3b; }
        .muted { color:#6b7280; }
        .small { font-size:12px; }
        .badge { padding:6px 10px; border-radius:999px; font-weight:700; }
        .badge.scheduled { background:#ecfeff; color:#0ea5b7; border:1px solid #cffafe; }
        .badge.intransit { background:#fff7ed; color:#b45309; border:1px solid #ffedd5; }
        .badge.completed { background:#f6ffed; color:#15803d; border:1px solid #bbf7d0; }
        .badge.cancelled { background:#fff1f0; color:#a50b0b; border:1px solid #ffd6d6; }
        .btnDelete { padding:6px 12px; background:#dc2626; color:#fff; border:none; border-radius:6px; cursor:pointer; font-weight:600; font-size:12px; transition:all 0.2s; }
        .btnDelete:hover { background:#b91c1c; transform:translateY(-1px); box-shadow:0 2px 8px rgba(220,38,38,0.3); }
        .btnDelete:active { transform:translateY(0); }
        .note { padding:12px; color:#4b5563; }
        .error { padding:12px; color:#a50000; background:#fff1f0; border:1px solid #ffa39e; border-radius:8px; }
        @media (max-width:900px){ .layout{ grid-template-columns:1fr; } .side{ display:none; } }
      `}</style>
    </div>
  );
}
