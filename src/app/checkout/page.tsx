'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export type CartItem = {
  id: string;
  name: string;
  price: number;
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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PaymentPage() {
  const router = useRouter();
  const [data, setData] = useState<CheckoutData | null>(null);
  const [method, setMethod] = useState<'COD' | 'CARD'>('COD');
  const [card, setCard] = useState({ number: '', mmYY: '', cvv: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get userId from localStorage or your auth system
  const getUserId = () => {
    // Replace this with your actual auth logic
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user).id;
    }
    return '1'; // Default for testing
  };

  useEffect(() => {
    const chk = localStorage.getItem('checkout');
    if (chk) setData(JSON.parse(chk));
  }, []);

  const disablePay = useMemo(() => {
    if (method === 'COD') return false;
    return !(card.number && card.mmYY && card.cvv);
  }, [method, card]);

  const onPay = async () => {
    if (!data) return;

    setLoading(true);
    setError(null);

    try {
      const userId = getUserId();

      // Create order via API
      const response = await fetch(`${API_BASE}/orders/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contact: data.contact,
          shipping: data.shipping,
          paymentMethod: method,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create order');
      }

      if (result.success && result.data) {
        // Save order details for invoice page
        const orderData = {
          id: result.data.order_no,
          customerName: `${data.contact.firstName} ${data.contact.lastName}`.trim(),
          email: data.contact.email,
          total: data.totals.total,
          paymentMethod: method,
          createdAt: result.data.created_at,
          items: data.cart,
        };

        // Store last invoice for display
        localStorage.setItem('lastInvoice', JSON.stringify(orderData));

        // Clear checkout data
        localStorage.removeItem('checkout');

        // Navigate to invoice/success page
        router.push('/invoice');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">No checkout data found.</div>
          <button
            onClick={() => router.push('/cart')}
            className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
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
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">
              {error}
            </div>
          )}

          <section className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="font-medium mb-4">Payment Methods</h3>

            <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer mb-3">
              <input
                type="radio"
                name="pay"
                checked={method === 'COD'}
                onChange={() => setMethod('COD')}
                className="mt-1"
                disabled={loading}
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
                disabled={loading}
              />
              <div className="w-full">
                <div className="font-medium">Credit/Debit Cards</div>
                <div className="text-sm text-gray-500 mb-3">Pay with your Credit / Debit Card</div>

                <div className="grid grid-cols-1 gap-3">
                  <input
                    disabled={method !== 'CARD' || loading}
                    placeholder="Card number"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none disabled:bg-gray-50"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      disabled={method !== 'CARD' || loading}
                      placeholder="MM / YY"
                      value={card.mmYY}
                      onChange={(e) => setCard({ ...card, mmYY: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none disabled:bg-gray-50"
                    />
                    <input
                      disabled={method !== 'CARD' || loading}
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
                onClick={() => history.back()}
                disabled={loading}
                className="rounded-lg border px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
              <button
                disabled={disablePay || loading}
                onClick={onPay}
                className="rounded-lg bg-green-700 px-8 py-2 text-white hover:bg-green-800 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Pay'
                )}
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