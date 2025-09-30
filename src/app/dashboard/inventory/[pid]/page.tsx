"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Sidebar from "../../../../components/sidebar";
import Navbar from "../../../../components/navbar";
import ItemCard from "../../../../components/itemcard";
import ProvinceCard from "../../../../components/provincecard";

interface Product {
  id: number;
  product_name: string;
  current_stock: number;
  daily_limit: number;
  average_price: number;
  final_price: number;
  unit: string;
  supplier_count: number;
  category_name: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

export default function Inventory() {
  const { pid } = useParams<{ pid: string }>();
  const { name } = useParams<{ name: string }>();
  const router = useRouter();
  const query = useSearchParams();

  const initialQ = query.get("q") ?? "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialQ);
  const [showAddModal, setShowAddModal] = useState(false);
  const pidNum = Number(pid);

  useEffect(() => {
    if (!Number.isFinite(pidNum) || pidNum <= 0) {
      setError("Invalid province id");
      setLoading(false);
      return;
    }
    fetchProducts(pidNum);
  }, [pidNum]);

  const fetchProducts = async (provinceId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${API_BASE_URL}/products/province/${provinceId}`,
        { cache: "no-store" }
      );
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.message || "Failed to fetch products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchProducts(pidNum);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const url = new URL(`${API_BASE_URL}/products`);
      url.searchParams.set("province_id", String(pidNum));
      url.searchParams.set("search", searchTerm);
      const response = await fetch(url.toString(), { cache: "no-store" });
      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.message || "Search failed");
      }
    } catch (err) {
      console.error("Error searching products:", err);
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProduct = {
      name: String(formData.get("product_name") || ""),
      category_id: Number(formData.get("category_id")) || 1,
      province_id: pidNum,
      daily_limit: Number(formData.get("daily_limit")) || 0,
      unit: (formData.get("unit") as string) || "kg",
      final_price: Number(formData.get("final_price")) || 0,
    };
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });
      const data = await response.json();
      if (data.success) {
        await fetchProducts(pidNum);
        setShowAddModal(false);
        alert("Product added successfully");
      } else {
        alert(data.message || "Failed to add product");
      }
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Error adding product");
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main">
        <Navbar />
        <div className="content">
          <div className="inventory-header">
            <h1>{name} Inventory</h1>
            <div className="header-actions">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search products…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button onClick={handleSearch} className="search-btn">
                  Search
                </button>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="add-product-btn"
              >
                + Add Product
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
              <button
                onClick={() => fetchProducts(pidNum)}
                className="retry-btn"
              >
                Retry
              </button>
            </div>
          )}

          {products.length === 0 ? (
            <div className="no-products">
              <p>No products found.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="add-first-product-btn"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="card-grid">
              {products.map((product) => (
                <ItemCard
                  key={product.id}
                  id={product.id}
                  name={product.product_name}
                  stock={product.current_stock}
                  unit={product.unit}
                  price={product.final_price}
                  suppliers={product.supplier_count}
                  category={product.category_name}
                  href={`/dashboard/inventory/${pid}/${product.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Centered POPUP modal */}
      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
          >
            <div className="modal-header">
              <h3>Add Products</h3>
              <button
                className="icon-btn"
                aria-label="Close"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>

            <form className="modal-form" onSubmit={handleAddProduct}>
              {/* row 1 */}
              <div className="field">
                <label>Product Name</label>
                <input
                  type="text"
                  name="product_name"
                  placeholder="e.g. Tomato"
                  required
                  maxLength={100}
                />
              </div>
              <div className="field">
                <label>Category</label>
                <select name="category_id" required>
                  <option value="1">Vegetables</option>
                  <option value="2">Fruits</option>
                  <option value="3">Root Vegetables</option>
                  <option value="4">Leafy Greens</option>
                  <option value="5">Citrus Fruits</option>
                </select>
              </div>

              {/* row 2 */}
              <div className="field">
                <label>Unit</label>
                <select name="unit">
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="lbs">Pounds (lbs)</option>
                  <option value="pieces">Pieces</option>
                  <option value="bunches">Bunches</option>
                </select>
              </div>
              <div className="field">
                <label>Daily Stock Limit</label>
                <input
                  type="number"
                  name="daily_limit"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              {/* row 3 (span 2) */}
              <div className="field span-2">
                <label>Final Price</label>
                <input
                  type="number"
                  name="final_price"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="actions span-2">
                <button type="button" className="btn ghost" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .loading {
          padding: 40px;
          text-align: center;
          font-size: 18px;
          color: #666;
        }
        .inventory-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }
        .header-actions {
          display: flex;
          gap: 15px;
          align-items: center;
          flex-wrap: wrap;
        }
        .search-container {
          display: flex;
          gap: 5px;
        }
        .search-container input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          width: 200px;
        }
        .search-btn,
        .add-product-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }
        .search-btn {
          background: #3b82f6;
          color: white;
        }
        .search-btn:hover {
          background: #2563eb;
        }
        .add-product-btn {
          background: #15803d;
          color: white;
        }
        .add-product-btn:hover {
          background: #166534;
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
        .no-products {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        .add-first-product-btn {
          background: #15803d;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 15px;
        }
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }

        /* ===== Centered Popup Styles ===== */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(4px);
          display: grid;
          place-items: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 120ms ease-out;
        }
        .modal-card {
          width: 100%;
          max-width: 560px;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
          padding: 18px 18px 22px;
          transform: scale(0.98);
          animation: popIn 140ms ease-out forwards;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }
        .icon-btn {
          background: transparent;
          border: none;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          color: #6b7280;
        }
        .icon-btn:hover {
          color: #111827;
        }

        .modal-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 16px;
          margin-top: 8px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field label {
          font-size: 12px;
          color: #4b5563;
          font-weight: 600;
        }
        .field input,
        .field select {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
          transition: box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .field input:focus,
        .field select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .span-2 {
          grid-column: 1 / -1;
        }
        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;
        }
        .btn {
          border: none;
          border-radius: 10px;
          padding: 10px 16px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn.ghost {
          background: #eef2ff;
          color: #3730a3;
        }
        .btn.ghost:hover {
          background: #e0e7ff;
        }
        .btn.primary {
          background: #16a34a;
          color: #fff;
        }
        .btn.primary:hover {
          background: #15803d;
        }

        @media (max-width: 560px) {
          .modal-form {
            grid-template-columns: 1fr;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          to { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
