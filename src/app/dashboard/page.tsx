"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/sidebar";
import Navbar from "../../components/navbar";

interface Province {
  id: number;
  name: string;
  capacity: number;
  current_stock: number;
  total_products: number;
  total_current_stock: number | string | null; 
  location: string;
  manager_name: string;
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingDeliveries: number;
  totalFeedback: number;
  totalPayments: number;
}

const API_BASE_URL = "http://localhost:5000/api";

export default function AdminDashboard() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory'>('overview');

  const [dashboardStats] = useState<DashboardStats>({
    totalUsers: 1250,
    totalOrders: 890,
    totalRevenue: 125000,
    pendingDeliveries: 45,
    totalFeedback: 234,
    totalPayments: 780,
  });

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/provinces`);

      if (!response.ok) {
        throw new Error("Failed to fetch provinces");
      }

      const data = await response.json();
      if (data.success) {
        setProvinces(data.data);
      } else {
        setError(data.message || "Failed to fetch provinces");
      }
    } catch (err) {
      console.error("Error fetching provinces:", err);
      setError("Failed to fetch provinces");
    } finally {
      setLoading(false);
    }
  };

  const safeNumber = (val: unknown): number => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  };

  const totalProducts = provinces.reduce(
    (sum, p) => sum + safeNumber(p.total_products),
    0
  );

  const totalStock = provinces.reduce(
    (sum, p) => sum + safeNumber(p.total_current_stock),
    0
  );



  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main">
          <Navbar />
          <div className="content">
            <div className="loading">Loading dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Navbar />
        <div className="content">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p className="dashboard-subtitle">
              Manage your entire system from one place
            </p>
          </div>
          {activeTab === 'overview' && (
            <div className="overview-section">
              <div className="metrics-grid">
                <div className="metric-card revenue">
                  <h3>Total Revenue</h3>
                  <p className="metric-number">Rs. {dashboardStats.totalRevenue.toLocaleString()}</p>
                  <span className="metric-trend">+12% from last month</span>
                </div>
                <div className="metric-card orders">
                  <h3>Total Orders</h3>
                  <p className="metric-number">{dashboardStats.totalOrders}</p>
                  <span className="metric-trend">+8% from last week</span>
                </div>
                <div className="metric-card users">
                  <h3>Active Users</h3>
                  <p className="metric-number">{dashboardStats.totalUsers}</p>
                  <span className="metric-trend">+15% growth</span>
                </div>
                <div className="metric-card deliveries">
                  <h3>Pending Deliveries</h3>
                  <p className="metric-number">{dashboardStats.pendingDeliveries}</p>
                  <span className="metric-trend">Requires attention</span>
                </div>
              </div>             
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        .loading {
          padding: 40px;
          text-align: center;
          font-size: 18px;
          color: #666;
        }

        .dashboard-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .dashboard-subtitle {
          color: #666;
          margin-top: 8px;
          font-size: 16px;
        }

        .tab-navigation {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }

        .tab-btn {
          padding: 10px 20px;
          border: none;
          background: #f3f4f6;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .tab-btn:hover {
          background: #e5e7eb;
        }

        .tab-btn.active {
          background: #3b82f6;
          color: white;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .metric-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #3b82f6;
        }

        .metric-card.revenue { border-left-color: #10b981; }
        .metric-card.orders { border-left-color: #f59e0b; }
        .metric-card.users { border-left-color: #3b82f6; }
        .metric-card.deliveries { border-left-color: #ef4444; }

        .metric-card h3 {
          margin: 0 0 10px 0;
          color: #374151;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .metric-number {
          margin: 0 0 5px 0;
          font-size: 28px;
          font-weight: bold;
          color: #111827;
        }

        .metric-trend {
          font-size: 12px;
          color: #10b981;
        }

        .admin-modules h2 {
          margin-bottom: 20px;
          color: #111827;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .module-card {
          display: block;
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
        }

        .module-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .module-icon {
          font-size: 24px;
        }

        .module-count {
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 12px;
        }

        .module-count.blue { background: #dbeafe; color: #1e40af; }
        .module-count.orange { background: #fed7aa; color: #ea580c; }
        .module-count.green { background: #dcfce7; color: #166534; }
        .module-count.purple { background: #e9d5ff; color: #7c3aed; }

        .module-card h3 {
          margin: 0 0 10px 0;
          color: #111827;
          font-size: 18px;
          font-weight: 600;
        }

        .module-card p {
          margin: 0 0 15px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .module-action {
          color: #3b82f6;
          font-weight: 600;
          font-size: 14px;
        }

        .section-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .section-header h2 {
          margin-bottom: 8px;
          color: #111827;
        }

        .section-header p {
          color: #6b7280;
        }

        .error-message {
          background: #fee2e2;
          color: #dc2626;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .retry-btn {
          background: #dc2626;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }

        .retry-btn:hover {
          background: #b91c1c;
        }

        .inventory-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e5e7eb;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
        }

        .stat-card h3 {
          margin: 0 0 10px 0;
          color: #374151;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-number {
          margin: 0;
          font-size: 32px;
          font-weight: bold;
          color: #15803d;
        }

        .stat-label {
          color: #6b7280;
          font-size: 12px;
          margin-top: 5px;
          display: block;
        }

        @media (max-width: 768px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .modules-grid {
            grid-template-columns: 1fr;
          }

          .inventory-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat-number {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}