"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation"; // ✅ Fix: useParams hook
import Sidebar from "../../../../../components/sidebar";
import Navbar from "../../../../../components/navbar";

interface Supplier {
  id: number;
  farmer_id: number;
  farmer_name: string;
  farmer_contact: string;
  quantity: number;
  price_per_unit: number;
  supply_date: string;
  notes?: string;
}

interface Product {
  id: number;
  product_name: string;
  current_stock: number;
  daily_limit: number;
  average_price: number;
  final_price: number;
  unit: string;
  suppliers?: Supplier[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

export default function ItemPage() {
  const params = useParams<{ id: string; pid: string }>(); // ✅ useParams returns { id, pid }
  const id = params?.id; // unwrap id safely
  const pid = params?.pid; // province id for farmer lookup

  const [product, setProduct] = useState<Product | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dailyLimit, setDailyLimit] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [farmers, setFarmers] = useState<Array<{ id: number; name: string; contact_number?: string }>>([]);
  const [farmerQuery, setFarmerQuery] = useState("");
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        // Fetch product details
        const productRes = await fetch(`${API_BASE_URL}/products/${id}`, { cache: "no-store" });
        if (!productRes.ok) throw new Error("Failed to fetch product details");
        const productData = await productRes.json();

        // Fetch suppliers list for product
        const suppliersRes = await fetch(`${API_BASE_URL}/suppliers/product/${id}`, { cache: "no-store" });
        if (!suppliersRes.ok) throw new Error("Failed to fetch suppliers");
        const suppliersData = await suppliersRes.json();

        if (productData.success) {
          setProduct(productData.data);
          setDailyLimit(productData.data?.daily_limit || 0);
        } else {
          setError(productData.message || "Failed to fetch product details");
        }

        if (suppliersData.success) {
          setSuppliers(suppliersData.data || []);
        }
      } catch (err) {
        console.error("Error fetching product data:", err);
        setError("Failed to fetch product data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  // Fetch farmers for the province for name-based selection
  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        if (!pid) return;
        const res = await fetch(`${API_BASE_URL}/farmers/province/${pid}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setFarmers(data.data);
        }
      } catch (e) {
        // ignore silently for now
      }
    };
    fetchFarmers();
  }, [pid]);

  const filteredFarmers = useMemo(() => {
    const q = farmerQuery.trim().toLowerCase();
    if (!q) return farmers.slice(0, 10);
    return farmers.filter((f: any) => String(f.name).toLowerCase().includes(q)).slice(0, 10);
  }, [farmerQuery, farmers]);

  const handleDailyLimitUpdate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}` , {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daily_limit: dailyLimit }),
      });

      const data = await response.json();
      if (data.success) {
        setProduct((prev) =>
          prev ? { ...prev, daily_limit: dailyLimit } : null
        );
        alert("Daily limit updated successfully");
      } else {
        alert("Failed to update daily limit");
      }
    } catch (err) {
      console.error("Error updating daily limit:", err);
      alert("Error updating daily limit");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newSupplier = {
      farmer_id: Number(formData.get("farmer_id")),
      product_id: Number(id),
      quantity: Number(formData.get("quantity")),
      price_per_unit: Number(formData.get("price_per_unit")),
      supply_date: formData.get("supply_date") as string,
      notes: formData.get("notes") as string,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSupplier),
      });

      const data = await response.json();
      if (data.success) {
        const updatedResponse = await fetch(
          `${API_BASE_URL}/suppliers/product/${id}`
        );
        const updatedData = await updatedResponse.json();

        if (updatedData.success) {
          setProduct(updatedData.data);
          setSuppliers(updatedData.data.suppliers || []);
        }

        setShowModal(false);
        alert("Supplier added successfully");
      } else {
        alert(data.message || "Failed to add supplier");
      }
    } catch (err) {
      console.error("Error adding supplier:", err);
      alert("Error adding supplier");
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main">
          <Navbar />
          <div className="content">
            <div className="loading">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main">
          <Navbar />
          <div className="content">
            <div className="error">Error: {error || "Product not found"}</div>
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
        <div className="content product-page">
          <h2>
            P#{product.id} - {product.product_name}
          </h2>

          <div className="product-row">
            <table className="farmer-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Farmer Name</th>
                  <th>Contact</th>
                  <th>Quantity ({product.unit})</th>
                  <th>Unit Price (Rs.)</th>
                  <th>Supply Date</th>
                  <th>Total Value (Rs.)</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "#666" }}>
                      No suppliers found
                    </td>
                  </tr>
                ) : (
                  suppliers.map((supplier, index) => (
                    <tr key={supplier.id}>
                      <td>{index + 1}</td>
                      <td>{supplier.farmer_name}</td>
                      <td>{supplier.farmer_contact}</td>
                      <td>{supplier.quantity}</td>
                      <td>Rs. {Number(supplier.price_per_unit).toFixed(2)}</td>
                      <td>
                        {new Date(supplier.supply_date).toLocaleDateString()}
                      </td>
                      <td>
                        Rs.{" "}
                        {(supplier.quantity * supplier.price_per_unit).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="inventory-status">
              <h3>Inventory Status</h3>
              <p>
                <strong>Current Stock:</strong> {product.current_stock}{" "}
                {product.unit}
              </p>
              <p>
                <strong>Daily Stock Limit:</strong>{" "}
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                  onBlur={handleDailyLimitUpdate}
                  min="0"
                  step="0.01"
                />{" "}
                {product.unit}
              </p>
              <p>
                <strong>Average Unit Price:</strong> Rs.{" "}
                {Number(product.average_price).toFixed(2)}
              </p>
              <p className="final-price">
                <strong>Final Unit Price:</strong> Rs.{" "}
                {Number(product.final_price).toFixed(2)}
              </p>
              <p>
                <strong>Total Suppliers:</strong> {suppliers.length}
              </p>
              <button className="add-btn" onClick={() => setShowModal(true)}>
                + Add Supplier
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-supplier-title" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="add-supplier-title">Add Supplier</h3>
              <button type="button" className="close-btn" aria-label="Close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form className="product-form" onSubmit={handleSubmit}>
              <div className="form-title">Add Products</div>
              <div className="form-grid">
                <div className="form-col">
                  <label className="input-label">Farmer</label>
                  <input
                    className="input-lg"
                    type="text"
                    placeholder="Search farmer by name"
                    value={farmerQuery}
                    onChange={(e) => setFarmerQuery(e.target.value)}
                    autoComplete="off"
                  />
                  <div className="farmer-suggestions">
                    {filteredFarmers.map((f) => (
                      <button
                        type="button"
                        key={f.id}
                        className={`farmer-option ${selectedFarmerId === f.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedFarmerId(f.id); setFarmerQuery(String(f.name)); }}
                      >
                        <span className="farmer-name">{f.name}</span>
                        {f.contact_number ? <span className="farmer-contact">{f.contact_number}</span> : null}
                      </button>
                    ))}
                    {filteredFarmers.length === 0 && <div className="no-results">No farmers match</div>}
                  </div>
                  <input type="hidden" name="farmer_id" value={selectedFarmerId ?? ''} required />

                  <label className="input-label">Quantity ({product.unit})</label>
                  <input
                    className="input-lg"
                    type="number"
                    name="quantity"
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>

                <div className="form-col">
                  <label className="input-label">Product ID</label>
                  <input className="input-lg" type="text" value={String(product.id)} readOnly />

                  <label className="input-label">Produce Date</label>
                  <input
                    className="input-lg"
                    type="date"
                    name="supply_date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />

                  <label className="input-label">Unit Price</label>
                  <input
                    className="input-lg"
                    type="number"
                    name="price_per_unit"
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>

              <label className="input-label">Notes (Optional)</label>
              <textarea className="input-lg" name="notes" rows={3} maxLength={500} />

              <div className="form-actions centered">
                <button className="submit-btn" type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

<style jsx>{`
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-content { position: relative; background: #fff; padding: 20px; border-radius: 12px; width: 100%; max-width: 520px; box-shadow: 0 10px 30px rgba(0,0,0,.2); animation: modalIn .12s ease-out; }
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.modal-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #111827; }
.close-btn { border: none; background: transparent; font-size: 22px; line-height: 1; cursor: pointer; color: #6b7280; padding: 4px 8px; border-radius: 6px; }
.close-btn:hover { background: #f3f4f6; color: #111827; }
.farmer-suggestions { margin-top: 8px; max-height: 180px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; }
.farmer-option { width: 100%; display: flex; justify-content: space-between; padding: 8px 10px; border: none; background: #fff; cursor: pointer; }
.farmer-option:hover { background: #f9fafb; }
.farmer-option.selected { background: #ecfdf5; }
.farmer-name { font-weight: 600; color: #111827; }
.farmer-contact { color: #6b7280; font-size: 12px; margin-left: 8px; }
.no-results { padding: 8px 10px; color: #6b7280; font-size: 14px; }
@keyframes modalIn { from { transform: translateY(4px); opacity: .96; } to { transform: translateY(0); opacity: 1; } }

/* Form layout/styles to mimic example */
.form-title { text-align: center; font-weight: 700; font-size: 18px; margin-bottom: 12px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-col { display: flex; flex-direction: column; gap: 10px; }
.input-label { font-size: 12px; font-weight: 700; color: #374151; }
.input-lg, .product-form textarea { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; }
.product-form textarea { resize: vertical; }
.form-actions.centered { display: flex; justify-content: center; margin-top: 16px; }
.submit-btn { background: #22c55e; color: white; border: none; padding: 10px 20px; border-radius: 9999px; font-weight: 700; cursor: pointer; }
.submit-btn:hover { background: #16a34a; }
@media (max-width: 560px) { .form-grid { grid-template-columns: 1fr; } }
`}</style>
