'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, ArrowLeft } from 'lucide-react';
import Navbar from '../../components/NavbarHome';

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
=======
interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit?: string;
}

interface ContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

type ShippingDetails = {
=======
interface ShippingDetails {
  house: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
  sameAsBilling: boolean;
}

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
interface CheckoutData {
  cart: CartItem[];
  contact: ContactDetails;
  shipping: ShippingDetails;
  totals: {
    subtotal: number;
    tax: number;
    shippingFee: number;
    total: number;
  };
}

interface Transaction {
  id: string;
  customerName: string;
  email: string;
  total: number;
  paymentMethod: 'COD' | 'CARD';
  createdAt: string;
  items: CartItem[];
}

const API_BASE_URL = "http://localhost:5000/api";
const USER_ID = 1; // Demo user ID

export default function CheckoutPage() {
  const router = useRouter();
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const savedCheckout = localStorage.getItem('checkout');
    if (savedCheckout) {
      setCheckoutData(JSON.parse(savedCheckout));
    } else {
      // Redirect back to cart if no checkout data
      router.push('/cart');
    }
  }, [router]);

  const getProductImage = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('corn')) return '🌽';
    if (lowerName.includes('chili') || lowerName.includes('pepper')) return '🌶️';
    if (lowerName.includes('tomato')) return '🍅';
    if (lowerName.includes('carrot')) return '🥕';
    if (lowerName.includes('onion')) return '🧅';
    if (lowerName.includes('potato')) return '🥔';
    if (lowerName.includes('apple')) return '🍎';
    if (lowerName.includes('banana')) return '🍌';
    return '🥬';
  };

  const isFormValid = () => {
    if (paymentMethod === 'COD') return true;
    return cardDetails.number && cardDetails.expiry && cardDetails.cvv && cardDetails.name;
  };

  const processPayment = async () => {
    if (!checkoutData || !isFormValid()) return;

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create order
      const orderResponse = await fetch(`${API_BASE_URL}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: USER_ID,
          contact: checkoutData.contact,
          shipping: checkoutData.shipping
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();

      // Step 2: Process payment
      const paymentResponse = await fetch(`${API_BASE_URL}/payments/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData.id,
          method: paymentMethod,
          cardNumber: paymentMethod === 'CARD' ? cardDetails.number : undefined
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Payment failed');
      }

      const paymentData = await paymentResponse.json();

      // Step 3: Create transaction record for frontend
      const transaction: Transaction = {
        id: paymentData.invoice.orderId,
        customerName: paymentData.invoice.customerName,
        email: paymentData.invoice.email,
        total: paymentData.invoice.total,
        paymentMethod: paymentMethod,
        createdAt: paymentData.invoice.createdAt,
        items: checkoutData.cart
      };

      // Save transaction records
      const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      existingTransactions.unshift(transaction);
      localStorage.setItem('transactions', JSON.stringify(existingTransactions));
      localStorage.setItem('lastInvoice', JSON.stringify(transaction));

      // Clear cart and checkout data
      localStorage.removeItem('cart');
      localStorage.removeItem('checkout');

      // Redirect to invoice
      router.push('/invoice');

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!checkoutData) {
    return (
      <div className="loading-screen">
        <Navbar cartItemCount={0} />
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading checkout...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar cartItemCount={checkoutData.cart.reduce((sum, item) => sum + item.qty, 0)} />
      
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
          {/* Order Summary */}
          <div className="order-summary-section">
            <h2 className="section-title">Order Summary</h2>
            
            <div className="order-items">
              {checkoutData.cart.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    <span className="item-emoji">{getProductImage(item.name)}</span>
                  </div>
                  <div className="item-info">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-details">Qty: {item.qty} {item.unit || 'kg'}</p>
                  </div>
                  <div className="item-price">
                    Rs. {(item.price * item.qty).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>Rs. {checkoutData.totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Tax (6.5%)</span>
                <span>Rs. {checkoutData.totals.tax.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>{checkoutData.totals.shippingFee > 0 ? `Rs. ${checkoutData.totals.shippingFee.toFixed(2)}` : 'FREE'}</span>
              </div>
              <div className="total-row final">
                <span>Total</span>
                <span>Rs. {checkoutData.totals.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="shipping-info">
              <h3 className="info-title">
                <Truck size={20} />
                Delivery Address
              </h3>
              <div className="info-content">
                <p>{checkoutData.contact.firstName} {checkoutData.contact.lastName}</p>
                <p>{checkoutData.shipping.house}, {checkoutData.shipping.address}</p>
                <p>{checkoutData.shipping.city}, {checkoutData.shipping.state}</p>
                <p>{checkoutData.shipping.postalCode}</p>
                {checkoutData.shipping.landmark && (
                  <p className="landmark">Near: {checkoutData.shipping.landmark}</p>
                )}
                <p className="contact">📞 {checkoutData.contact.phone}</p>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="payment-section">
            <h2 className="section-title">Payment Method</h2>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="payment-methods">
              {/* Cash on Delivery */}
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
                    Pay with cash when your fresh produce is delivered to your doorstep. 
                    Our delivery partner will collect the payment upon delivery.
                  </div>
                </div>
              </label>

              {/* Credit/Debit Card */}
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
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '') })}
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
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.substring(0, 2) + '/' + value.substring(2, 4);
                            }
                            setCardDetails({ ...cardDetails, expiry: value });
                          }}
                          className="card-input"
                          maxLength={5}
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '') })}
                          className="card-input"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Place Order Button */}
            <button
              onClick={processPayment}
              disabled={processing || !isFormValid()}
              className="place-order-btn"
            >
              {processing ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Processing...
                </>
              ) : (
                <>
                  {paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'}
                  <span className="total-amount">Rs. {checkoutData.totals.total.toFixed(2)}</span>
                </>
              )}
            </button>

            <div className="payment-security">
              <p className="security-text">
                🔒 Your payment information is secure and encrypted
              </p>
            </div>
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

        .loading-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .loading-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #15803d;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 2rem;
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
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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

        .info-content p {
          margin: 0.25rem 0;
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
          box-shadow: 0 4px 15px rgba(21,128,61,0.3);
        }

        .place-order-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
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

        /* Mobile Responsive */
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
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}