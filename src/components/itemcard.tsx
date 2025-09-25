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

  return (
    <Link href={`/dashboard/inventory/${id}`} className="item-card">
      <div className="card-header">
        <h3 className="product-name">{name}</h3>
        <span className="category-badge">{category}</span>
      </div>

      <div className="card-content">
        <div className="stock-info">
          <span className={`stock-status ${stockStatus}`}>
            {stockNum} {unit}
          </span>
          <span className="stock-label">Current Stock</span>
        </div>

        <div className="price-info">
          <span className="price">Rs. {priceNum.toFixed(2)}</span>
          <span className="price-label">per {unit}</span>
        </div>

        <div className="supplier-info">
          <span className="supplier-count">{suppliersNum}</span>
          <span className="supplier-label">
            Supplier{suppliersNum !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

     
      <style jsx>{`
        .item-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
          display: block;
        }

        .item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          border-color: #15803d;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;
        }

        .product-name {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          flex: 1;
          margin-right: 10px;
        }

        .category-badge {
          background: #f3f4f6;
          color: #6b7280;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stock-info,
        .price-info,
        .supplier-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stock-status {
          font-weight: 600;
          font-size: 16px;
        }

        .stock-status.in-stock {
          color: #059669;
        }

        .stock-status.low-stock {
          color: #d97706;
        }

        .stock-status.out-of-stock {
          color: #dc2626;
        }

        .price {
          font-weight: 600;
          color: #1f2937;
          font-size: 16px;
        }

        .supplier-count {
          font-weight: 600;
          color: #3b82f6;
          font-size: 16px;
        }

        .stock-label,
        .price-label,
        .supplier-label {
          color: #6b7280;
          font-size: 12px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .item-card {
            padding: 15px;
          }

          .product-name {
            font-size: 16px;
          }

          .stock-status,
          .price,
          .supplier-count {
            font-size: 14px;
          }
        }
      `}</style>
    </Link>
  );
}
