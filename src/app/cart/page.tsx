'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Minus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import Navbar from '../../components/NavbarHome';

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
=======
interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  qty: number;
  unit?: string;
}

interface CartTotals {
  subtotal: number;
  tax: number;
  shippingFee: number;
  total: number;
}

interface CartData {
  cart: any;
  items: CartItem[];
  totals: CartTotals;
}

interface ContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ShippingDetails {
  house: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  landmark?: string;
  sameAsBilling: boolean;
}

const API_BASE_URL = "http://localhost:5000/api";
const USER_ID = 1; // Demo user ID
const TAX_RATE = 0.065;

export default function CartPage() {
  const router = useRouter();
  
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [contact, setContact] = useState<ContactDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+94 ',
  });
  const [shipping, setShipping] = useState<ShippingDetails>({
    house: '',
    address: '',
    city: '',
    state: 'Western Province',
    postalCode: '',
    landmark: '',
    sameAsBilling: true,
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
=======
    fetchCart();
    loadSavedDetails();
  }, []);

  const loadSavedDetails = () => {
    const savedContact = localStorage.getItem('contact');
    const savedShipping = localStorage.getItem('shipping');
    if (savedContact) setContact(JSON.parse(savedContact));
    if (savedShipping) setShipping(JSON.parse(savedShipping));
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cart/${USER_ID}`);
      
      if (response.ok) {
        const data = await response.json();
        setCartData(data);
        // Update localStorage with current cart
        localStorage.setItem('cart', JSON.stringify(data.items.map((item: CartItem) => ({
          id: item.product_id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          unit: item.unit || 'kg'
        }))));
      } else {
        console.error('Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQty: number) => {
    if (newQty < 1) {
      await removeItem(itemId);
      return;
    }

    setUpdating(itemId);
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${USER_ID}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qty: newQty }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCartData(updatedCart);
        // Update localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart.items.map((item: CartItem) => ({
          id: item.product_id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          unit: item.unit || 'kg'
        }))));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    setUpdating(itemId);
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${USER_ID}/items/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCartData(updatedCart);
        // Update localStorage
        localStorage.setItem('cart', JSON.stringify(updatedCart.items.map((item: CartItem) => ({
          id: item.product_id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          unit: item.unit || 'kg'
        }))));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setUpdating(null);
    }
  };

  const proceedToCheckout = () => {
    if (!cartData || cartData.items.length === 0) return;

    // Save contact and shipping details
    localStorage.setItem('contact', JSON.stringify(contact));
    localStorage.setItem('shipping', JSON.stringify(shipping));
    
    // Save checkout data
    const checkoutData = {
      cart: cartData.items.map(item => ({
        id: item.product_id.toString(),
        name: item.name,
        price: item.price,
        qty: item.qty,
        unit: item.unit
      })),
      contact,
      shipping,
      totals: cartData.totals
    };
    
    localStorage.setItem('checkout', JSON.stringify(checkoutData));
    router.push('/checkout');
  };

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

  if (loading) {
    return (
      <div className="loading-screen">
        <Navbar cartItemCount={0} />
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading your cart...</h2>
        </div>
      </div>
    );
  }

  const isEmpty = !cartData || cartData.items.length === 0;

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

    <div className="cart-page">
      <Navbar cartItemCount={cartData?.items.reduce((sum, item) => sum + item.qty, 0) || 0} />
      
      <div className="cart-container">
        {/* Back Button */}
        <button onClick={() => router.back()} className="back-btn">
          <ArrowLeft size={20} />
          Continue Shopping
        </button>

        {isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="cart-content">
            {/* Progress Indicator */}
            <div className="progress-indicator">
              <div className="progress-step active">
                <div className="step-number">1</div>
                <span>Cart & Shipping</span>
              </div>
              <div className="progress-line"></div>
              <div className="progress-step">
                <div className="step-number">2</div>
                <span>Payment</span>
              </div>
            </div>

            <div className="cart-grid">
              {/* Cart Items */}
              <div className="cart-items-section">
                <h2 className="section-title">Your Order</h2>
                
                <div className="cart-items">
                  {cartData.items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="item-image">
                        <span className="item-emoji">{getProductImage(item.name)}</span>
                      </div>
                      
                      <div className="item-details">
                        <h3 className="item-name">{item.name}</h3>
                        <p className="item-price">Rs. {item.price.toFixed(2)} per {item.unit || 'kg'}</p>
                      </div>
                      
                      <div className="item-quantity">
                        <button
                          onClick={() => updateQuantity(item.id, item.qty - 1)}
                          disabled={updating === item.id}
                          className="qty-btn"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="qty-display">{item.qty}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                          disabled={updating === item.id}
                          className="qty-btn"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <div className="item-total">
                        Rs. {(item.price * item.qty).toFixed(2)}
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="remove-btn"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary & Forms */}
              <div className="checkout-section">
                {/* Order Summary */}
                <div className="order-summary">
                  <h3 className="summary-title">Order Summary</h3>
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>Rs. {cartData.totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax ({(TAX_RATE * 100).toFixed(1)}%)</span>
                    <span>Rs. {cartData.totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>{cartData.totals.shippingFee > 0 ? `Rs. ${cartData.totals.shippingFee.toFixed(2)}` : 'FREE'}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>Rs. {cartData.totals.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Contact Details Form */}
                <div className="form-section">
                  <h3 className="form-title">Contact Details</h3>
                  <div className="form-grid">
                    <Input
                      label="First Name"
                      value={contact.firstName}
                      onChange={(v) => setContact({ ...contact, firstName: v })}
                      required
                    />
                    <Input
                      label="Last Name"
                      value={contact.lastName}
                      onChange={(v) => setContact({ ...contact, lastName: v })}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={contact.email}
                      onChange={(v) => setContact({ ...contact, email: v })}
                      className="full-width"
                      required
                    />
                    <Input
                      label="Phone Number"
                      value={contact.phone}
                      onChange={(v) => setContact({ ...contact, phone: v })}
                      className="full-width"
                      required
                    />
                  </div>
                </div>

                {/* Shipping Details Form */}
                <div className="form-section">
                  <h3 className="form-title">Shipping Address</h3>
                  <div className="form-grid">
                    <Input
                      label="House/Apartment No."
                      value={shipping.house}
                      onChange={(v) => setShipping({ ...shipping, house: v })}
                      required
                    />
                    <Input
                      label="Street Address"
                      value={shipping.address}
                      onChange={(v) => setShipping({ ...shipping, address: v })}
                      className="full-width"
                      required
                    />
                    <Input
                      label="City"
                      value={shipping.city}
                      onChange={(v) => setShipping({ ...shipping, city: v })}
                      required
                    />
                    <Input
                      label="State/Province"
                      value={shipping.state}
                      onChange={(v) => setShipping({ ...shipping, state: v })}
                      required
                    />
                    <Input
                      label="Postal Code"
                      value={shipping.postalCode}
                      onChange={(v) => setShipping({ ...shipping, postalCode: v })}
                      required
                    />
                    <Input
                      label="Landmark (Optional)"
                      value={shipping.landmark || ''}
                      onChange={(v) => setShipping({ ...shipping, landmark: v })}
                    />
                  </div>
                </div>

                {/* Proceed Button */}
                <button
                  onClick={proceedToCheckout}
                  className="proceed-btn"
                  disabled={!contact.firstName || !contact.lastName || !contact.email || !shipping.address}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .cart-page {
          min-height: 100vh;
          background: #fafafa;
        }

        .cart-container {
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

        .progress-step.active .step-number {
          background: #15803d;
          color: white;
        }

        .progress-line {
          flex: 1;
          height: 2px;
          background: #e5e7eb;
          max-width: 100px;
        }

        .cart-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 3rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 60px 1fr auto auto auto;
          gap: 1rem;
          align-items: center;
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .item-image {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-emoji {
          font-size: 2rem;
        }

        .item-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .item-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .item-price {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .item-quantity {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f3f4f6;
          border-radius: 8px;
          padding: 0.5rem;
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .qty-btn:hover:not(:disabled) {
          border-color: #15803d;
          color: #15803d;
        }

        .qty-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .qty-display {
          min-width: 30px;
          text-align: center;
          font-weight: 600;
        }

        .item-total {
          font-weight: bold;
          color: #15803d;
          font-size: 1.1rem;
        }

        .remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.3s;
        }

        .remove-btn:hover:not(:disabled) {
          background: #fef2f2;
        }

        .remove-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .checkout-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .order-summary {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .summary-title {
          font-size: 1.2rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .summary-row:last-child {
          border-bottom: none;
        }

        .summary-row.total {
          font-weight: bold;
          font-size: 1.1rem;
          color: #15803d;
          padding-top: 1rem;
          border-top: 2px solid #e5e7eb;
          margin-top: 0.5rem;
        }

        .form-section {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .form-title {
          font-size: 1.2rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .proceed-btn {
          width: 100%;
          background: linear-gradient(135deg, #15803d, #059669);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .proceed-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #166534, #047857);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(21,128,61,0.3);
        }

        .proceed-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .cart-container {
            padding: 1rem;
          }

          .cart-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .cart-item {
            grid-template-columns: 50px 1fr;
            gap: 1rem;
            padding: 1rem;
          }

          .item-quantity {
            grid-column: 1 / -1;
            justify-self: center;
            margin-top: 0.5rem;
          }

          .item-total {
            grid-column: 1 / -1;
            text-align: center;
            margin-top: 0.5rem;
          }

          .remove-btn {
            grid-column: 1 / -1;
            justify-self: center;
            margin-top: 0.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .progress-indicator {
            gap: 1rem;
          }

          .progress-line {
            max-width: 50px;
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

function EmptyCart() {
  return (
    <div className="empty-cart">
      <div className="empty-cart-content">
        <ShoppingBag size={80} className="empty-icon" />
        <h2>Your cart is empty</h2>
        <p>Add some delicious items to your cart to get started!</p>
        <Link href="/home" className="shop-now-btn">
          Start Shopping
        </Link>
      </div>

      <style jsx>{`
        .empty-cart {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
        }

        .empty-cart-content {
          text-align: center;
          max-width: 400px;
        }

        .empty-icon {
          color: #d1d5db;
          margin-bottom: 2rem;
        }

        .empty-cart-content h2 {
          font-size: 2rem;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .empty-cart-content p {
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .shop-now-btn {
          display: inline-block;
          background: linear-gradient(135deg, #15803d, #059669);
          color: white;
          text-decoration: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .shop-now-btn:hover {
          background: linear-gradient(135deg, #166534, #047857);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(21,128,61,0.3);
        }
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
function Input({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  className = '', 
  required = false 
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={`input-container ${className}`}>
      <label className="input-label">
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
        required={required}
      />

      <style jsx>{`
        .input-container {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .input-container.full-width {
          grid-column: 1 / -1;
        }

        .input-label {
          font-weight: 500;
          color: #374151;
          font-size: 0.9rem;
        }

        .required {
          color: #ef4444;
        }

        .input-field {
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.3s;
        }

        .input-field:focus {
          border-color: #15803d;
        }

        .input-field:required:invalid {
          border-color: #fbbf24;
        }
      `}</style>
    </div>
  );
}