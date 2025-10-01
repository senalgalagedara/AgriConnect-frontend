'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/NavbarHome';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api';
const USER_ID = '1';

const FETCH_CHECKOUT_ENDPOINTS = (userId: string) => [
  `${API_BASE}/checkout/${userId}`,
  `${API_BASE}/users/${userId}/checkout`,
];

type CartItem = {
  id: number;
  product_id?: number;
  name: string;
  price: number;
  qty: number;
  unit?: string;
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
  sameAsBilling?: boolean;
};

type CheckoutData = {
  cart: CartItem[];
  contact: ContactDetails;
  shipping: ShippingDetails;
  totals: Totals;
};

type OrderResponse = {
  order: { id: number };
  items: CartItem[];
};

type PaymentResponse = {
  invoice: {
    orderId: number;
    customerName: string;
    email: string;
    total: number;
    createdAt: string;
  };
};

/* ===================== Component ===================== */
export default function CheckoutPage() {
  const router = useRouter();

  // Backend cart + totals
  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<Totals>({ subtotal: 0, tax: 0, shippingFee: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // checkout details (prefer backend; fallback to localStorage)
  const [checkoutBackend, setCheckoutBackend] = useState<Partial<CheckoutData> | null>(null);
  const [checkoutLocal, setCheckoutLocal] = useState<CheckoutData | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(true);
  const [checkoutErr, setCheckoutErr] = useState<string | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD');
  const [cardDetails, setCardDetails] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const r = await fetch(`${API_BASE}/cart/${USER_ID}`, { cache: 'no-store' });
        const data = await r.json();
        setItems(Array.isArray(data?.items) ? data.items : []);
        setTotals(
          data?.totals ?? {
            subtotal: 0,
            tax: 0,
            shippingFee: 0,
            total: 0,
          }
        );
      } catch (e: any) {
        setErr(e?.message || 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    })();

    // Load checkout details from backend first, then from localStorage
    (async () => {
      setCheckoutLoading(true);
      setCheckoutErr(null);
      try {
        let found: Partial<CheckoutData> | null = null;

        for (const url of FETCH_CHECKOUT_ENDPOINTS(USER_ID)) {
          try {
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              if (data?.contact || data?.shipping || data?.totals || data?.cart) {
                found = data;
                break;
              }
            }
          } catch {
            // try next endpoint
          }
        }

        if (found) setCheckoutBackend(found);

        // also read from localStorage as a fallback
        try {
          const raw = localStorage.getItem('checkout');
          if (raw) {
            const parsed: CheckoutData = JSON.parse(raw);
            setCheckoutLocal(parsed);
          }
        } catch {
          // ignore parse errors
        }

        if (!found && !localStorage.getItem('checkout')) {
          setCheckoutErr('No checkout details found. Please complete shipping information.');
        }
      } finally {
        setCheckoutLoading(false);
      }
    })();
  }, []);

  // Which checkout data are we actually using?
  const checkout = useMemo<Partial<CheckoutData> | null>(() => {
    // prefer backend; else local
    return checkoutBackend ?? checkoutLocal ?? null;
  }, [checkoutBackend, checkoutLocal]);

  // Basic card validation
  const isFormValid = () => {
    if (paymentMethod === 'COD') return true;
    const numOk = /^\d{16}$/.test(cardDetails.number);
    const cvvOk = /^\d{3}$/.test(cardDetails.cvv);
    const expOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardDetails.expiry);
    return !!cardDetails.name && numOk && cvvOk && expOk;
  };

  const disablePay = useMemo(
    () => (paymentMethod === 'COD' ? false : !isFormValid()),
    [paymentMethod, cardDetails]
  );

  const getProductEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('corn')) return '🌽';
    if (n.includes('chili') || n.includes('pepper')) return '🌶️';
    if (n.includes('tomato')) return '🍅';
    if (n.includes('carrot')) return '🥕';
    if (n.includes('onion')) return '🧅';
    if (n.includes('potato')) return '🥔';
    if (n.includes('apple')) return '🍎';
    if (n.includes('banana')) return '🍌';
    return '🥬';
  };

  // Choose which totals to display: prefer backend totals; fall back to checkout.totals
  const displayTotals: Totals = useMemo(() => {
    if (totals && (totals.total ?? 0) > 0) return totals;
    return checkout?.totals ?? { subtotal: 0, tax: 0, shippingFee: 0, total: 0 };
  }, [totals, checkout]);

  const visibleItems: CartItem[] = useMemo(() => {
    return items.length ? items : checkout?.cart ?? [];
  }, [items, checkout]);

  // Little helper to safely display values
  const safe = (v?: string) => (v ?? '');

  // -------- Place order / Pay --------
  const processPayment = async () => {
    if (!checkout?.contact || !checkout?.shipping) {
      setError('Missing contact or shipping info from the previous step.');
      return;
    }
    if (paymentMethod === 'CARD' && !isFormValid()) return;

    setProcessing(true);
    setError(null);

    try {
      const orderRes = await fetch(`${API_BASE}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          contact: checkout.contact,   // ✅ now comes from backend (or local fallback)
          shipping: checkout.shipping, // ✅ now comes from backend (or local fallback)
        }),
      });

      if (!orderRes.ok) {
        const t = await orderRes.text();
        throw new Error(t || 'Failed to create order');
      }

      const orderData: OrderResponse = await orderRes.json();

      if (paymentMethod === 'CARD') {
        const payRes = await fetch(`${API_BASE}/payments/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.order.id,
            method: 'CARD',
            cardNumber: cardDetails.number,
            cardLast4: cardDetails.number.slice(-4),
          }),
        });

        if (!payRes.ok) {
          const t = await payRes.text();
          throw new Error(t || 'Payment failed');
        }

        const paymentData: PaymentResponse = await payRes.json();

        const transaction = {
          id: paymentData.invoice.orderId,
          customerName: paymentData.invoice.customerName,
          email: paymentData.invoice.email,
          total: paymentData.invoice.total,
          paymentMethod: 'CARD' as const,
          createdAt: paymentData.invoice.createdAt,
          items: visibleItems,
        };

        const existing = JSON.parse(localStorage.getItem('transactions') || '[]');
        existing.unshift(transaction);
        localStorage.setItem('transactions', JSON.stringify(existing));
        localStorage.setItem('lastInvoice', JSON.stringify(transaction));
      }

      // Clear client cart/checkout mirrors (optional; depends on your app flow)
      localStorage.removeItem('cart');
      localStorage.removeItem('checkout');

      router.push(`/order/${orderData.order.id}`);
    } catch (e: any) {
      setError(e?.message ?? 'Checkout failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const totalQty = visibleItems.reduce((s, it) => s + (Number(it.qty) || 0), 0);

  return (
    <div className="checkout-page">
      <Navbar cartItemCount={totalQty} />

      <div className="checkout-container">
        {/* Back Button */}
        <button onClick={() => router.back()} className="back-btn">
          <ArrowLeft size={20} />
          Back to Cart
        </button>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className="progress-step completed">
            <div className="step-number">1</div>
            <span>Cart & Shipping</span>
          </div>
          <div className="progress-line completed"></div>
          <div className="progress-step active">
            <div className="step-number">2</div>
            <span>Payment</span>
          </div>
        </div>

        <div className="checkout-grid">
          {/* -------- LEFT: Order Summary -------- */}
          <div className="order-summary-section">
            <h2 className="section-title">Order Summary</h2>

            {loading && (
              <div className="order-items">
                <div className="loading-spinner" />
                <p className="muted">Loading cart…</p>
              </div>
            )}

            {err && <div className="error-message">Error loading cart: {err}</div>}

            {!loading && !err && (
              <>
                <div className="order-items">
                  {visibleItems.length === 0 && <div className="muted">Your cart is empty.</div>}
                  {visibleItems.map((item) => (
                    <div key={String(item.id)} className="order-item">
                      <div className="item-image">
                        <span className="item-emoji">{getProductEmoji(item.name)}</span>
                      </div>
                      <div className="item-info">
                        <h3 className="item-name">{item.name}</h3>
                        <p className="item-details">
                          Qty: {item.qty} {item.unit || 'kg'}
                        </p>
                      </div>
                      <div className="item-price">
                        Rs. {(Number(item.price) * Number(item.qty)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-totals">
                  <div className="total-row">
                    <span>Subtotal</span>
                    <span>Rs. {displayTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Tax (6.5%)</span>
                    <span>Rs. {displayTotals.tax.toFixed(2)}</span>
                  </div>
                  <div className="total-row">
                    <span>Shipping</span>
                    <span>
                      {displayTotals.shippingFee > 0
                        ? `Rs. ${displayTotals.shippingFee.toFixed(2)}`
                        : 'FREE'}
                    </span>
                  </div>
                  <div className="total-row final">
                    <span>Total</span>
                    <span>Rs. {displayTotals.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Info (now with read-only inputs) */}
                <div className="shipping-info">
                  <h3 className="info-title">
                    <Truck size={20} />
                    Delivery Address
                  </h3>

                  {checkoutLoading && (
                    <div className="order-items" style={{ boxShadow: 'none', padding: 0 }}>
                      <div className="loading-spinner" />
                      <p className="muted">Loading delivery details…</p>
                    </div>
                  )}

                  {checkoutErr && <div className="error-message">{checkoutErr}</div>}

                  {!checkoutLoading && (
                    <div className="info-content">
                      {/* Contact - Read-only */}
                      <div className="ro-grid">
                        <div className="ro-field">
                          <label>First Name</label>
                          <input className="ro-input" readOnly value={safe(checkout?.contact?.firstName)} />
                        </div>
                        <div className="ro-field">
                          <label>Last Name</label>
                          <input className="ro-input" readOnly value={safe(checkout?.contact?.lastName)} />
                        </div>
                      </div>

                      <div className="ro-grid">
                        <div className="ro-field">
                          <label>Email</label>
                          <input className="ro-input" readOnly value={safe(checkout?.contact?.email)} />
                        </div>
                        <div className="ro-field">
                          <label>Phone</label>
                          <input className="ro-input" readOnly value={safe(checkout?.contact?.phone)} />
                        </div>
                      </div>

                      {/* Shipping - Read-only */}
                      <div className="ro-grid">
                        <div className="ro-field">
                          <label>House / Apartment</label>
                          <input className="ro-input" readOnly value={safe(checkout?.shipping?.house)} />
                        </div>
                        <div className="ro-field">
                          <label>Address</label>
                          <input className="ro-input" readOnly value={safe(checkout?.shipping?.address)} />
                        </div>
                      </div>

                      <div className="ro-grid">
                        <div className="ro-field">
                          <label>City</label>
                          <input className="ro-input" readOnly value={safe(checkout?.shipping?.city)} />
                        </div>
                        <div className="ro-field">
                          <label>State</label>
                          <input className="ro-input" readOnly value={safe(checkout?.shipping?.state)} />
                        </div>
                      </div>

                      <div className="ro-grid">
                        <div className="ro-field">
                          <label>Postal Code</label>
                          <input className="ro-input" readOnly value={safe(checkout?.shipping?.postalCode)} />
                        </div>
                        <div className="ro-field">
                          <label>Landmark</label>
                          <input className="ro-input" readOnly value={safe(checkout?.shipping?.landmark)} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* -------- RIGHT: Payment -------- */}
          <div className="payment-section">
            <h2 className="section-title">Payment Method</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="payment-methods">
              {/* COD */}
              <label className={`payment-method ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'COD' | 'CARD')}
                  className="payment-radio"
                />
                <div className="method-content">
                  <div className="method-header">
                    <Truck size={24} />
                    <div>
                      <h3>Cash on Delivery</h3>
                      <p>Pay when your order is delivered</p>
                    </div>
                  </div>
                  <div className="method-description">
                    Pay with cash when your fresh produce is delivered to your doorstep. Our delivery
                    partner will collect the payment upon delivery.
                  </div>
                </div>
              </label>

              {/* CARD */}
              <label className={`payment-method ${paymentMethod === 'CARD' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'COD' | 'CARD')}
                  className="payment-radio"
                />
                <div className="method-content">
                  <div className="method-header">
                    <CreditCard size={24} />
                    <div>
                      <h3>Credit/Debit Card</h3>
                      <p>Pay securely with your card</p>
                    </div>
                  </div>

                  {paymentMethod === 'CARD' && (
                    <div className="card-form">
                      <div className="form-row">
                        <input
                          type="text"
                          placeholder="Cardholder Name"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          className="card-input full-width"
                        />
                      </div>
                      <div className="form-row">
                        <input
                          type="text"
                          placeholder="Card Number"
                          value={cardDetails.number}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              number: e.target.value.replace(/\D/g, '').slice(0, 16),
                            })
                          }
                          className="card-input full-width"
                          maxLength={16}
                        />
                      </div>
                      <div className="form-row">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                            setCardDetails({ ...cardDetails, expiry: v });
                          }}
                          className="card-input"
                          maxLength={5}
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          value={cardDetails.cvv}
                          onChange={(e) =>
                            setCardDetails({
                              ...cardDetails,
                              cvv: e.target.value.replace(/\D/g, '').slice(0, 3),
                            })
                          }
                          className="card-input"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Place Order */}
            <button
              onClick={processPayment}
              disabled={processing || disablePay}
              className="place-order-btn"
            >
              {processing ? (
                <>
                  <div className="loading-spinner-small" />
                  Processing...
                </>
              ) : (
                <>
                  {paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'}
                  <span className="total-amount">Rs. {displayTotals.total.toFixed(2)}</span>
                </>
              )}
            </button>

            <div className="payment-security">
              <p className="security-text">🔒 Your payment information is secure and encrypted</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- CSS (scoped) ---------------- */}
      <style jsx>{`
        .checkout-page {
          min-height: 100vh;
          background: #fafafa;
        }

        .checkout-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #6b7280;
          font-size: 0.9rem;
          cursor: pointer;
          margin-bottom: 2rem;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.3s;
        }

        .back-btn:hover {
          background: #f3f4f6;
          color: #15803d;
        }

        .progress-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 3rem;
          gap: 2rem;
        }

        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: #9ca3af;
        }

        .progress-step.active {
          color: #15803d;
        }

        .progress-step.completed {
          color: #15803d;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .progress-step.active .step-number,
        .progress-step.completed .step-number {
          background: #15803d;
          color: white;
        }

        .progress-line {
          flex: 1;
          height: 2px;
          background: #e5e7eb;
          max-width: 100px;
        }

        .progress-line.completed {
          background: #15803d;
        }

        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .order-summary-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .order-items {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .order-item {
          display: grid;
          grid-template-columns: 50px 1fr auto;
          gap: 1rem;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .order-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .item-image {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-emoji {
          font-size: 1.5rem;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .item-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .item-details {
          color: #6b7280;
          font-size: 0.8rem;
          margin: 0;
        }

        .item-price {
          font-weight: bold;
          color: #15803d;
        }

        .order-totals {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .total-row:last-child {
          border-bottom: none;
        }

        .total-row.final {
          font-weight: bold;
          font-size: 1.1rem;
          color: #15803d;
          padding-top: 1rem;
          border-top: 2px solid #e5e7eb;
          margin-top: 0.5rem;
        }

        .shipping-info {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .info-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .info-content {
          color: #6b7280;
          line-height: 1.6;
        }

        /* 🔒 Read-only input grid */
        .ro-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .ro-field label {
          display: block;
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .ro-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          background: #f9fafb;
          color: #111827;
        }

        .ro-input[readonly] {
          cursor: not-allowed;
          user-select: none;
        }

        .landmark {
          font-style: italic;
        }

        .contact {
          font-weight: 500;
          color: #15803d;
        }

        .payment-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
        }

        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .payment-method {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
          display: block;
        }

        .payment-method:hover {
          border-color: #d1d5db;
        }

        .payment-method.selected {
          border-color: #15803d;
          background: #f0fdf4;
        }

        .payment-radio {
          display: none;
        }

        .method-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .method-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .method-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .method-header p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .method-description {
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .card-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .card-input {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.3s;
          flex: 1;
        }

        .card-input.full-width {
          width: 100%;
        }

        .card-input:focus {
          border-color: #15803d;
        }

        .place-order-btn {
          width: 100%;
          background: linear-gradient(135deg, #15803d, #059669);
          color: white;
          border: none;
          padding: 1.25rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .place-order-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #166534, #047857);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(21, 128, 61, 0.3);
        }

        .place-order-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #15803d;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .loading-spinner-small {
          width: 20px;
          height: 20px;
          border: 2px solid #ffffff60;
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .total-amount {
          font-size: 1.2rem;
          font-weight: bold;
        }

        .payment-security {
          text-align: center;
          margin-top: 1rem;
        }

        .security-text {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .muted {
          color: #6b7280;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .checkout-container {
            padding: 1rem;
          }
          .checkout-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .progress-indicator {
            gap: 1rem;
          }
          .progress-line {
            max-width: 50px;
          }
          .form-row {
            flex-direction: column;
          }
          .method-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .ro-grid {
            grid-template-columns: 1fr;
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
