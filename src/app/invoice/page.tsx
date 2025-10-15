'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Download, Home, Truck } from 'lucide-react';
import Navbar from '../../components/NavbarHome';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:5000/api';

interface CartItem {
  id: string;
  name: string;
  price: number | string; 
  qty: number | string;   
  unit?: string;
}

interface Transaction {
  id: string;
  customerName: string;
  email: string;
  total: number | string; 
  paymentMethod: 'COD' | 'CARD';
  createdAt: string;
  items: CartItem[];
}

export default function InvoicePage() {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  // number coercion helper
  const num = (v: unknown) => (typeof v === 'number' ? v : Number(v) || 0);

  useEffect(() => {
    try {
      const savedInvoice = localStorage.getItem('lastInvoice');
      if (savedInvoice) {
        const raw = JSON.parse(savedInvoice) as Transaction;

        const normalized: Transaction = {
          ...raw,
          total: num(raw.total),
          items: (raw.items || []).map((it) => ({
            ...it,
            price: num(it.price),
            qty: num(it.qty),
          })),
        };

        (async () => {
          try {
            const possibleId = (raw as any).id;
            const numericId = Number(possibleId);
            if (Number.isFinite(numericId) && numericId > 0) {
              const response = await fetch(`${API_BASE}/orders/${numericId}`);
              if (response.ok) {
                const fresh = await response.json();
                const backendOrder = fresh.data || fresh;
                const itemsFromBackend = backendOrder.items || [];

                const mappedItems: CartItem[] = (itemsFromBackend || []).map((it: any, idx: number) => ({
                  id: String(it.product_id ?? it.id ?? idx),
                  name: it.name ?? it.product_name ?? `Item ${idx + 1}`,
                  price: Number(it.price ?? it.unit_price ?? it.amount ?? 0),
                  qty: Number(it.qty ?? it.quantity ?? 1),
                }));

                const merged: Transaction = {
                  id: String(backendOrder.id ?? backendOrder.order_no ?? raw.id),
                  customerName: (raw.customerName ?? (raw as any).customer ?? ''),
                  email: backendOrder.contact?.email ?? raw.email ?? '',
                  total: Number(backendOrder.total ?? backendOrder.amount ?? raw.total ?? 0),
                  paymentMethod: (backendOrder.paymentMethod as 'COD' | 'CARD') ?? raw.paymentMethod ?? 'COD',
                  createdAt: backendOrder.created_at ?? backendOrder.createdAt ?? raw.createdAt ?? new Date().toISOString(),
                  items: mappedItems,
                };

                setTransaction(merged);
                return;
              }
            }
          } catch (e) {
            // ignore fetch errors and fall back to local copy
            console.error('Failed to fetch fresh order', e);
          }

          setTransaction(normalized);
        })();
      }
    } catch {
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstimatedDelivery = () => {
    const now = new Date();
    const deliveryDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days
    return deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Navbar cartItemCount={0} />
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading invoice...</h2>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="error-screen">
        <Navbar cartItemCount={0} />
        <div className="error-content">
          <h2>Invoice Not Found</h2>
          <p>No invoice data available. Please complete a purchase first.</p>
          <Link href="/home" className="home-button">
            <Home size={20} />
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-page">
      <Navbar cartItemCount={0} />

      <div className="invoice-container">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">
            <CheckCircle size={60} />
          </div>
          <h1 className="success-title">Order Confirmed!</h1>
          <p className="success-message">
            Thank you for your order. Your fresh produce will be delivered soon.
          </p>
        </div>

        {/* Invoice Details */}
        <div className="invoice-content">
          <div className="invoice-grid">
            {/* Order Information */}
            <div className="info-section">
              <h2 className="section-title">Order Details</h2>
              <div className="info-card">
                <div className="info-row">
                  <span className="info-label">Order ID:</span>
                  <span className="info-value">{transaction.id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Order Date:</span>
                  <span className="info-value">{formatDate(transaction.createdAt)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Customer:</span>
                  <span className="info-value">{transaction.customerName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{transaction.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Payment Method:</span>
                  <span className="info-value">
                    {transaction.paymentMethod === 'CARD' ? 'Credit/Debit Card' : 'Cash on Delivery'}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="info-section">
              <h2 className="section-title">
                <Truck size={20} />
                Delivery Information
              </h2>
              <div className="info-card">
                <div className="delivery-status">
                  <div className="status-badge processing">Processing</div>
                  <p className="status-text">Your order is being prepared</p>
                </div>
                <div className="info-row">
                  <span className="info-label">Estimated Delivery:</span>
                  <span className="info-value delivery-date">{getEstimatedDelivery()}</span>
                </div>
                <div className="delivery-note">
                  <p>📞 Our delivery team will call you 30 minutes before delivery</p>
                  <p>🕐 Delivery time: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="items-section">
            <h2 className="section-title">Items Ordered</h2>
            <div className="items-card">
              <div className="items-header">
                <span>Item</span>
                <span>Quantity</span>
                <span>Price</span>
                <span>Total</span>
              </div>
              <div className="items-list">
                {transaction.items.map((item) => {
                  const price = typeof item.price === 'number' ? item.price : Number(item.price) || 0;
                  const qty = typeof item.qty === 'number' ? item.qty : Number(item.qty) || 0;
                  return (
                    <div key={item.id} className="item-row">
                      <div className="item-info">
                        <span className="item-emoji">{getProductImage(item.name)}</span>
                        <span className="item-name">{item.name}</span>
                      </div>
                      <span className="item-quantity">
                        {qty} {item.unit || 'kg'}
                      </span>
                      <span className="item-price">Rs. {price.toFixed(2)}</span>
                      <span className="item-total">Rs. {(price * qty).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="items-footer">
                <div className="total-row">
                  <span>Order Total:</span>
                  <span className="total-amount">
                    Rs. {((typeof transaction.total === 'number' ? transaction.total : Number(transaction.total) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="actions-section">
            <button onClick={handlePrint} className="action-btn primary">
              <Download size={20} />
              Download Receipt
            </button>
            <Link href="/home" className="action-btn secondary">
              <Home size={20} />
              Continue Shopping
            </Link>
          </div>

          {/* Thank You Note */}
          <div className="thank-you-section">
            <h3>Thank you for choosing AgriConnect!</h3>
            <p>
              We're committed to bringing you the freshest produce directly from local farmers. Your support helps our
              farming community thrive.
            </p>
            <div className="contact-info">
              <p>Questions about your order?</p>
              <p>📧 Email: support@agriconnect.com</p>
              <p>📞 Phone: +94 11 123 4567</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .invoice-page {
          min-height: 100vh;
          background: #fafafa;
        }

        .loading-screen,
        .error-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .loading-content,
        .error-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
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

        .home-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #15803d;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .home-button:hover {
          background: #166534;
          transform: translateY(-1px);
        }

        .invoice-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .success-header {
          text-align: center;
          margin-bottom: 3rem;
          background: white;
          border-radius: 16px;
          padding: 3rem 2rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .success-icon {
          color: #10b981;
          margin-bottom: 1rem;
          display: flex;
          justify-content: center;
        }

        .success-title {
          font-size: 2.5rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .success-message {
          color: #6b7280;
          font-size: 1.1rem;
          margin: 0;
        }

        .invoice-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .invoice-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .info-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: bold;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .info-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
        }

        .info-label {
          color: #6b7280;
          font-weight: 500;
        }

        .info-value {
          color: #1f2937;
          font-weight: 600;
        }

        .delivery-status {
          text-align: center;
          padding: 1rem 0;
        }

        .status-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .status-badge.processing {
          background: #fef3c7;
          color: #92400e;
        }

        .status-text {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        .delivery-date {
          color: #15803d !important;
          font-size: 1.1rem;
        }

        .delivery-note {
          background: #f0fdf4;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #15803d;
        }

        .delivery-note p {
          margin: 0.25rem 0;
          color: #166534;
          font-size: 0.9rem;
        }

        .items-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .items-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .items-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 2px solid #e5e7eb;
          font-weight: 600;
          color: #1f2937;
        }

        .items-list {
          display: flex;
          flex-direction: column;
        }

        .item-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 1rem;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .item-row:last-child {
          border-bottom: none;
        }

        .item-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .item-emoji {
          font-size: 1.5rem;
        }

        .item-name {
          font-weight: 500;
          color: #1f2937;
        }

        .item-quantity,
        .item-price {
          color: #6b7280;
        }

        .item-total {
          font-weight: 600;
          color: #15803d;
        }

        .items-footer {
          border-top: 2px solid #e5e7eb;
          padding-top: 1rem;
          margin-top: 1rem;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-amount {
          font-size: 1.5rem;
          font-weight: bold;
          color: #15803d;
        }

        .actions-section {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin: 2rem 0;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1rem;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #15803d, #059669);
          color: white;
        }

        .action-btn.primary:hover {
          background: linear-gradient(135deg, #166534, #047857);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(21, 128, 61, 0.3);
        }

        .action-btn.secondary {
          background: white;
          color: #15803d;
          border: 2px solid #15803d;
        }

        .action-btn.secondary:hover {
          background: #15803d;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(21, 128, 61, 0.3);
        }

        .thank-you-section {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          border: 1px solid #bbf7d0;
        }

        .thank-you-section h3 {
          color: #15803d;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .thank-you-section p {
          color: #166534;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .contact-info {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #d1fae5;
        }

        .contact-info p {
          margin: 0.5rem 0;
          color: #15803d;
          font-weight: 500;
        }

        .contact-info p:first-child {
          font-weight: 600;
          margin-bottom: 1rem;
        }

        /* Print Styles */
        @media print {
          .invoice-page {
            background: white;
          }

          .navbar,
          .actions-section {
            display: none;
          }

          .invoice-container {
            max-width: none;
            padding: 0;
          }

          .success-header,
          .info-card,
          .items-card,
          .thank-you-section {
            box-shadow: none;
            border: 1px solid #e5e7eb;
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .invoice-container {
            padding: 1rem;
          }

          .success-header {
            padding: 2rem 1rem;
          }

          .success-title {
            font-size: 2rem;
          }

          .invoice-grid {
            grid-template-columns: 1fr;
          }

          .items-header,
          .item-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            text-align: center;
          }

          .item-info {
            justify-content: center;
          }

          .actions-section {
            flex-direction: column;
            align-items: center;
          }

          .action-btn {
            width: 100%;
            justify-content: center;
          }

          .thank-you-section {
            padding: 1.5rem;
          }
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
