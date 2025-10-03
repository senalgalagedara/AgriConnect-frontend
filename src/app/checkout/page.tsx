'use client';

import { useEffect, useMemo, useState } from 'react';
import { RequireAuth } from '@/components/RequireAuth';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/NavbarHome';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api';
const USER_ID = 1;

export type CartItem = {
  id: number;
  product_id: number;
  name: string;
  price: number; // per item
  qty: number;
  unit?: string;
  image?: string;
};

export type ContactDetails = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type ShippingDetails = {
  house: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
  sameAsBilling: boolean;
};

export type CheckoutData = {
  orderId: number; // will be hydrated from backend if missing locally
  cart: CartItem[];
  contact: ContactDetails;
  shipping: ShippingDetails;
  totals: {
    subtotal: number;
    tax: number;
    shippingFee: number;
    total: number;
  };
};

export type Transaction = {
  id: number; // order id
  customerName: string;
  email: string;
  total: number;
  paymentMethod: 'COD' | 'CARD';
  createdAt: string; // ISO
  items: CartItem[];
};

function extractOrderId(json: any): number | null {
  // Support multiple shapes the backend might return
  if (!json || typeof json !== 'object') return null;

  if (typeof json.orderId === 'number') return json.orderId;
  if (typeof json.id === 'number') return json.id;

  // Sometimes backend wraps it
  if (json.order && typeof json.order.id === 'number') return json.order.id;
  if (Array.isArray(json.orders) && json.orders.length && typeof json.orders[0]?.id === 'number') {
    return json.orders[0].id;
  }
  return null;
}

async function tryGetOrderIdFrom(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    return extractOrderId(json);
  } catch {
    return null;
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const [data, setData] = useState<CheckoutData | null>(null);
  const [method, setMethod] = useState<'COD' | 'CARD'>('COD');
  const [card, setCard] = useState({ number: '', mmYY: '', cvv: '' });
  const [processing, setProcessing] = useState(false);

  const getOrderIdFromBackend = async (): Promise<number | null> => {
    // 1) Prefer a local pending id if present (your flow clears this after success)
    const localPending = Number(localStorage.getItem('pendingOrderId') || NaN);
    if (!Number.isNaN(localPending) && localPending > 0) {
      return localPending;
    }

    // 2) Try a few conventional endpoints that return the *pending* order for a user
    const candidates = [
      // Common patterns – adjust to match your backend if you have a known URL
      `${API_BASE}/orders/pending?userId=${USER_ID}`,
      `${API_BASE}/users/${USER_ID}/orders/pending`,
      `${API_BASE}/orders?userId=${USER_ID}&status=pending`,
      // If your backend exposes "latest" or "open" order:
      `${API_BASE}/orders/latest?userId=${USER_ID}`,
    ];

    for (const url of candidates) {
      const id = await tryGetOrderIdFrom(url);
      if (id) return id;
    }

    // 3) Last resort: if someone stored only userId on the server, this will fail (as you saw).
    // We keep it as a final fallback in case your backend actually maps /orders/:id to the latest order for that user.
    const misguided = await tryGetOrderIdFrom(`${API_BASE}/orders/${USER_ID}`);
    if (misguided) return misguided;

    return null;
  };

  useEffect(() => {
    (async () => {
      try {
        // Prefer the new consolidated data blob
        const orderData = localStorage.getItem('orderData');
        const legacyCheckout = localStorage.getItem('checkout');
        let parsed: CheckoutData | null = null;

        if (orderData) {
          parsed = JSON.parse(orderData);
        } else if (legacyCheckout) {
          parsed = JSON.parse(legacyCheckout);
        }

        // If we have some checkout data but no orderId, hydrate it from backend
        if (parsed && (!parsed.orderId || Number.isNaN(parsed.orderId))) {
          const backendOrderId = await getOrderIdFromBackend();
          if (backendOrderId) {
            const updated = { ...parsed, orderId: backendOrderId };
            setData(updated);
            localStorage.setItem('orderData', JSON.stringify(updated)); // keep local in sync
          } else {
            // couldn't get order id; still show page but paying will fail
            setData(parsed);
          }
        } else {
          setData(parsed);
        }
      } catch {
        setData(null);
      }
    })();
  }, []);

  const disablePay = useMemo(() => {
    if (processing) return true;
    if (method === 'COD') return false;
    return !(card.number && card.mmYY && card.cvv);
  }, [method, card, processing]);

  const onPay = async () => {
    if (!data) return;

    // Prevent accidental double clicks
    if (processing) return;

    let orderId = data.orderId;
    if (!orderId) {
      const fetched = await getOrderIdFromBackend();
      if (fetched) {
        orderId = fetched;
        const updated = { ...data, orderId: fetched };
        setData(updated);
        localStorage.setItem('orderData', JSON.stringify(updated));
      } else {
        alert('Could not find your order on the server. Please go back to Cart and try again.');
        return;
      }
    }

    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'processing',
          paymentMethod: method,
        }),
      });

      if (!response.ok) {
        let message = 'Failed to update order';
        try {
          const error = await response.json();
          message = error?.message || message;
        } catch { }
        throw new Error(message);
      }

      // Create a transaction + "invoice"
      const tx: Transaction = {
        id: orderId,
        customerName: `${data.contact.firstName} ${data.contact.lastName}`.trim(),
        email: data.contact.email,
        total: data.totals.total,
        paymentMethod: method,
        createdAt: new Date().toISOString(),
        items: data.cart,
      };

      // save for invoice + manager
      const all = JSON.parse(localStorage.getItem('transactions') || '[]') as Transaction[];
      all.unshift(tx);
      localStorage.setItem('transactions', JSON.stringify(all));
      localStorage.setItem('lastInvoice', JSON.stringify(tx));

      // Clear order data
      localStorage.removeItem('orderData');
      localStorage.removeItem('pendingOrderId');

      router.push('/invoice');
    } catch (error) {
      console.error('Payment processing error:', error);
      alert(error instanceof Error ? error.message : 'Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar cartItemCount={0} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No checkout data found</h2>
            <p className="text-gray-500 mb-6">Please go back to your cart to proceed with checkout.</p>
            <button
              onClick={() => router.push('/cart')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { cart, totals } = data;

  return (
    <RequireAuth>
    <div className="min-h-screen bg-gray-50">
      <Navbar cartItemCount={cart.reduce((sum, item) => sum + item.qty, 0)} />
      <div className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Summary (readonly) */}
        <div>
          <div className="flex items-center gap-3 text-sm mb-6">
            <span className="text-gray-500">Shipping</span>
            <span className="text-gray-400">—</span>
            <span className="text-green-700 font-medium">Payment</span>
          </div>

          <h2 className="text-lg font-medium mb-4">Order Summary</h2>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">🥬</div>
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-500 text-sm">Qty: {item.qty}</div>
                  </div>
                </div>
                <div className="font-medium">${(item.price * item.qty).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-white p-4 shadow-sm divide-y">
            <Row label="Subtotal" value={`$${totals.subtotal.toFixed(2)}`} />
            <Row label={`Sales tax (6.5%)`} value={`$${totals.tax.toFixed(2)}`} />
            <Row label="Shipping Fee" value={totals.shippingFee ? `$${totals.shippingFee.toFixed(2)}` : 'FREE'} />
            <div className="flex items-center justify-between pt-3">
              <span className="font-medium">Total due</span>
              <span className="font-semibold text-green-700">${totals.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right: Payment methods */}
        <div className="space-y-6">
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-medium mb-4">Payment Methods</h3>

            <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer mb-3">
              <input
                type="radio"
                name="pay"
                checked={method === 'COD'}
                onChange={() => setMethod('COD')}
                className="mt-1"
              />
              <div>
                <div className="font-medium">Pay on Delivery</div>
                <div className="text-sm text-gray-500">Pay with cash on delivery</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer">
              <input
                type="radio"
                name="pay"
                checked={method === 'CARD'}
                onChange={() => setMethod('CARD')}
                className="mt-1"
              />
              <div className="w-full">
                <div className="font-medium">Credit/Debit Cards</div>
                <div className="text-sm text-gray-500 mb-3">Pay with your Credit / Debit Card</div>

                <div className="grid grid-cols-1 gap-3">
                  <input
                    disabled={method !== 'CARD'}
                    placeholder="Card number"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none disabled:bg-gray-50"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      disabled={method !== 'CARD'}
                      placeholder="MM / YY"
                      value={card.mmYY}
                      onChange={(e) => setCard({ ...card, mmYY: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none disabled:bg-gray-50"
                    />
                    <input
                      disabled={method !== 'CARD'}
                      placeholder="CVV"
                      value={card.cvv}
                      onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </label>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="rounded-lg border px-6 py-2 text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
              <button
                disabled={disablePay}
                onClick={onPay}
                className="rounded-lg bg-green-700 px-8 py-2 text-white hover:bg-green-800 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Pay'}
              </button>
            </div>
          </section>
        </div>
      </div>
      <style jsx>{`:root {
    --pg-bg: #f7f8fa;
    --pg-card: #ffffff;
    --pg-border: #e5e7eb;
    --pg-text: #1f2937;
    --pg-muted: #6b7280;
    --pg-primary: #0f7a43;   /* base (close to tailwind green-700) */
    --pg-primary-600: #12824a;
    --pg-primary-700: #0d6a3b;
    --pg-primary-800: #0a5a32;
    --pg-focus: 0 0 0 3px rgba(16, 185, 129, 0.25);
    --pg-shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --pg-shadow-md: 0 4px 10px rgba(0,0,0,0.08);
    --pg-shadow-lg: 0 10px 24px rgba(0,0,0,0.12);
    --pg-radius-lg: 14px;
    --pg-radius-xl: 16px;
    --pg-radius-2xl: 18px;
  }

  /* Page background & typography */
  .min-h-screen.bg-gray-50 {
    background: radial-gradient(1200px 600px at 10% -10%, #e8f5ee 0%, transparent 55%),
                radial-gradient(1200px 600px at 110% 10%, #eef7f2 0%, transparent 55%),
                var(--pg-bg) !important;
    color: var(--pg-text);
  }

  /* Container breathing room */
  .max-w-6xl.px-4.py-10 {
    padding-top: 3rem !important;
    padding-bottom: 3rem !important;
  }

  /* Stepper */
  .flex.items-center.gap-3.text-sm.mb-6 {
    gap: .625rem !important;
    margin-bottom: 1.75rem !important;
  }
  .text-green-700.font-medium {
    color: var(--pg-primary) !important;
    font-weight: 600 !important;
  }

  /* Generic "card" look */
  .rounded-xl.bg-white.shadow-sm {
    background: var(--pg-card) !important;
    border: 1px solid var(--pg-border);
    box-shadow: var(--pg-shadow-sm);
    border-radius: var(--pg-radius-xl);
    transition: box-shadow .2s ease, transform .1s ease;
  }
  .rounded-xl.bg-white.shadow-sm:hover {
    box-shadow: var(--pg-shadow-md);
  }

  /* Order items row hover lift */
  .space-y-4 > .flex.items-center.justify-between.rounded-xl.bg-white.p-4.shadow-sm:hover {
    transform: translateY(-1px);
  }

  /* Order summary totals block divider polish */
  .divide-y > * + * {
    border-top: 1px dashed var(--pg-border) !important;
  }

  /* Labels & subtle text */
  .text-gray-600 { color: #475569 !important; }
  .text-gray-700 { color: #334155 !important; }
  .text-gray-500 { color: var(--pg-muted) !important; }

  /* Buttons */
  button.rounded-lg.bg-green-700 {
    background: linear-gradient(180deg, var(--pg-primary-600), var(--pg-primary-800));
    border: 1px solid rgba(0,0,0,0.05);
    border-radius: 12px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), var(--pg-shadow-md);
    transition: transform .06s ease, box-shadow .2s ease, filter .2s ease;
  }
  button.rounded-lg.bg-green-700:hover:not(:disabled) {
    filter: brightness(1.02);
    box-shadow: var(--pg-shadow-lg);
    transform: translateY(-1px);
  }
  button.rounded-lg.bg-green-700:active:not(:disabled) {
    transform: translateY(0);
    filter: brightness(.98);
  }
  button.rounded-lg.bg-green-700:disabled {
    opacity: .6 !important;
    cursor: not-allowed !important;
    box-shadow: var(--pg-shadow-sm);
  }

  button.rounded-lg.border {
    border-radius: 12px !important;
    border: 1px solid var(--pg-border) !important;
    background: linear-gradient(180deg, #ffffff, #f9fafb);
    box-shadow: var(--pg-shadow-sm);
    transition: box-shadow .2s ease, transform .06s ease, background .2s ease;
  }
  button.rounded-lg.border:hover {
    background: #ffffff;
    box-shadow: var(--pg-shadow-md);
    transform: translateY(-1px);
  }
  button.rounded-lg.border:active {
    transform: translateY(0);
  }

  /* Payment method tiles */
  label.flex.items-start.gap-3.p-3.rounded-lg.border.cursor-pointer {
    border-radius: 12px !important;
    border: 1px solid var(--pg-border) !important;
    transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
  }
  label.flex.items-start.gap-3.p-3.rounded-lg.border.cursor-pointer:hover {
    border-color: #cbd5e1;
    background: #fafafa;
    box-shadow: var(--pg-shadow-sm);
  }
  /* Checked state ring (radio sits inside label) */
  label.flex.items-start.gap-3.p-3.rounded-lg.border.cursor-pointer:has(input[type="radio"]:checked) {
    border-color: var(--pg-primary-600);
    box-shadow: 0 0 0 4px rgba(16,185,129,0.10);
    background: #fbfffd;
  }

  /* Inputs */
  input.rounded-lg.border {
    border-radius: 12px !important;
    border: 1px solid var(--pg-border) !important;
    background: #fff;
    transition: border-color .15s ease, box-shadow .15s ease, background .2s ease;
  }
  input.rounded-lg.border:hover {
    background: #fcfcfd;
  }
  input.rounded-lg.border:focus {
    outline: none !important;
    border-color: var(--pg-primary-600) !important;
    box-shadow: var(--pg-focus);
  }
  input[placeholder="CVV"] { letter-spacing: .2em; }

  /* Disabled inputs */
  input:disabled {
    cursor: not-allowed;
    background: #f3f4f6 !important;
  }

  /* Radio controls */
  input[type="radio"] {
    width: 18px; height: 18px;
    accent-color: var(--pg-primary-700);
  }

  /* Skeleton shimmer (if Tailwind's animate-pulse not present) */
  @keyframes pg-pulse {
    0% { opacity: .85; }
    50% { opacity: .55; }
    100% { opacity: .85; }
  }
  .animate-pulse {
    animation: pg-pulse 1.4s ease-in-out infinite;
  }

  /* Totals row emphasis */
  .font-semibold.text-green-700 {
    color: var(--pg-primary) !important;
    font-weight: 700 !important;
    letter-spacing: .2px;
  }

  /* Emoji product tile "icon" */
  .h-12.w-12.rounded-lg.bg-green-50 {
    background: radial-gradient(120% 120% at 30% 20%, #e8f5ee 0%, #dff1e8 45%, #d5ecdf 100%) !important;
    border: 1px solid #d7eadd;
  }

  /* Sections */
  section.rounded-xl.bg-white.p-6.shadow-sm,
  section.rounded-xl.bg-white.p-4.shadow-sm {
    backdrop-filter: saturate(1.2);
  }
  section.rounded-xl.bg-white.p-6.shadow-sm h3,
  section.rounded-xl.bg-white.p-4.shadow-sm h3 {
    letter-spacing: .2px;
  }

  /* Grid gap polish on large screens */
  @media (min-width: 1024px) {
    .grid.grid-cols-1.lg\\:grid-cols-2.gap-10 {
      column-gap: 3rem !important;
      row-gap: 2rem !important;
    }
  }

  /* Go to Cart CTA */
  .bg-green-600.text-white:hover {
    filter: brightness(1.02);
  }

  /* Micro-interactions on order summary rows */
  .space-y-4 > .flex.items-center.justify-between.rounded-xl.bg-white.p-4.shadow-sm {
    transition: transform .08s ease, box-shadow .2s ease;
  }

  /* Read-only shipping block monospace hint for phone */
  .text-gray-500:has(> :where(span, div):nth-child(1)) { font-variant-numeric: tabular-nums; }

  /* Backdrop focus ring for keyboard users */
  :focus-visible {
    outline: none;
    box-shadow: var(--pg-focus);
    border-color: var(--pg-primary-600);
  }

      `}</style>
    </div>
    </RequireAuth>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}
