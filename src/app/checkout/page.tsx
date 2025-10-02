"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";

export type CartItem = {
  id: string;
  name: string;
  price: number; // per item
  qty: number;
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
  id: string; // order id
  customerName: string;
  email: string;
  total: number;
  paymentMethod: 'COD' | 'CARD';
  createdAt: string; // ISO
  items: CartItem[];
};

export default function PaymentPage() {
  const router = useRouter();
  const [data, setData] = useState<CheckoutData | null>(null);
  const [method, setMethod] = useState<'COD' | 'CARD'>('COD');
  const [card, setCard] = useState({ number: '', mmYY: '', cvv: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const chk = localStorage.getItem('checkout');
      if (chk) setData(JSON.parse(chk));
    } catch {
      setData(null);
    }
  }, []);

  const disablePay = useMemo(() => {
    if (method === 'COD') return false;
    return !(card.number && card.mmYY && card.cvv);
  }, [method, card]);

  const onPay = async () => {
    if (!data) return;
    setLoading(true);

    // try to obtain a userId from localStorage; if not present, default to 1
    // (assumption: backend requires a positive integer userId)
    const userId = Number(localStorage.getItem('userId') || '1');

    // Map shipping details to backend shape
    const shippingPayload = {
      address: data.shipping.address || data.shipping.house || '',
      city: data.shipping.city,
      state: data.shipping.state,
      postalCode: data.shipping.postalCode,
      landmark: data.shipping.landmark || undefined,
    };

    // Prepare cart items in a minimal shape the backend can consume
    const items = data.cart.map((it) => ({
      productId: Number(it.id) || undefined,
      name: it.name,
      price: it.price,
      qty: it.qty,
    }));

    const payload = {
      userId,
      contact: data.contact,
      shipping: shippingPayload,
      paymentMethod: method,
      items,
      totals: data.totals,
    };

    try {
      // Call the checkout endpoint on the backend
      const orderResp = await apiRequest<any>(`/orders/checkout`, { method: 'POST', body: payload });

      // Try to robustly extract an order id from the response
      let orderId: number | string | null = null;
      if (orderResp == null) {
        throw new Error('Empty response from server');
      }
      if (typeof orderResp === 'object') {
        orderId = orderResp.id ?? orderResp.order_no ?? orderResp.orderId ?? null;
      } else if (typeof orderResp === 'number' || typeof orderResp === 'string') {
        orderId = orderResp;
      }

      // If card payment chosen, call the payments endpoint
      if (method === 'CARD') {
        if (!orderId) throw new Error('Order id missing for payment');
        // Send minimal card data; backend will validate and sanitize
        await apiRequest<any>('/payments/pay', {
          method: 'POST',
          body: {
            orderId: Number(orderId),
            method: 'CARD',
            cardNumber: String(card.number).replace(/[^0-9]/g, ''),
          },
        });
      }

      // Build a small transaction object for invoice display
      const orderIdentifier = orderId != null
        ? String(orderId)
        : (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function')
          ? (crypto as any).randomUUID()
          : String(Math.floor(100000000 + Math.random() * 900000000));
      const tx: Transaction = {
        id: orderIdentifier,
        customerName: `${data.contact.firstName} ${data.contact.lastName}`.trim(),
        email: data.contact.email,
        total: data.totals.total,
        paymentMethod: method,
        createdAt: new Date().toISOString(),
        items: data.cart,
      };

      // keep local copy for invoice page and transaction history (non-authoritative)
      const all = JSON.parse(localStorage.getItem('transactions') || '[]') as Transaction[];
      all.unshift(tx);
      localStorage.setItem('transactions', JSON.stringify(all));
      localStorage.setItem('lastInvoice', JSON.stringify(tx));

      router.push('/invoice');
    } catch (err: any) {
      // surface backend validation/messages
      const msg = err?.message || 'Checkout failed';
      // keep it simple for now; a proper UI toast would be nicer
      alert(`Checkout failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return <div className="p-8 text-gray-500">No checkout data. Go back to the cart.</div>;
  }

  const { cart, totals } = data;

  return (
    <div className="min-h-screen bg-gray-50">
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
                Pay
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
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
