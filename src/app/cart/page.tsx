'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import Navbar from '../../components/NavbarHome';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api';
const USER_ID = 1;
const TAX_RATE = 0.065;

interface CartItem {
  id: string;
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
  cart: { id?: string | number } | null;
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

export default function CartPage() {
  const router = useRouter();

  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [contact, setContact] = useState<ContactDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [shipping, setShipping] = useState<ShippingDetails>({
    house: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    landmark: '',
    sameAsBilling: true,
  });

  useEffect(() => {
    fetchCart();
    loadSavedDetails();
  }, []);

  const loadSavedDetails = () => {
    try {
      const savedContact = localStorage.getItem('contact');
      const savedShipping = localStorage.getItem('shipping');
      if (savedContact) setContact(JSON.parse(savedContact));
      if (savedShipping) setShipping(JSON.parse(savedShipping));
    } catch { }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/cart/${USER_ID}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();

      const items: CartItem[] = Array.isArray(data?.items) ? data.items : [];
      const normalized: CartData = {
        cart: data?.cart ?? null,
        items,
        totals: data?.totals ?? {
          subtotal: 0,
          tax: 0,
          shippingFee: 0,
          total: 0,
        },
      };
      setCartData(normalized);
    } catch (err) {
      console.error(err);
      setCartData({ cart: null, items: [], totals: { subtotal: 0, tax: 0, shippingFee: 0, total: 0 } });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQty: number) => {
    if (newQty < 1) {
      await removeItem(itemId);
      return;
    }
    setUpdating(itemId);
    try {
      const response = await fetch(`${API_BASE}/cart/${USER_ID}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: newQty }),
      });
      if (!response.ok) throw new Error('Failed to update quantity');

      const updated = await response.json();
      const items: CartItem[] = Array.isArray(updated?.items) ? updated.items : [];

      setCartData((prev) => ({
        cart: prev?.cart ?? null,
        items,
        totals: updated?.totals ?? prev?.totals ?? { subtotal: 0, tax: 0, shippingFee: 0, total: 0 },
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const response = await fetch(`${API_BASE}/cart/${USER_ID}/items/${itemId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove item');

      const updated = await response.json();
      const items: CartItem[] = Array.isArray(updated?.items) ? updated.items : [];

      setCartData((prev) => ({
        cart: prev?.cart ?? null,
        items,
        totals: updated?.totals ?? prev?.totals ?? { subtotal: 0, tax: 0, shippingFee: 0, total: 0 },
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const totalQty = useMemo(
    () => (cartData?.items || []).reduce((s, it) => s + Number(it.qty || 0), 0),
    [cartData?.items]
  );
  const subtotal = useMemo(
    () => (cartData?.items || []).reduce((s, it) => s + Number(it.price) * Number(it.qty), 0),
    [cartData?.items]
  );
  const deliveryFee = totalQty > 10 ? 300 : 0;
  const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
  const total = useMemo(() => subtotal + tax + deliveryFee, [subtotal, tax, deliveryFee]);

  const proceedToCheckout = async () => {
    if (!cartData || cartData.items.length === 0) return;

    // Validate required fields
    if (!contact.firstName || !contact.lastName || !contact.email || !contact.phone) {
      alert('Please fill in all contact details');
      return;
    }

    if (!shipping.house || !shipping.address || !shipping.city || !shipping.state || !shipping.postalCode) {
      alert('Please fill in all shipping details');
      return;
    }

    setCreating(true);

    try {
      // Save contact and shipping to localStorage
      localStorage.setItem('contact', JSON.stringify(contact));
      localStorage.setItem('shipping', JSON.stringify(shipping));

      // Create order in backend
      const orderPayload = {
        contact: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
        },
        shipping: {
          address: `${shipping.house}, ${shipping.address}`,
          city: shipping.city,
          state: shipping.state,
          postalCode: shipping.postalCode,
          landmark: shipping.landmark || '',
        },
        paymentMethod: 'COD', 
      };

      const response = await fetch(`${API_BASE}/orders/${USER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const result = await response.json();
      const orderId = result.data?.id || result.data?.order?.id;

      if (!orderId) {
        throw new Error('Order created but ID not returned');
      }

      // Save order ID for payment page
      localStorage.setItem('pendingOrderId', orderId.toString());

      // Navigate to checkout/payment page
      router.push('/checkout');
    } catch (err) {
      console.error('Error creating order:', err);
      alert(err instanceof Error ? err.message : 'Failed to create order. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Navbar cartItemCount={0} />
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading your cart...</h2>
        </div>

        <style jsx>{`
          .loading-screen { min-height: 100vh; display: flex; flex-direction: column; }
          .loading-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
          .loading-spinner { width: 60px; height: 60px; border: 4px solid #e5e7eb; border-top: 4px solid #15803d; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 2rem; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const isEmpty = !cartData || cartData.items.length === 0;

  return (
    <div className="cart-shipping-page">
      <Navbar cartItemCount={cartData?.items.reduce((sum, item) => sum + item.qty, 0) || 0} />

      <div className="shipping-main-container">
        <div className="header-row">
          <h1 className="page-title">Shipping</h1>
          <div className="order-id">
            Order ID:&nbsp;<strong>{cartData?.cart?.id ?? '—'}</strong>
          </div>
        </div>

        {isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="shipping-content-grid">
            <div className="order-summary-section">
              <div className="brand-title">AgriConnect</div>
              <div className="order-summary-title">Order Summary</div>

              <div className="products-grid">
                <div className="grid-header">
                  <div>ID</div>
                  <div>Name</div>
                  <div>Quantity</div>
                  <div className="price-col">Price</div>
                </div>

                {cartData?.items.map((item) => (
                  <div className="grid-row" key={item.id}>
                    <div className="cell id-cell">{item.product_id}</div>
                    <div className="cell name-cell">{item.name}</div>
                    <div className="cell qty-cell">
                      <button
                        onClick={() => updateQuantity(item.id, item.qty - 1)}
                        disabled={updating === item.id || creating}
                        className="qty-btn"
                        aria-label={`Decrease ${item.name}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="qty-value">
                        {item.qty} {item.unit || 'kg'}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                        disabled={updating === item.id || creating}
                        className="qty-btn"
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id || creating}
                        className="remove-btn"
                        aria-label={`Remove ${item.name}`}
                        title="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="cell price-col">
                      Rs. {(item.price * item.qty).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Sales tax (6.5%)</span>
                  <span>Rs. {tax.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee{totalQty > 10 ? ' (Qty > 10 kg)' : ''}</span>
                  <span className={totalQty > 10 ? '' : 'free'}>
                    {totalQty > 10 ? `Rs. ${deliveryFee.toFixed(2)}` : 'Rs. 0.00'}
                  </span>
                </div>
                <div className="summary-row total-row">
                  <span>Total due</span>
                  <span className="total-due">Rs. {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="shipping-form-section">
              <div className="shipping-stepper">
                <span className="step-active">Shipping</span>
                <span className="step-sep">—</span>
                <span className="step-inactive">Payment</span>
              </div>

              <div className="contact-form-box">
                <div className="form-title">Contact Details</div>

                <div className="form-row">
                  <label className="field">
                    <span className="label">First Name *</span>
                    <input
                      type="text"
                      value={contact.firstName}
                      onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                      disabled={creating}
                      required
                    />
                  </label>

                  <label className="field">
                    <span className="label">Last Name *</span>
                    <input
                      type="text"
                      value={contact.lastName}
                      onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                      disabled={creating}
                      required
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label className="field">
                    <span className="label">Email *</span>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      disabled={creating}
                      required
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label className="field">
                    <span className="label">Phone Number *</span>
                    <input
                      type="text"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      disabled={creating}
                      required
                    />
                  </label>
                </div>
              </div>

              <div className="shipping-form-box">
                <div className="form-title">Shipping Details</div>

                <div className="form-row">
                  <label className="field">
                    <span className="label">Flat / House No. *</span>
                    <input
                      type="text"
                      value={shipping.house}
                      onChange={(e) => setShipping({ ...shipping, house: e.target.value })}
                      disabled={creating}
                      required
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label className="field">
                    <span className="label">Address *</span>
                    <input
                      type="text"
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      disabled={creating}
                      required
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label className="field">
                    <span className="label">City *</span>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      disabled={creating}
                      required
                    />
                  </label>

                  <label className="field">
                    <span className="label">State *</span>
                    <input
                      type="text"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                      disabled={creating}
                      required
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label className="field">
                    <span className="label">Postal Code *</span>
                    <input
                      type="text"
                      value={shipping.postalCode}
                      onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
                      disabled={creating}
                      required
                    />
                  </label>

                  <label className="field">
                    <span className="label">Famous Landmark (optional)</span>
                    <input
                      type="text"
                      value={shipping.landmark || ''}
                      onChange={(e) => setShipping({ ...shipping, landmark: e.target.value })}
                      disabled={creating}
                    />
                  </label>
                </div>

                <div className="form-row checkbox-row">
                  <input
                    type="checkbox"
                    checked={shipping.sameAsBilling}
                    onChange={(e) => setShipping({ ...shipping, sameAsBilling: e.target.checked })}
                    id="sameAsBilling"
                    disabled={creating}
                  />
                  <label htmlFor="sameAsBilling">My shipping and billing address are the same</label>
                </div>
              </div>

              <button
                className="continue-btn"
                onClick={proceedToCheckout}
                disabled={
                  creating ||
                  !contact.firstName ||
                  !contact.lastName ||
                  !contact.email ||
                  !contact.phone ||
                  !shipping.house ||
                  !shipping.address ||
                  !shipping.city ||
                  !shipping.state ||
                  !shipping.postalCode
                }
              >
                {creating ? 'Creating Order...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .cart-shipping-page { min-height: 100vh; background: #181818; }
        .shipping-main-container {
          max-width: 1200px; margin: 2rem auto; background: #fff; border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08); padding: 2rem 2rem 2.5rem 2rem;
        }

        .header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
        .page-title { font-size: 2rem; color: #111827; margin: 0; }
        .order-id { color: #374151; background: #f3f4f6; border-radius: 8px; padding: 0.5rem 0.75rem; }

        .shipping-content-grid { display: grid; grid-template-columns: 1.1fr 1.2fr; gap: 2.5rem; }
        .order-summary-section { background: #fff; border-radius: 10px; padding: 2rem 1.5rem 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .brand-title { color: #22c55e; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
        .order-summary-title { font-size: 1.1rem; font-weight: 600; color: #222; margin: 0 0 1rem; }

        .products-grid { border: 1.5px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
        .grid-header, .grid-row {
          display: grid; grid-template-columns: 100px 1fr 1.2fr 140px; align-items: center;
        }
        .grid-header {
          background: #f9fafb; font-weight: 600; color: #374151; padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb;
        }
        .grid-row { padding: 0.85rem 1rem; border-bottom: 1px solid #f3f4f6; }
        .grid-row:last-child { border-bottom: none; }

        .cell { display: flex; align-items: center; gap: 0.5rem; }
        .id-cell { color: #6b7280; }
        .name-cell { color: #111827; font-weight: 500; }
        .qty-cell { gap: 0.4rem; }
        .qty-btn {
          width: 26px; height: 26px; border: 1px solid #d1d5db; background: #fff; border-radius: 6px;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .qty-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .qty-value { min-width: 72px; text-align: center; font-weight: 600; color: #111827; }
        .remove-btn { background: none; border: none; color: #ef4444; cursor: pointer; margin-left: 8px; }
        .remove-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .price-col { justify-content: flex-end; font-weight: 600; color: #14532d; }

        .summary-totals { margin-top: 1.2rem; }
        .summary-row { display: flex; justify-content: space-between; padding: 0.45rem 0; color: #222; }
        .summary-row .free { color: #16a34a; font-weight: 600; }
        .total-row { font-weight: 700; color: #065f46; font-size: 1.1rem; }
        .total-due { color: #065f46; font-weight: 800; }

        .shipping-form-section { background: #fafafa; border-radius: 10px; padding: 2rem 2.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column; gap: 1.5rem; }
        .shipping-stepper { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.4rem; }
        .step-active { color: #22c55e; }
        .step-inactive, .step-sep { color: #9ca3af; }

        .contact-form-box, .shipping-form-box { background: #fff; border-radius: 8px; padding: 1.2rem 1.5rem; }
        .form-title { font-size: 1.1rem; font-weight: 600; color: #111827; margin-bottom: 1rem; }
        .form-row { display: flex; gap: 1rem; margin-bottom: 0.9rem; }
        .field { flex: 1; display: flex; flex-direction: column; gap: 0.35rem; }
        .label { font-size: 0.875rem; color: #374151; }
        input[type="text"], input[type="email"] {
          width: 100%; padding: 0.7rem 0.9rem; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 1rem; outline: none;
        }
        input[type="text"]:focus, input[type="email"]:focus { border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34,197,94,0.15); }
        input:disabled { background: #f3f4f6; cursor: not-allowed; }
        .checkbox-row { align-items: center; gap: 0.5rem; margin-top: 0.25rem; }

        .continue-btn {
          width: 100%; background: linear-gradient(135deg, #15803d, #059669);
          color: white; border: none; border-radius: 10px; padding: 1rem 2rem;
          font-size: 1.05rem; font-weight: 700; margin-top: 0.2rem; cursor: pointer; transition: all 0.2s;
        }
        .continue-btn:disabled { background: #9ca3af; cursor: not-allowed; opacity: 0.6; }
        .continue-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16,185,129,0.35); }

        @media (max-width: 900px) {
          .shipping-content-grid { grid-template-columns: 1fr; gap: 2rem; }
          .shipping-main-container { padding: 1rem; }
          .grid-header, .grid-row { grid-template-columns: 70px 1fr 1.2fr 120px; }
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
        <Link href="/home" className="shop-now-btn">Start Shopping</Link>
      </div>

      <style jsx>{`
        .empty-cart { display: flex; align-items: center; justify-content: center; min-height: 60vh; }
        .empty-cart-content { text-align: center; max-width: 420px; }
        .empty-icon { color: #d1d5db; margin-bottom: 2rem; }
        .empty-cart-content h2 { font-size: 2rem; color: #1f2937; margin-bottom: 1rem; }
        .empty-cart-content p { color: #6b7280; margin-bottom: 2rem; line-height: 1.6; }
        .shop-now-btn {
          display: inline-block; background: linear-gradient(135deg, #15803d, #059669);
          color: white; text-decoration: none; padding: 1rem 2rem; border-radius: 12px;
          font-weight: 700; transition: all 0.3s;
        }
        .shop-now-btn:hover {
          background: linear-gradient(135deg, #166534, #047857);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(21, 128, 61, 0.3);
        }
      `}</style>
    </div>
  );
}