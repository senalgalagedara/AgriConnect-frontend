"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import Navbar from "../components/navbar";
import ProvinceCard from "../components/provincecard";

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

const API_BASE_URL = "http://localhost:5000/api";

export default function Home() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main">
          <Navbar />
          <div className="content">
            <div className="loading">Loading provinces...</div>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Navbar />
        <div className="content">
          <div className="dashboard-header">
            <h1>Inventory Dashboard</h1>
            <p className="dashboard-subtitle">
              Select a province to manage inventory
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
              <button onClick={fetchProvinces} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          <div className="card-grid">
            {provinces.map((province) => (
              <ProvinceCard
                key={province.id}
                id={province.id}
                name={province.name}
                location={province.location}
                manager={province.manager_name}
                totalProducts={safeNumber(province.total_products)}
                currentStock={safeNumber(province.total_current_stock)}
                capacity={province.capacity}
                href={province.id === 1 ? "/inventory" : "#"}
                isActive={province.id === 1}
              />
            ))}
          </div>

          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Provinces</h3>
              <p className="stat-number">{provinces.length}</p>
            </div>

            <div className="stat-card">
              <h3>Active Provinces</h3>
              <p className="stat-number">1</p>
              <span className="stat-label">Western Province</span>
            </div>

            <div className="stat-card">
              <h3>Total Products</h3>
              <p className="stat-number">{totalProducts}</p>
            </div>

            <div className="stat-card">
              <h3>Total Stock</h3>
              <p className="stat-number">{totalStock.toFixed(0)} kg</p>
            </div>
          </div>
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

        .dashboard-stats {
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
          .dashboard-stats {
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
