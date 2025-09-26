'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api';
// IMPORTANT: use your real logged-in user's id (UUID if your DB uses uuid)
const USER_ID = '02a6e5c3-67f3-463c-aebd-3c1a38d7466b';

type CartItem = {
  id: number;          // cart_items.id
  product_id: number;  // products.id
  name: string;
  price: number;
  qty: number;
};

type Totals = { subtotal: number; tax: number; shippingFee: number; total: number };

type ContactDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type ShippingDetails = {
  house: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
  sameAsBilling: boolean;
};

type CheckoutData = {
  cart: { id: string; name: string; price: number; qty: number }[]; // from previous step (if present)
  contact: ContactDetails;
  shipping: ShippingDetails;
  totals: Totals;
};

export default function PaymentPage() {
  const router = useRouter();

  // Summary pulled from backend
  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<Totals>({ subtotal: 0, tax: 0, shippingFee: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Data from shipping step (kept so we can send contact+shipping to backend at checkout)
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);

  const [method, setMethod] = useState<'COD' | 'CARD'>('COD');
  const [card, setCard] = useState({ number: '', mmYY: '', cvv: '' });
  const disablePay = useMemo(() => (method === 'COD' ? false : !(card.number && card.mmYY && card.cvv)), [method, card]);

  // Load backend cart + (optional) shipping step payload
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`${API_BASE}/cart/${USER_ID}`, { cache: 'no-store' });
        const data = await r.json();
        setItems(Array.isArray(data?.items) ? data.items : []);
        setTotals(data?.totals ?? { subtotal: 0, tax: 0, shippingFee: 0, total: 0 });
      } catch (e: any) {
        setErr(e?.message || 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    })();

    // If your shipping page saved contact+shipping, read it:
    try {
      const raw = localStorage.getItem('checkout');
      if (raw) setCheckout(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const onPay = async () => {
    try {
      if (!checkout?.contact || !checkout?.shipping) {
        alert('Missing contact/shipping details from the previous step.');
        return;
      }

      // Create order in DB from the active cart + provided details
      const res = await fetch(`${API_BASE}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          contact: checkout.contact,
          shipping: checkout.shipping,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        alert(`Checkout failed: ${text}`);
        return;
      }

      const order = await res.json(); // { order, items }
      // If you later add a payment capture endpoint, call it here
      // e.g. POST /api/orders/:id/pay with { method, card_last4 }

      // Redirect to an order page (or your invoice page)
      router.push(`/order/${order.order.id}`);
    } catch (e: any) {
      alert(`Checkout failed: ${e?.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="page">
      {/* LEFT: Summary */}
      <div>
        <div className="stepper">
          <span className="step">Shipping</span>
          <span className="sep">—</span>
          <span className="step-active">Payment</span>
        </div>

        <h2 className="title">Order Summary</h2>

        {loading && <div className="card">Loading cart…</div>}
        {err && <div className="card error">Error: {err}</div>}

        {!loading && !err && (
          <>
            {items.length === 0 && <div className="card">Your cart is empty.</div>}

            {items.map((item) => (
              <div key={item.id} className="order-item">
                <div className="order-left">
                  <div className="thumb" aria-hidden>🥬</div>
                  <div>
                    <div className="name">{item.name}</div>
                    <div className="muted">Qty: {item.qty}</div>
                  </div>
                </div>
                <div className="price">${(Number(item.price) * item.qty).toFixed(2)}</div>
              </div>
            ))}

            <div className="card">
              <div className="row"><span className="muted">Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
              <div className="row"><span className="muted">Sales tax (6.5%)</span><span>${totals.tax.toFixed(2)}</span></div>
              <div className="row"><span className="muted">Shipping Fee</span><span>{totals.shippingFee ? `$${totals.shippingFee.toFixed(2)}` : 'FREE'}</span></div>
              <div className="total">
                <span className="total-label">Total due</span>
                <span className="total-value">${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* RIGHT: Payment */}
      <div>
        <div className="card">
          <h3 className="subtitle">Payment Methods</h3>

          <label className="radio">
            <input type="radio" name="pay" checked={method === 'COD'} onChange={() => setMethod('COD')} />
            <div>
              <div className="radio-title">Pay on Delivery</div>
              <div className="muted small">Pay with cash on delivery</div>
            </div>
          </label>

          <label className="radio">
            <input type="radio" name="pay" checked={method === 'CARD'} onChange={() => setMethod('CARD')} />
            <div className="wfull">
              <div className="radio-title">Credit/Debit Cards</div>
              <div className="muted small mb">Pay with your Credit / Debit Card</div>

              <div className="grid">
                <input
                  disabled={method !== 'CARD'}
                  placeholder="Card number"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                  className="input"
                />
                <div className="grid2">
                  <input
                    disabled={method !== 'CARD'}
                    placeholder="MM / YY"
                    value={card.mmYY}
                    onChange={(e) => setCard({ ...card, mmYY: e.target.value })}
                    className="input"
                  />
                  <input
                    disabled={method !== 'CARD'}
                    placeholder="CVV"
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
            </div>
          </label>

          <div className="actions">
            <button className="btn ghost" onClick={() => history.back()}>Back</button>
            <button className="btn primary" disabled={disablePay} onClick={onPay}>Pay</button>
          </div>
        </div>
      </div>

      {/* ---------------- CUSTOM CSS (no Tailwind) ---------------- */}
      <style jsx>{`
        :global(html), :global(body) { margin: 0; padding: 0; background: #f9fafb; }
        .page {
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          color: #111827;
        }
        @media (max-width: 1024px) { .page { grid-template-columns: 1fr; } }

        .stepper { display: flex; gap: 8px; align-items: center; margin-bottom: 1.25rem; font-size: 0.95rem; }
        .step { color: #6b7280; }
        .step-active { color: #047857; font-weight: 600; }
        .sep { color: #9ca3af; }

        .title { font-size: 1.125rem; font-weight: 500; margin: 0 0 1rem; }
        .subtitle { margin: 0 0 0.75rem; font-weight: 500; }

        .card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .error { border: 1px solid #fecaca; background: #fff1f2; }

        .order-item { background: #fff; border-radius: 12px; padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
        .order-left { display: flex; gap: 12px; align-items: center; }
        .thumb { width: 48px; height: 48px; border-radius: 8px; background: #ecfdf5; display: flex; align-items: center; justify-content: center; }
        .name { font-weight: 500; }
        .muted { color: #6b7280; }
        .small { font-size: 0.875rem; }
        .mb { margin-bottom: 10px; }
        .price { font-weight: 500; }

        .row { display: flex; justify-content: space-between; padding: 6px 0; }
        .total { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; }
        .total-label { font-weight: 500; }
        .total-value { font-weight: 600; color: #047857; }

        .radio { display: flex; gap: 12px; align-items: flex-start; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; margin-bottom: 12px; cursor: pointer; }
        .radio input { margin-top: 4px; }
        .radio-title { font-weight: 500; }
        .wfull { width: 100%; }

        .grid { display: grid; gap: 10px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .input { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 10px; outline: none; }
        .input:disabled { background: #f3f4f6; }
        .input:focus { border-color: #047857; }

        .actions { display: flex; justify-content: space-between; align-items: center; margin-top: 1.25rem; }
        .btn { border: 1px solid transparent; border-radius: 10px; padding: 10px 20px; cursor: pointer; }
        .btn.primary { background: #047857; color: #fff; }
        .btn.primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn.primary:hover:not(:disabled) { background: #065f46; }
        .btn.ghost { background: #fff; border-color: #e5e7eb; color: #374151; }
        .btn.ghost:hover { background: #f3f4f6; }
      `}</style>
    </div>
  );
}
