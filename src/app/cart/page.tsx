'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Minus, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import Navbar from '../../components/NavbarHome';

// ---- Config ----
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api';
const USER_ID = '02a6e5c3-67f3-463c-aebd-3c1a38d7466b'; // real uuid
const TAX_RATE = 0.065;

// ---- Types ----
interface CartItem {
  id: number;          // cart_items.id
  product_id: number;  // products.id
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

export default function CartPage() {
  const router = useRouter();

  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

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
    } catch {
      // ignore localStorage JSON issues
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/cart/${USER_ID}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();

      // Defensive guards
      const items: CartItem[] = Array.isArray(data?.items) ? data.items : [];
      const totals: CartTotals =
        typeof data?.totals === 'object' && data.totals
          ? data.totals
          : { subtotal: 0, tax: 0, shippingFee: 0, total: 0 };

      const normalized: CartData = { cart: data?.cart ?? null, items, totals };
      setCartData(normalized);

      // Mirror to localStorage for later pages if needed
      try {
        localStorage.setItem(
          'cart',
          JSON.stringify(
            items.map((item) => ({
              id: item.product_id,
              name: item.name,
              price: item.price,
              qty: item.qty,
              unit: item.unit || 'kg',
            }))
          )
        );
      } catch {}
    } catch (err) {
      console.error(err);
      setCartData({ cart: null, items: [], totals: { subtotal: 0, tax: 0, shippingFee: 0, total: 0 } });
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
      const response = await fetch(`${API_BASE}/cart/${USER_ID}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: newQty }),
      });
      if (!response.ok) throw new Error('Failed to update quantity');

      const updated = await response.json();
      setCartData(updated);

      try {
        localStorage.setItem(
          'cart',
          JSON.stringify(
            updated.items.map((item: CartItem) => ({
              id: item.product_id,
              name: item.name,
              price: item.price,
              qty: item.qty,
              unit: item.unit || 'kg',
            }))
          )
        );
      } catch {}
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    setUpdating(itemId);
    try {
      const response = await fetch(`${API_BASE}/cart/${USER_ID}/items/${itemId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to remove item');

      const updated = await response.json();
      setCartData(updated);

      try {
        localStorage.setItem(
          'cart',
          JSON.stringify(
            updated.items.map((item: CartItem) => ({
              id: item.product_id,
              name: item.name,
              price: item.price,
              qty: item.qty,
              unit: item.unit || 'kg',
            }))
          )
        );
      } catch {}
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const proceedToCheckout = () => {
    if (!cartData || cartData.items.length === 0) return;

    // Save details for the next step/page
    try {
      localStorage.setItem('contact', JSON.stringify(contact));
      localStorage.setItem('shipping', JSON.stringify(shipping));
      localStorage.setItem(
        'checkout',
        JSON.stringify({
          cart: cartData.items.map((item) => ({
            id: item.product_id.toString(),
            name: item.name,
            price: item.price,
            qty: item.qty,
            unit: item.unit,
          })),
          contact,
          shipping,
          totals: cartData.totals,
        })
      );
    } catch {}
    router.push('/checkout');
  };

  const getProductImage = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('corn')) return '🌽';
    if (lower.includes('chili') || lower.includes('pepper')) return '🌶️';
    if (lower.includes('tomato')) return '🍅';
    if (lower.includes('carrot')) return '🥕';
    if (lower.includes('onion')) return '🧅';
    if (lower.includes('potato')) return '🥔';
    if (lower.includes('apple')) return '🍎';
    if (lower.includes('banana')) return '🍌';
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

        <style jsx>{`
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
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  const isEmpty = !cartData || cartData.items.length === 0;

  return (
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
                  {cartData!.items.map((item) => (
                    <div key={item.id} className="cart-item">
                      <div className="item-image">
                        <span className="item-emoji">{getProductImage(item.name)}</span>
                      </div>

                      <div className="item-details">
                        <h3 className="item-name">{item.name}</h3>
                        <p className="item-price">
                          Rs. {item.price.toFixed(2)} per {item.unit || 'kg'}
                        </p>
                      </div>

                      <div className="item-quantity">
                        <button
                          onClick={() => updateQuantity(item.id, item.qty - 1)}
                          disabled={updating === item.id}
                          className="qty-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="qty-display">{item.qty}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.qty + 1)}
                          disabled={updating === item.id}
                          className="qty-btn"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="item-total">Rs. {(item.price * item.qty).toFixed(2)}</div>

                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="remove-btn"
                        title="Remove item"
                        aria-label={`Remove ${item.name}`}
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
                    <span>Rs. {cartData!.totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Tax ({(TAX_RATE * 100).toFixed(1)}%)</span>
                    <span>Rs. {cartData!.totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>
                      {cartData!.totals.shippingFee > 0
                        ? `Rs. ${cartData!.totals.shippingFee.toFixed(2)}`
                        : 'FREE'}
                    </span>
                  </div>
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>Rs. {cartData!.totals.total.toFixed(2)}</span>
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
                  disabled={
                    !contact.firstName || !contact.lastName || !contact.email || !shipping.address
                  }
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Page styles */}
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
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
          box-shadow: 0 4px 15px rgba(21, 128, 61, 0.3);
        }
        .proceed-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Mobile */
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
      `}</style>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

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
          box-shadow: 0 4px 15px rgba(21, 128, 61, 0.3);
        }
      `}</style>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  className = '',
  required = false,
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
