import Link from "next/link";

type MaybeNumber = number | string | null | undefined;

interface ItemCardProps {
  id: number;
  name: string;
  stock?: MaybeNumber;
  unit?: string;
  price?: MaybeNumber;
  suppliers?: MaybeNumber;
  category?: string;
  href?: string;
}

const toNum = (v: MaybeNumber, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export default function ItemCard({
  id,
  name,
  stock = 0,
  unit = "kg",
  price = 0,
  suppliers = 0,
  category = "General",
  href,
}: ItemCardProps) {
  const stockNum = toNum(stock);
  const priceNum = toNum(price);
  const suppliersNum = toNum(suppliers);

  const getStockStatus = (s: number) => {
    if (s === 0) return "out-of-stock";
    if (s < 10) return "low-stock";
    return "in-stock";
  };

  const stockStatus = getStockStatus(stockNum);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (href) {
      return (
        <Link href={href} className="item-card">
          {children}
        </Link>
      );
    }
    return <div className="item-card">{children}</div>;
  };

  return (
    <Wrapper>
      <div className="card-inner">
        <div className="card-header">
          <div className="header-content">
            <h3 className="product-name">{name}</h3>
            <span className="category-badge">{category}</span>
          </div>
          <div className={`stock-badge ${stockStatus}`}>
            <div className="stock-dot"></div>
            <span className="stock-text">
              {stockStatus === "out-of-stock" ? "Out of Stock" : 
               stockStatus === "low-stock" ? "Low Stock" : "In Stock"}
            </span>
          </div>
        </div>

        <div className="card-content">
          <div className="info-grid">
            <div className="info-item stock-item">
              <div className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 7h-9M14 3v4M6 21V10a1 1 0 011-1h12a1 1 0 011 1v11" />
                  <path d="M6 21h14M6 21a2 2 0 01-2-2V10a1 1 0 011-1h2" />
                </svg>
              </div>
              <div className="info-text">
                <span className="info-label">Current Stock</span>
                <span className={`info-value ${stockStatus}`}>
                  {stockNum} {unit}
                </span>
              </div>
            </div>

            <div className="info-item price-item">
              <div className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 100 4h4a2 2 0 110 4H8M12 6v2M12 16v2" />
                </svg>
              </div>
              <div className="info-text">
                <span className="info-label">Price per {unit}</span>
                <span className="info-value price-value">Rs. {priceNum.toFixed(2)}</span>
              </div>
            </div>

            <div className="info-item supplier-item">
              <div className="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div className="info-text">
                <span className="info-label">Active Supplier{suppliersNum !== 1 ? "s" : ""}</span>
                <span className="info-value supplier-value">{suppliersNum}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .item-card {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          border-radius: 16px;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #e2e8f0;
          display: block;
          overflow: hidden;
          position: relative;
        }

        .item-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .item-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06);
          border-color: #10b981;
        }

        .item-card:hover::before {
          transform: scaleX(1);
        }

        .card-inner {
          padding: 24px;
          border-radius: 16px;
          border: 2px solid green;
        }

        .card-header {
          margin-bottom: 20px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 12px;
        }

        .product-name {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
          flex: 1;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }

        .category-badge {
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          color: #475569;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .stock-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .stock-badge.in-stock {
          background: #d1fae5;
          color: #065f46;
        }

        .stock-badge.low-stock {
          background: #fef3c7;
          color: #92400e;
        }

        .stock-badge.out-of-stock {
          background: #fee2e2;
          color: #991b1b;
        }

        .stock-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .stock-badge.in-stock .stock-dot {
          background: #10b981;
        }

        .stock-badge.low-stock .stock-dot {
          background: #f59e0b;
        }

        .stock-badge.out-of-stock .stock-dot {
          background: #ef4444;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
          transition: all 0.2s ease;
        }

        .info-item:hover {
          background: #fafafa;
          border-color: #e2e8f0;
        }

        .info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .stock-item .info-icon {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          color: #059669;
        }

        .price-item .info-icon {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #2563eb;
        }

        .supplier-item .info-icon {
          background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
          color: #9333ea;
        }

        .info-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .info-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .info-value {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .info-value.in-stock {
          color: #059669;
        }

        .info-value.low-stock {
          color: #d97706;
        }

        .info-value.out-of-stock {
          color: #dc2626;
        }

        .price-value {
          color: #2563eb;
        }

        .supplier-value {
          color: #9333ea;
        }

        .card-footer {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .view-details {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #10b981;
          transition: all 0.2s ease;
        }

        .item-card:hover .view-details {
          gap: 10px;
          color: #059669;
        }

        .view-details svg {
          transition: transform 0.2s ease;
        }

        .item-card:hover .view-details svg {
          transform: translateX(2px);
        }

        @media (max-width: 768px) {
          .card-inner {
            padding: 20px;
          }

          .product-name {
            font-size: 18px;
          }

          .info-item {
            padding: 12px;
          }

          .info-icon {
            width: 36px;
            height: 36px;
          }

          .info-value {
            font-size: 16px;
          }
        }
      `}</style>
    </Wrapper>
  );
}