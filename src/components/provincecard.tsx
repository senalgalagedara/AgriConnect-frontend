import Link from "next/link";

interface ProvinceCardProps {
  id: number;
  name: string;
  location?: string;
  manager?: string;
  totalProducts?: number;
  currentStock?: number;
  capacity?: number;
  href: string;
  isActive?: boolean;
}

export default function ProvinceCard({ 
  id,
  name, 
  location = '',
  manager = '',
  totalProducts = 0,
  currentStock = 0,
  capacity = 0,
  href,
  isActive = false
}: ProvinceCardProps) {
  const utilizationPercentage = capacity > 0 ? (currentStock / capacity) * 100 : 0;
  
  const getUtilizationStatus = (percentage: number) => {
    if (percentage >= 90) return 'high';
    if (percentage >= 70) return 'medium';
    return 'low';
  };

  const utilizationStatus = getUtilizationStatus(utilizationPercentage);

  const CardContent = () => (
    <div className={`province-card ${isActive ? 'active' : 'inactive'}`}>
      <div className="card-header">
        <h3 className="province-name">{name}</h3>
        {isActive && <span className="active-badge">Active</span>}
      </div>
      
      <div className="card-content">
        {location && (
          <div className="info-row">
            <span className="label">Location:</span>
            <span className="value">{location}</span>
          </div>
        )}
        
        {manager && (
          <div className="info-row">
            <span className="label">Manager:</span>
            <span className="value">{manager}</span>
          </div>
        )}
        
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{totalProducts}</span>
            <span className="stat-label">Products</span>
          </div>
          
          <div className="stat-item">
            <span className="stat-number">{currentStock.toFixed(0)}</span>
            <span className="stat-label">Stock (kg)</span>
          </div>
        </div>
        
        {capacity > 0 && (
          <div className="utilization-section">
            <div className="utilization-header">
              <span className="utilization-label">Capacity Utilization</span>
              <span className="utilization-percentage">
                {utilizationPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="utilization-bar">
              <div 
                className={`utilization-fill ${utilizationStatus}`}
                style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      {!isActive && (
        <div className="coming-soon">
          <span>Coming Soon</span>
        </div>
      )}

      <style jsx>{`
        .province-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          border: 2px solid transparent;
          position: relative;
          display: block;
          min-height: 280px;
        }

        .province-card.active {
          border-color: #15803d;
        }

        .province-card.active:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          border-color: #166534;
        }

        .province-card.inactive {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .province-name {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
          flex: 1;
        }

        .active-badge {
          background: #dcfce7;
          color: #166534;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .label {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .value {
          color: #1f2937;
          font-size: 14px;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 15px 0;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 24px;
          font-weight: bold;
          color: #15803d;
          margin-bottom: 4px;
        }

        .stat-label {
          color: #6b7280;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .utilization-section {
          margin-top: 5px;
        }

        .utilization-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .utilization-label {
          color: #6b7280;
          font-size: 12px;
          font-weight: 500;
        }

        .utilization-percentage {
          color: #1f2937;
          font-size: 12px;
          font-weight: 600;
        }

        .utilization-bar {
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
        }

        .utilization-fill {
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 3px;
        }

        .utilization-fill.low {
          background: #10b981;
        }

        .utilization-fill.medium {
          background: #f59e0b;
        }

        .utilization-fill.high {
          background: #ef4444;
        }

        .coming-soon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.95);
          padding: 12px 24px;
          border-radius: 8px;
          border: 2px solid #e5e7eb;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .province-card {
            padding: 20px;
            min-height: 250px;
          }

          .province-name {
            font-size: 18px;
          }

          .stats-grid {
            gap: 15px;
          }

          .stat-number {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );

  // If not active, return a div instead of Link
  if (!isActive) {
    return <CardContent />;
  }

  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      <CardContent />
    </Link>
  );
}