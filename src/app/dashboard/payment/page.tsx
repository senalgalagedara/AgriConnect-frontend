"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/sidebar";
import Navbar from "../../../components/navbar";

/* ===================== Types ===================== */
export type Transaction = {
  id: string;                 // order id
  customerName: string;
  phone: string;
  email: string;
  total: number;
  createdAt: string;          // ISO timestamp
  paymentMethod?: "COD" | "CARD";
};

type SiteStats = {
  totalRevenue: number;
  totalOrders: number;
};

/* ============ Backend config (adjust if needed) ============ */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";

/** Expects: array of orders OR { data: [...] } */
// Use admin orders endpoint which returns order list with customer name, email, phone, total and created_at
const LIST_ORDERS_URL = `${API_BASE}/admin/orders`;

/** Optional stats endpoint. Fallback computes from orders if missing. */
const STATS_URL = `${API_BASE}/stats`; // alternative: `${API_BASE}/orders/stats`

/** DELETE /orders/:id */
const DELETE_ORDER_URL = (orderId: string | number) => `${API_BASE}/orders/${orderId}`;
/* =========================================================== */

export default function PaymentManagerPage() {
  const [orders, setOrders] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ---- Load orders ----
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const r = await fetch(LIST_ORDERS_URL, { cache: "no-store" });
        if (!r.ok) throw new Error(await r.text());
        const raw = await r.json();

        const list: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

        const normalized: Transaction[] = list.map((o: any) => {
          const id = (o.id ?? o.order_id ?? o.orderNo ?? o.order_no ?? "").toString();

          const customerName =
            (
              o.customer_name ??
              [o.contact?.firstName, o.contact?.lastName].filter(Boolean).join(" ") ??
              o.name ??
              ""
            ).toString().trim();

          const phone =
            (
              o.phone ??
              o.customer_phone ??
              o.contact?.phone ??
              o.shipping?.phone ??
              ""
            ).toString();

          const email =
            (o.email ?? o.customer_email ?? o.contact?.email ?? "").toString();

          const createdAt =
            (o.created_at ?? o.createdAt ?? o.paid_at ?? o.order_date ?? new Date().toISOString()).toString();

          const total = Number(o.total ?? o.amount ?? o.grand_total ?? 0);

          const method = ((o.method ?? o.paymentMethod ?? o.payment?.method ?? "").toString().toUpperCase());
          const paymentMethod: "COD" | "CARD" | undefined =
            method === "COD" ? "COD" : method === "CARD" ? "CARD" : undefined;

          return { id, customerName, phone, email, total, createdAt, paymentMethod };
        });

        setOrders(normalized);
      } catch (e: any) {
        console.error("Orders load failed:", e);
        setError(e?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---- Load stats (with fallback compute from orders) ----
  useEffect(() => {
    (async () => {
      try {
        setStatsLoading(true);
        let fetched: SiteStats | null = null;

        try {
          const r = await fetch(STATS_URL, { cache: "no-store" });
          if (r.ok) {
            const raw = await r.json();
            // Accept common shapes: {totalRevenue, totalOrders} OR {data:{...}}
            const src: any = raw?.data ?? raw;
            if (typeof src?.totalRevenue !== "undefined" && typeof src?.totalOrders !== "undefined") {
              fetched = {
                totalRevenue: Number(src.totalRevenue),
                totalOrders: Number(src.totalOrders),
              };
            }
          }
        } catch {
          // ignore network error; will fallback
        }

        if (!fetched) {
          // fallback: compute from loaded orders
          const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
          const totalOrders = orders.length;
          fetched = { totalRevenue, totalOrders };
        }

        setStats(fetched);
      } finally {
        setStatsLoading(false);
      }
    })();
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((t) => {
      return (
        t.id.toLowerCase().includes(q) ||
        (t.customerName || "").toLowerCase().includes(q) ||
        (t.phone || "").toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q)
      );
    });
  }, [orders, query]);

  const onDelete = async (id: string) => {
    if (!confirm(`Delete order ${id}?`)) return;
    try {
      setDeletingId(id);
      const r = await fetch(DELETE_ORDER_URL(id), { method: "DELETE" });
      if (!r.ok) throw new Error(await r.text());
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (e: any) {
      alert(`Could not delete: ${e?.message || "Unknown error"}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main">
        <Navbar />
        <div className="content">
          {/* Top brand/header */}
          <div className="header-row">
            <h1 className="brand">AgriConnect</h1>
            <div className="spacer" />
          </div>

          {/* KPI cards */}
          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-icon" aria-hidden>👥</div>
              <div className="kpi-meta">
                <span className="kpi-label">Total Revenue</span>
                <span className="kpi-value">
                  {statsLoading ? "…" : `Rs.${(stats?.totalRevenue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                </span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon" aria-hidden>👥</div>
              <div className="kpi-meta">
                <span className="kpi-label">Total Orders</span>
                <span className="kpi-value">
                  {statsLoading ? "…" : (stats?.totalOrders ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Table + search */}
          <div className="toolbar">
            <h2 className="title">Recent orders</h2>
            <div className="search-wrap">
              <input
                placeholder="Search by order, name, phone, email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search"
              />
            </div>
          </div>

          <div className="card table-wrap">
            {loading ? (
              <div className="loading">Loading orders…</div>
            ) : error ? (
              <div className="error">Error: {error}</div>
            ) : (
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>PhoneNo</th>
                      <th>Email</th>
                      <th>Order Date</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>{t.customerName || "—"}</td>
                        <td>{t.phone || "—"}</td>
                        <td>{t.email || "—"}</td>
                        <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td>Rs.{Number(t.total).toFixed(2)}</td>
                        <td>
                          <button
                            className="delete-btn"
                            onClick={() => onDelete(t.id)}
                            disabled={deletingId === t.id}
                            title="Delete order"
                          >
                            {deletingId === t.id ? "Deleting…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!filtered.length && (
                      <tr>
                        <td colSpan={7} className="empty">No orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <p className="footnote">View-only: Payment Manager has no edit permissions.</p>
          </div>
        </div>

        {/* ---------- Styles (no Tailwind) ---------- */}
        <style jsx>{`
          .dashboard {
            display: flex; min-height: 100vh;
            background: #f6f7fb; color: #111827;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          }
          .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
          .content { padding: 24px; max-width: 1200px; margin: 0 auto; width: 100%; }

          .header-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
          .brand { margin: 0; font-size: 22px; font-weight: 800; color: #10b981; }
          .spacer { flex: 1; }

          .kpi-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-bottom: 18px; }
          .kpi-card {
            display: flex; align-items: center; gap: 14px;
            background: white; border-radius: 16px; padding: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          }
          .kpi-icon {
            width: 44px; height: 44px; display: grid; place-items: center;
            background: #e6f9f2; border-radius: 999px; font-size: 22px;
          }
          .kpi-meta { display: grid; }
          .kpi-label { font-size: 12px; color: #6b7280; }
          .kpi-value { font-size: 20px; font-weight: 700; }

          .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 8px 0 12px; }
          .title { margin: 0; font-size: 18px; font-weight: 700; }
          .search-wrap { display: flex; gap: 8px; }
          .search {
            width: 280px; max-width: 60%; padding: 10px 12px; border: 1px solid #e5e7eb;
            border-radius: 10px; background: #fff; outline: none;
          }
          .search:focus { border-color: #10b981; }

          .card { background: #fff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .table-wrap { overflow-x: auto; }
          .table-card { border-radius: 12px; overflow-x: auto; }
          table { width: 100%; border-collapse: collapse; }
          thead { background: #f3f4f6; }
          th, td {
            padding: 14px 16px; text-align: left; white-space: nowrap;
            border-bottom: 1px solid #e5e7eb; font-size: 0.95rem;
          }
          tr:hover td { background: #f9fafb; }

          .delete-btn { background: #b91c1c; color: #fff; border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer; }
          .delete-btn:hover:not([disabled]) { background: #991b1b; }
          .delete-btn[disabled] { opacity: .6; cursor: not-allowed; }

          .loading, .error, .empty { padding: 20px; text-align: center; color: #6b7280; }
          .error { color: #b91c1c; }

          .footnote { margin: 10px 12px; font-size: 12px; color: #6b7280; }

          @media (max-width: 860px) {
            .content { padding: 16px; }
            .kpi-row { grid-template-columns: 1fr; }
            .toolbar { flex-direction: column; align-items: stretch; gap: 10px; }
            .search { max-width: 100%; width: 100%; }
            th, td { padding: 10px 12px; }
          }
        `}</style>
      </div>
    </div>
  );
}
