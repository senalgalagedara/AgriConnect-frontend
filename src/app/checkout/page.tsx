'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/NavbarHome';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api';
const USER_ID =1;

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
  orderId: number; 
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
  id: number; 
  customerName: string;
  email: string;
  total: number;
  paymentMethod: 'COD' | 'CARD';
  createdAt: string; 
  items: CartItem[];
};

function extractOrderId(json: any): number | null {
  if (!json || typeof json !== 'object') return null;
  if (typeof json.orderId === 'number') return json.orderId;
  if (typeof json.id === 'number') return json.id;
  if (json.order && typeof json.order.id === 'number') return json.order.id;
  if (Array.isArray(json.orders) && json.orders.length && typeof json.orders[0]?.id === 'number') {
    return json.orders[0].id;
  }
  return null;
}

function normalizeCartResponse(raw: any) {
  if (!raw || typeof raw !== 'object') {
    return {
      items: [],
      totals: { subtotal: 0, tax: 0, shippingFee: 0, total: 0 },
      cart: null,
    };
  }

  const items = Array.isArray(raw.items)
    ? raw.items
    : Array.isArray(raw.data?.items)
    ? raw.data.items
    : Array.isArray(raw.cart?.items)
    ? raw.cart.items
    : Array.isArray(raw.result?.items)
    ? raw.result.items
    : [];

  const shippingFee = raw.totals?.shippingFee ?? raw.data?.totals?.shippingFee ?? 0;
  const subtotalFromBackend = raw.totals?.subtotal ?? raw.data?.totals?.subtotal ?? null;

  const subtotal = typeof subtotalFromBackend === 'number'
    ? subtotalFromBackend
    : items.reduce((s: number, it: any) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);

  const tax = raw.totals?.tax ?? raw.data?.totals?.tax ?? +(subtotal * 0.065).toFixed(2);
  const total = raw.totals?.total ?? raw.data?.totals?.total ?? +(subtotal + tax + (shippingFee || 0)).toFixed(2);

  const cart = raw.cart ?? raw.data?.cart ?? (raw.cartId || raw.id ? raw : null);

  return {
    items,
    totals: { subtotal, tax, shippingFee: shippingFee || 0, total },
    cart,
  };
}

async function tryGetOrderIdFrom(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
    if (!res.ok) return null;
    // handle 204 No Content gracefully
    if (res.status === 204) return null;
    const json = await res.json().catch(() => null);
    return extractOrderId(json);
  } catch {
    return null;
  }
}

export default function PaymentPage() {
  const router = useRouter();
  const [data, setData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [method, setMethod] = useState<'COD' | 'CARD'>('COD');
  const [card, setCard] = useState({ number: '', mmYY: '', cvv: '' });
  const [processing, setProcessing] = useState(false);

  const getOrderIdFromBackend = async (): Promise<number | null> => {
    const localPending = Number(localStorage.getItem('pendingOrderId') || NaN);
    if (!Number.isNaN(localPending) && localPending > 0) return localPending;

    const candidates = [
      `${API_BASE}/orders/${USER_ID}`,
      `${API_BASE}/users/${USER_ID}/orders/pending`,
      `${API_BASE}/orders?userId=${USER_ID}&status=pending`,
      `${API_BASE}/orders/${USER_ID}`,
    ];
    for (const url of candidates) {
      const id = await tryGetOrderIdFrom(url);
      if (id) return id;
    }
    const misguided = await tryGetOrderIdFrom(`${API_BASE}/orders/${USER_ID}`);
    if (misguided) return misguided;
    return null;
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        // Get order ID from localStorage first
        const orderDataStr = localStorage.getItem('orderData');
        const legacyCheckout = localStorage.getItem('checkout');
        let localData: CheckoutData | null = null;

        if (orderDataStr) localData = JSON.parse(orderDataStr);
        else if (legacyCheckout) localData = JSON.parse(legacyCheckout);

        const orderId = localData?.orderId || Number(localStorage.getItem('pendingOrderId')) || await getOrderIdFromBackend();
        
        console.log('🔍 Order ID for checkout:', orderId);

        // If we have an order ID, fetch order items from order_items table
        if (orderId && orderId > 0) {
          const orderResponse = await fetch(`${API_BASE}/orders/${orderId}`);
          
          if (orderResponse.ok) {
            const orderData = await orderResponse.json();
            console.log('📦 Order data from backend:', orderData);
            
            // Extract items from response (check both data.items and data.order.items)
            const items = orderData.data?.items || orderData.items || [];
            const order = orderData.data?.order || orderData.data || orderData;
            
            console.log('📋 Order items:', items);
            
            const merged: CheckoutData = {
              orderId: orderId,
              cart: items,
              contact: order.contact || localData?.contact || {
                firstName: '',
                lastName: '',
                email: '',
                phone: ''
              },
              shipping: order.shipping || localData?.shipping || {
                house: '',
                address: '',
                city: '',
                state: '',
                postalCode: '',
                sameAsBilling: false
              },
              totals: {
                subtotal: Number(order.subtotal || 0),
                tax: Number(order.tax || 0),
                shippingFee: Number(order.shipping_fee || 0),
                total: Number(order.total || 0)
              }
            };

            setData(merged);
            localStorage.setItem('orderData', JSON.stringify(merged));
          } else {
            console.warn('❌ Failed to fetch order, using localStorage');
            if (localData) {
              setData(localData);
            }
          }
        } else {
          console.warn('⚠️ No order ID found, using localStorage');
          if (localData) {
            setData(localData);
          }
        }
      } catch (error) {
        console.error('Error loading order:', error);
        try {
          const orderDataStr = localStorage.getItem('orderData');
          if (orderDataStr) {
            setData(JSON.parse(orderDataStr));
          } else {
            setData(null);
          }
        } catch {
          setData(null);
        }
      } finally {
        setLoading(false);
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
      console.log('💳 Processing payment for order:', orderId, 'Method:', method);
      
      const requestBody: any = {
        status: 'processing',
        paymentMethod: method,
         };
         if (method === 'CARD' && card.number) {
           const digits = card.number.replace(/\D/g, '');
           requestBody.cardLast4 = digits.slice(-4);
      };
      if (method === 'CARD' && card.number) {
        const digits = card.number.replace(/\D/g, '');
        requestBody.cardLast4 = digits.slice(-4);
      }
      console.log('📤 Request body:', requestBody);
      
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 Payment response status:', response.status, response.statusText);

      if (!response.ok) {
        let message = 'Failed to update order status';
        const responseText = await response.text();
        console.error('❌ Raw response:', responseText);
        
        try {
          const error = JSON.parse(responseText);
          console.error('❌ Payment error response:', error);
          message = error?.message || error?.error || message;
        } catch (parseError) {
          console.error('❌ Could not parse error response, raw text:', responseText);
          message = responseText || message;
        }
        throw new Error(message);
      }

      const tx: Transaction = {
        id: orderId,
        customerName: `${data.contact.firstName} ${data.contact.lastName}`.trim(),
        email: data.contact.email,
        total: data.totals.total,
        paymentMethod: method,
        createdAt: new Date().toISOString(),
        items: data.cart,
      };

      const all = JSON.parse(localStorage.getItem('transactions') || '[]') as Transaction[];
      all.unshift(tx);
      localStorage.setItem('transactions', JSON.stringify(all));
      localStorage.setItem('lastInvoice', JSON.stringify(tx));

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

  // Update item quantity from checkout page
  const updateQuantity = async (itemId: number, newQty: number) => {
    if (newQty < 1) {
      await removeItem(itemId);
      return;
    }
    setUpdating(itemId);
    try {
      const res = await fetch(`${API_BASE}/cart/${USER_ID}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: newQty }),
      });
      if (!res.ok) throw new Error('Failed to update quantity');
      const raw = await res.json().catch(() => null);
      const normalized = normalizeCartResponse(raw);
      setData((prev) => prev ? { ...prev, cart: normalized.items, totals: normalized.totals } : prev);
      localStorage.setItem('orderData', JSON.stringify({ ...(data ?? {}), cart: normalized.items, totals: normalized.totals }));
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setUpdating(null);
    }
  };

  // Remove item from checkout page
  const removeItem = async (itemId: number) => {
    setUpdating(itemId);
    try {
      const res = await fetch(`${API_BASE}/cart/${USER_ID}/items/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove item');
      const raw = await res.json().catch(() => null);
      const normalized = normalizeCartResponse(raw);
      setData((prev) => prev ? { ...prev, cart: normalized.items, totals: normalized.totals } : prev);
      localStorage.setItem('orderData', JSON.stringify({ ...(data ?? {}), cart: normalized.items, totals: normalized.totals }));
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setUpdating(null);
    }
  };

  if (!data) {
    return (
      <div className="page">
        <Navbar cartItemCount={0} />
        <div className="empty">
          <h2>No checkout data found</h2>
          <p>Please go back to your cart to proceed with checkout.</p>
          <button className="btn btn-primary" onClick={() => router.push('/cart')}>Go to Cart</button>
        </div>

        <style jsx>{styles}</style>
      </div>
    );
  }

  const { cart, totals } = data;

  return (
      <div className="page">
        <Navbar cartItemCount={cart.reduce((s, it) => s + it.qty, 0)} />

        <div className="container">
          <div className="stepper">
            <span className="muted">Shipping</span>
            <span className="dash" />
            <span className="active">Payment</span>
          </div>

          <div className="columns">
            <div className="col">
              <h2 className="section-title">Order Summary</h2>

              <div className="table-container">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td data-label="Product">
                          <div className="product-info">
                            <div className="thumb">🛒</div>
                            <div>
                              <div className="item-name">{item.name || 'Product'}</div>
                              <div className="item-id">ID: {item.product_id}</div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Price" className="price-cell">${Number(item.price || 0).toFixed(2)}</td>
                        <td data-label="Quantity" className="qty-cell">{item.qty || 0}</td>
                        <td data-label="Total" className="total-cell">${(Number(item.price || 0) * Number(item.qty || 0)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card totals">
                <div className="totals-row">
                  <span>Subtotal</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span>Sales tax (6.5%)</span>
                  <span>${totals.tax.toFixed(2)}</span>
                </div>
                <div className="totals-row">
                  <span>Shipping Fee</span>
                  <span>{totals.shippingFee ? `$${totals.shippingFee.toFixed(2)}` : 'FREE'}</span>
                </div>
                <div className="totals-row total-due">
                  <span>Total due</span>
                  <span className="total-amount">${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="col">
              <section className="card">
                <h3 className="section-title small">Payment Methods</h3>

                <label className="pay-tile">
                  <input
                    type="radio"
                    name="pay"
                    checked={method === 'COD'}
                    onChange={() => setMethod('COD')}
                  />
                  <div className="tile-body">
                    <div className="tile-title">Pay on Delivery</div>
                    <div className="tile-sub">Pay with cash on delivery</div>
                  </div>
                </label>

                <label className="pay-tile">
                  <input
                    type="radio"
                    name="pay"
                    checked={method === 'CARD'}
                    onChange={() => setMethod('CARD')}
                  />
                  <div className="tile-body">
                    <div className="tile-title">Credit/Debit Cards</div>
                    <div className="tile-sub">Pay with your Credit / Debit Card</div>

                    <div className="grid">
                      <input
                        className="input"
                        disabled={method !== 'CARD'}
                        placeholder="Card number"
                        value={card.number}
                        onChange={(e) => setCard({ ...card, number: e.target.value })}
                      />
                      <div className="grid-2">
                        <input
                          className="input"
                          disabled={method !== 'CARD'}
                          placeholder="MM / YY"
                          value={card.mmYY}
                          onChange={(e) => setCard({ ...card, mmYY: e.target.value })}
                        />
                        <input
                          className="input"
                          disabled={method !== 'CARD'}
                          placeholder="CVV"
                          value={card.cvv}
                          onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </label>

                <div className="actions">
                  <button className="btn btn-ghost" onClick={() => router.back()}>Back</button>
                  <button className="btn btn-primary" disabled={disablePay} onClick={onPay}>
                    {processing ? 'Processing...' : 'Pay'}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>

        <style jsx>{styles}</style>
      </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="totals-row">
      <span>{label}</span>
      <span>{value}</span>
      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
:root{
  --bg:#f4f6f8;
  --card:#ffffff;
  --border:#e6e8ec;
  --text:#1f2937;
  --muted:#6b7280;
  --brand:#198754; /* green similar to mock */
  --brand-600:#157347;
  --brand-700:#11613c;
  --shadow-sm:0 1px 2px rgba(0,0,0,.05);
}

*{box-sizing:border-box}
.page{
  min-height:100vh;
  background:var(--bg);
  color:var(--text);
}

.container{
  max-width:1120px;
  margin:0 auto;
  padding:32px 16px 48px;
}

.stepper{
  display:flex;
  align-items:center;
  gap:12px;
  font-size:14px;
  margin-bottom:20px;
}
.stepper .muted{ color:var(--muted); }
.stepper .active{ color:var(--brand); font-weight:600; }
.stepper .dash{
  width:20px; height:1px; background:#cfd3da;
}

.columns{
  display:grid;
  grid-template-columns:1fr;
  gap:24px;
}
@media(min-width:1024px){
  .columns{ grid-template-columns:1fr 1fr; gap:32px; }
}
.col{}

.section-title{
  font-size:18px;
  font-weight:600;
  margin:0 0 12px;
}
.section-title.small{ font-size:16px; }

.card{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:12px;
  box-shadow:var(--shadow-sm);
  padding:16px;
}

.table-container{
  background:var(--card);
  border:1px solid var(--border);
  border-radius:12px;
  overflow:hidden;
}

.items-table{
  width:100%;
  border-collapse:collapse;
}

.items-table thead{
  background:#f9fafb;
}

.items-table th{
  text-align:left;
  padding:12px 16px;
  font-weight:600;
  font-size:13px;
  color:#374151;
  text-transform:uppercase;
  letter-spacing:0.025em;
  border-bottom:1px solid var(--border);
}

.items-table td{
  padding:14px 16px;
  border-bottom:1px solid #f3f4f6;
}

.items-table tbody tr:last-child td{
  border-bottom:none;
}

.items-table tbody tr:hover{
  background:#fafbfc;
}

.product-info{
  display:flex;
  align-items:center;
  gap:12px;
}

.thumb{
  width:48px;
  height:48px;
  border-radius:8px;
  background:#eef6f0;
  display:flex;
  align-items:center;
  justify-content:center;
  border:1px solid #dbe7df;
  font-size:20px;
  flex-shrink:0;
}

.item-name{
  font-weight:600;
  color:var(--text);
  margin-bottom:4px;
}

.item-id{
  color:var(--muted);
  font-size:12px;
}

.price-cell, .qty-cell, .total-cell{
  font-weight:600;
  color:var(--text);
  text-align:center;
}

.total-cell{
  color:var(--brand);
}

.totals{ margin-top:16px; padding:12px 16px; }
.totals-row{
  display:flex; justify-content:space-between; align-items:center;
  padding:10px 0;
  border-top:1px dashed var(--border);
}
.totals-row:first-child{ border-top:none; }
.total-due span:first-child{ font-weight:600; }
.total-amount{ color:var(--brand); font-weight:700; }

.pay-tile{
  display:flex; gap:12px; align-items:flex-start;
  border:1px solid var(--border);
  border-radius:12px;
  padding:12px;
  cursor:pointer;
  margin-bottom:12px;
  background:#fff;
}
.pay-tile:hover{ background:#fafafa; }
.pay-tile input[type="radio"]{
  margin-top:4px;
  width:18px; height:18px; accent-color:var(--brand-700);
}
.tile-body{ flex:1; }
.tile-title{ font-weight:600; }
.tile-sub{ color:var(--muted); font-size:13px; margin-top:2px; }

.grid{ display:flex; flex-direction:column; gap:8px; margin-top:10px; }
.grid-2{ display:grid; grid-template-columns:1fr 1fr; gap:8px; }

.input{
  width:100%;
  border:1px solid var(--border);
  border-radius:10px;
  padding:10px 12px;
  font-size:14px;
  outline:none;
  background:#fff;
}
.input:focus{ border-color:#c8d6cd; box-shadow:0 0 0 3px rgba(25,135,84,.12); }

.actions{
  margin-top:20px;
  display:flex; align-items:center; justify-content:space-between;
}

.btn{
  font-size:14px;
  border-radius:10px;
  padding:10px 18px;
  border:1px solid transparent;
  cursor:pointer;
  transition:filter .2s ease, transform .06s ease, background .2s ease, border-color .2s ease, opacity .2s ease;
}
.btn:disabled{ opacity:.6; cursor:not-allowed; }

.btn-ghost{
  background:#fff; border-color:var(--border);
}
.btn-ghost:hover{ background:#fff; filter:brightness(1.02); }

.btn-primary{
  color:#fff;
  background:linear-gradient(180deg, var(--brand), var(--brand-700));
  border-color:rgba(0,0,0,.06);
  box-shadow:0 6px 14px rgba(17,97,60,.15);
}
.btn-primary:hover{ filter:brightness(1.02); transform:translateY(-1px); }
.btn-primary:active{ transform:translateY(0); }

.empty{
  max-width:720px;
  margin:80px auto;
  background:#fff;
  border:1px solid var(--border);
  border-radius:12px;
  padding:28px;
  text-align:center;
}
.empty h2{ margin:0 0 8px; font-size:22px; }
.empty p{ color:var(--muted); margin:0 0 16px; }

@media(max-width:768px){
  .items-table thead{
    display:none;
  }
  
  .items-table, .items-table tbody, .items-table tr, .items-table td{
    display:block;
    width:100%;
  }
  
  .items-table tr{
    margin-bottom:16px;
    border:1px solid var(--border);
    border-radius:12px;
    overflow:hidden;
  }
  
  .items-table td{
    text-align:right;
    padding:12px 16px;
    position:relative;
    border-bottom:1px solid #f3f4f6;
  }
  
  .items-table td:before{
    content:attr(data-label);
    float:left;
    font-weight:600;
    color:#6b7280;
    font-size:12px;
    text-transform:uppercase;
  }
  
  .items-table td:first-child{
    text-align:left;
  }
  
  .items-table td:first-child:before{
    display:none;
  }
  
  .product-info{
    padding:4px 0;
  }
  
  .price-cell, .qty-cell, .total-cell{
    text-align:right;
  }
}
`;
