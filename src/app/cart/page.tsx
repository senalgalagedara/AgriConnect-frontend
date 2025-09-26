'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api';
const USER_ID = "02a6e5c3-67f3-463c-aebd-3c1a38d7466b"; // real uuid


type CartItem = {
  id: number;          // cart_items.id
  product_id: number;  // products.id
  name: string;
  price: number;
  qty: number;
};

type Totals = { subtotal: number; tax: number; shippingFee: number; total: number };
type Contact = { firstName: string; lastName: string; email: string; phone: string };
type Shipping = { house: string; address: string; city: string; state: string; postalCode: string; landmark?: string; sameAsBilling: boolean };

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]); // always an array
  const [totals, setTotals] = useState<Totals>({ subtotal: 0, tax: 0, shippingFee: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [contact, setContact] = useState<Contact>({ firstName: '', lastName: '', email: '', phone: '' });
  const [shipping, setShipping] = useState<Shipping>({
    house: '', address: '', city: '', state: '', postalCode: '', landmark: '', sameAsBilling: true,
  });

  // fetch cart on load
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const r = await fetch(`${API_BASE}/cart/${USER_ID}`, { cache: 'no-store' });
        const data = await r.json();
        // 👇 defensive guards
        setCart(Array.isArray(data?.items) ? data.items : []);
        setTotals(typeof data?.totals === 'object' && data.totals
          ? data.totals
          : { subtotal: 0, tax: 0, shippingFee: 0, total: 0 });
      } catch (e: any) {
        setErr(e?.message || 'Failed to load cart');
        setCart([]); // keep it an array so .map is safe
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateQty = async (itemId: number, nextQty: number) => {
    try {
      const r = await fetch(`${API_BASE}/cart/${USER_ID}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: nextQty }),
      });
      const data = await r.json();
      setCart(Array.isArray(data?.items) ? data.items : []);
      setTotals(data?.totals ?? { subtotal: 0, tax: 0, shippingFee: 0, total: 0 });
    } catch {
      // keep UI stable if the request fails
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const r = await fetch(`${API_BASE}/cart/${USER_ID}/items/${itemId}`, { method: 'DELETE' });
      const data = await r.json();
      setCart(Array.isArray(data?.items) ? data.items : []);
      setTotals(data?.totals ?? { subtotal: 0, tax: 0, shippingFee: 0, total: 0 });
    } catch {}
  };

  const onCheckout = async () => {
    const res = await fetch(`${API_BASE}/orders/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID, contact, shipping }),
    });
    if (!res.ok) {
      const msg = await res.text();
      alert(`Checkout failed: ${msg}`);
      return;
    }
    const order = await res.json();
    router.push(`/order/${order.order.id}`);
  };

  return (
    <div className="page">
      <div>
        <h1 className="brand">AgriConnect</h1>
        <h2 className="section-title">Order Summary</h2>

        {loading && <div className="card">Loading cart…</div>}
        {err && <div className="card error">Error: {err}</div>}

        {!loading && !err && (
          <>
            {cart.length === 0 && <div className="card">Your cart is empty.</div>}

            {cart.map((item) => (
              <div key={item.id} className="order-item">
                <div className="order-item-left">
                  <div className="order-item-img" aria-hidden>🥬</div>
                  <div>
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">${Number(item.price).toFixed(2)}</div>
                  </div>
                </div>
                <div className="order-actions">
                  <button
                    className="qty-btn"
                    onClick={() => updateQty(item.id, Math.max(0, item.qty - 1))}
                    aria-label="decrease"
                  >−</button>
                  <span className="qty-val">{item.qty}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    aria-label="increase"
                  >+</button>
                  <button className="remove" onClick={() => removeItem(item.id)} title="Remove">🗑️</button>
                </div>
              </div>
            ))}

            <div className="card">
              <div className="row"><span className="label">Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
              <div className="row"><span className="label">Sales tax</span><span>${totals.tax.toFixed(2)}</span></div>
              <div className="total"><span className="total-label">Total due</span><span className="total-value">${totals.total.toFixed(2)}</span></div>
            </div>
          </>
        )}
      </div>

      <div className="right">
        <div className="stepper">
          <span className="step-active">Shipping</span>
          <span className="sep">—</span>
          <span className="step">Payment</span>
        </div>

        <section className="card">
          <h3 className="sub-title">Contact Details</h3>
          <div className="grid two-col">
            <Field label="First Name" value={contact.firstName} onChange={(v) => setContact({ ...contact, firstName: v })} />
            <Field label="Last Name" value={contact.lastName} onChange={(v) => setContact({ ...contact, lastName: v })} />
          </div>
          <div className="grid">
            <Field label="Email" type="email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
            <Field label="Phone" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
          </div>
        </section>

        <section className="card">
          <h3 className="sub-title">Shipping Details</h3>
          <div className="grid">
            <Field label="Flat/House no." value={shipping.house} onChange={(v) => setShipping({ ...shipping, house: v })} />
            <Field label="Address" value={shipping.address} onChange={(v) => setShipping({ ...shipping, address: v })} />
            <div className="grid two-col">
              <Field label="City" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} />
              <Field label="State" value={shipping.state} onChange={(v) => setShipping({ ...shipping, state: v })} />
            </div>
            <div className="grid two-col">
              <Field label="Postal Code" value={shipping.postalCode} onChange={(v) => setShipping({ ...shipping, postalCode: v })} />
              <Field label="Famous Landmark" value={shipping.landmark ?? ''} onChange={(v) => setShipping({ ...shipping, landmark: v })} />
            </div>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={shipping.sameAsBilling}
                onChange={(e) => setShipping({ ...shipping, sameAsBilling: e.target.checked })}
              />
              <span>My shipping and Billing address are the same</span>
            </label>
          </div>

          <div className="actions">
            <button className="btn" onClick={onCheckout}>Continue</button>
          </div>
        </section>
      </div>

      {/* CUSTOM CSS */}
      <style jsx>{`
        :global(html), :global(body) { margin: 0; padding: 0; }
        .page {
          min-height: 100vh; background: #f9fafb;
          display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
          max-width: 1200px; margin: 0 auto; padding: 2rem 1rem;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
          color: #111827;
        }
        @media (max-width: 1024px) { .page { grid-template-columns: 1fr; } }
        .brand { font-size: 1.5rem; font-weight: 600; color: #047857; margin: 0 0 1rem; }
        .section-title { font-size: 1.125rem; font-weight: 500; margin: 0 0 0.75rem; }
        .card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .error { border: 1px solid #fecaca; background: #fff1f2; }
        .order-item { display: flex; justify-content: space-between; align-items: center; background: #fff; border-radius: 12px; padding: 12px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); margin-bottom: 10px; }
        .order-item-left { display: flex; gap: 12px; align-items: center; }
        .order-item-img { width: 48px; height: 48px; border-radius: 8px; background: #ecfdf5; display: flex; align-items: center; justify-content: center; }
        .item-name { font-weight: 500; }
        .item-price { color: #6b7280; font-size: 0.9rem; }
        .order-actions { display: flex; align-items: center; gap: 10px; }
        .qty-btn { width: 32px; height: 32px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; cursor: pointer; }
        .qty-val { min-width: 24px; text-align: center; }
        .remove { border: none; background: none; color: #9ca3af; cursor: pointer; }
        .remove:hover { color: #dc2626; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; }
        .label { color: #4b5563; }
        .total { display: flex; justify-content: space-between; align-items: center; padding-top: 10px; }
        .total-label { font-weight: 500; }
        .total-value { font-weight: 600; color: #047857; }
        .right { display: flex; flex-direction: column; gap: 24px; }
        .stepper { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
        .step-active { color: #047857; font-weight: 600; } .step, .sep { color: #9ca3af; }
        .sub-title { margin: 0 0 10px; font-weight: 500; }
        .grid { display: grid; gap: 12px; }
        .two-col { grid-template-columns: 1fr 1fr; } @media (max-width: 640px) { .two-col { grid-template-columns: 1fr; } }
        .field { font-size: 0.9rem; color: #4b5563; }
        .field-label { margin-bottom: 4px; display: block; }
        .input { width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; outline: none; }
        .input:focus { border-color: #047857; }
        .checkbox { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: #374151; }
        .actions { display: flex; justify-content: flex-end; padding-top: 12px; }
        .btn { background: #047857; color: #fff; border: none; border-radius: 10px; padding: 10px 20px; cursor: pointer; }
        .btn:hover { background: #065f46; }
      `}</style>
    </div>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  const { label, value, onChange, type = 'text' } = props;
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}
