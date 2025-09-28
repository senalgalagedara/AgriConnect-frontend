"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/sidebar";
import Navbar from "../../../components/navbar";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

export type Transaction = {
  id: string;              // order id
  customerName: string;
  email: string;
  total: number;
  paymentMethod: "COD" | "CARD";
  createdAt: string;       // ISO
  items?: CartItem[];
};

/* ========= CONFIGURE THESE TO MATCH YOUR BACKEND ========= */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:5000/api";
// Example: GET /orders/paid  -> returns array of paid orders or {success, data: [...]}
const LIST_ORDERS_URL = `${API_BASE}/orders/paid`;
// Example: DELETE /orders/:orderId -> deletes/cancels order
const DELETE_ORDER_URL = (orderId: string | number) => `${API_BASE}/orders/${orderId}`;
/* ========================================================= */

export default function PaymentManagerPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const r = await fetch(LIST_ORDERS_URL, { cache: "no-store" });
        if (!r.ok) throw new Error(await r.text());

        const raw = await r.json();
        const list: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];

        // normalize various backend shapes to our Transaction type
        const normalized: Transaction[] = list.map((o: any) => {
          // robust full name + email extraction
          const fullName =
            (o.customer_name ??
              [o.contact?.firstName, o.contact?.lastName].filter(Boolean).join(" ") ??
              o.name ??
              "") + "";

          const email = (o.email ?? o.contact?.email ?? o.customer_email ?? "") + "";

          // timestamps commonly use created_at/createdAt
          const createdAt =
            (o.created_at ?? o.createdAt ?? o.paid_at ?? new Date().toISOString()) + "";

          // paid method might be on o.method / o.payment?.method
          const method = ((o.method ?? o.paymentMethod ?? o.payment?.method ?? "CARD") + "").toUpperCase();
          const asMethod: "COD" | "CARD" = method === "COD" ? "COD" : "CARD";

          const id = (o.id ?? o.order_id ?? o.orderNo ?? o.order_no ?? "").toString();

          return {
            id,
            customerName: fullName.trim(),
            email,
            total: Number(o.total ?? o.amount ?? 0),
            paymentMethod: asMethod,
            createdAt,
          };
        });

        setTxs(normalized);
      } catch (e: any) {
        console.error("Failed to load orders:", e);
        setErr(e?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return txs;
    return txs.filter(
      (t) =>
        String(t.id).toLowerCase().includes(q) ||
        (t.customerName || "").toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q)
    );
  }, [txs, query]);

  const onDelete = async (id: string) => {
    if (!confirm(`Delete order ${id}?`)) return;
    try {
      setDeletingId(id);
      const r = await fetch(DELETE_ORDER_URL(id), { method: "DELETE" });
      if (!r.ok) {
        const msg = await r.text();
        throw new Error(msg || "Delete failed");
      }
      setTxs((prev) => prev.filter((t) => t.id !== id));
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
          <div className="header-row">
            <h1 className="brand">AgriConnect</h1>
            <div className="spacer" />
          </div>

          <div className="toolbar">
            <h2 className="title">Transactions</h2>
            <input
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search"
            />
          </div>

          <div className="card table-wrap">
            {loading ? (
              <div className="loading">Loading orders…</div>
            ) : err ? (
              <div className="error">Error: {err}</div>
            ) : (
              <div className="table-card">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Name</th>
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
                        <td>{t.email}</td>
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
                        <td colSpan={6} className="empty">
                          No transactions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <p className="footnote">View-only: Payment Manager has no edit permissions.</p>
          </div>
        </div>

        {/* ---------- CUSTOM CSS (no Tailwind) ---------- */}
        <style jsx>{`
          .dashboard {
            display: flex;
            min-height: 100vh;
            background: #f6f7fb;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
            color: #111827;
          }

          .main {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
          }

          .content {
            padding: 24px;
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
          }

          .header-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
          }
          .brand { margin: 0; font-size: 20px; font-weight: 700; color: #047857; }
          .spacer { flex: 1; }

          .toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin: 12px 0 16px;
          }
          .title { margin: 0; font-size: 18px; font-weight: 600; }
          .search {
            width: 260px;
            max-width: 50%;
            padding: 10px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            outline: none;
            background: #fff;
          }
          .search:focus { border-color: #047857; }

          .card {
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .table-wrap { overflow-x: auto; }

          .table-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
            overflow-x: auto;
          }
          table { width: 100%; border-collapse: collapse; }
          thead { background: #f3f4f6; }
          th, td {
            padding: 14px 16px;
            font-size: 0.95rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
            white-space: nowrap;
          }
          tr:hover td { background: #f9fafb; }

          .delete-btn {
            background: #b91c1c;
            color: #fff;
            border: none;
            border-radius: 6px;
            padding: 6px 12px;
            cursor: pointer;
          }
          .delete-btn[disabled] { opacity: 0.6; cursor: not-allowed; }
          .delete-btn:hover:not([disabled]) { background: #991b1b; }

          .loading, .error, .empty {
            text-align: center;
            padding: 20px;
            color: #6b7280;
          }
          .error { color: #b91c1c; }

          .footnote {
            margin-top: 10px;
            font-size: 12px;
            color: #6b7280;
          }

          @media (max-width: 860px) {
            .content { padding: 16px; }
            .toolbar { flex-direction: column; align-items: stretch; gap: 10px; }
            .search { max-width: 100%; width: 100%; }
            th, td { padding: 10px 12px; }
          }
        `}</style>
      </div>
    </div>
  );
}
