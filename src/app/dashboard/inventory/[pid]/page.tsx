"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
interface Province{
  name: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

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
      const response = await fetch(`${API_BASE_URL}/products/province/${provinceId}`, { cache: "no-store" });
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
      const response = await fetch(
        `${API_BASE_URL}/products/province/${pidNum}/search?q=${encodeURIComponent(searchTerm)}`
      );
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
      product_name: String(formData.get("product_name") || ""),
      category_id: Number(formData.get("category_id")) || 1,
      province_id: pidNum, 
      daily_limit: Number(formData.get("daily_limit")) || 0,
      unit: (formData.get("unit") as string) || "kg",
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

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main">
          <Navbar />
          <div className="content">
            <div className="loading">Loading products…</div>
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
                <button onClick={handleSearch} className="search-btn">Search</button>
              </div>
              <button onClick={() => setShowAddModal(true)} className="add-product-btn">
                + Add Product
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => fetchProducts(pidNum)} className="retry-btn">Retry</button>
            </div>
          )}

          {products.length === 0 ? (
            <div className="no-products">
              <p>No products found.</p>
              <button onClick={() => setShowAddModal(true)} className="add-first-product-btn">
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="card-grid">
  {products.map((product) => (
    <Link
      key={product.id}
      href={`/dashboard/inventory/${pid}/ ${product.id}`}
      className="no-underline"
    >
      <ItemCard
        id={product.id}
        name={product.product_name}
        stock={product.current_stock}
        unit={product.unit}
        price={product.final_price}
        suppliers={product.supplier_count}
        category={product.category_name}
      />
    </Link>
  ))}
</div>
          )}
        </div>
      </div>

      {}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Product</h3>
            <form className="product-form" onSubmit={handleAddProduct}>
              <label>Product Name</label>
              <input type="text" name="product_name" placeholder="Enter product name" required maxLength={100} />

              <label>Category</label>
              <select name="category_id" required>
                <option value="1">Vegetables</option>
                <option value="2">Fruits</option>
                <option value="3">Root Vegetables</option>
                <option value="4">Leafy Greens</option>
                <option value="5">Citrus Fruits</option>
              </select>

              <label>Unit</label>
              <select name="unit">
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="lbs">Pounds (lbs)</option>
                <option value="pieces">Pieces</option>
                <option value="bunches">Bunches</option>
              </select>

              <label>Daily Stock Limit</label>
              <input type="number" name="daily_limit" placeholder="Enter daily limit" min="0" step="0.01" />

              <div className="form-actions">
                <button type="submit">Add Product</button>
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .loading { padding: 40px; text-align: center; font-size: 18px; color: #666; }
        .inventory-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; }
        .header-actions { display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
        .search-container { display: flex; gap: 5px; }
        .search-container input { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; width: 200px; }
        .search-btn, .add-product-btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
        .search-btn { background: #3b82f6; color: white; }
        .search-btn:hover { background: #2563eb; }
        .add-product-btn { background: #15803d; color: white; }
        .add-product-btn:hover { background: #166534; }
        .error-message { background: #fee2e2; color: #dc2626; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .retry-btn { background: #dc2626; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
        .no-products { text-align: center; padding: 40px; color: #666; }
        .add-first-product-btn { background: #15803d; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-top: 15px; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: #fff; padding: 20px; border-radius: 12px; width: 400px; max-height: 90vh; overflow-y: auto; }
        .product-form { display: flex; flex-direction: column; }
        .product-form label { margin-top: 10px; font-weight: bold; }
        .product-form input, .product-form select { padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 6px; font-family: inherit; }
        .form-actions { display: flex; justify-content: space-between; margin-top: 20px; gap: 10px; }
        .form-actions button { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; flex: 1; font-weight: 500; }
        .form-actions button:first-child { background: #15803d; color: white; }
        .form-actions button:first-child:hover { background: #166534; }
        .form-actions button:last-child { background: #6b7280; color: white; }
        .form-actions button:last-child:hover { background: #4b5563; }
        @media (max-width: 768px) {
          .inventory-header { flex-direction: column; align-items: stretch; }
          .header-actions { justify-content: space-between; }
          .search-container input { width: 150px; }
        }
      `}</style>
    </div>
  );
}
