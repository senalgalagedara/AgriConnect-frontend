"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const params = useParams<{ id: string; pid: string }>();
  const id = params?.id;
  const pid = params?.pid;
  const router = useRouter();

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

        const productRes = await fetch(`${API_BASE_URL}/products/${id}`, { cache: "no-store" });
        if (!productRes.ok) throw new Error("Failed to fetch product details");
        const productData = await productRes.json();

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
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
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
      notes: (formData.get("notes") as string) || undefined,
    };

    try {
      if (editingSupplier) {
        const res = await fetch(`${API_BASE_URL}/suppliers/${editingSupplier.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSupplier),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSuppliers((prev) => prev.map((s) => (s.id === editingSupplier.id ? { ...s, ...newSupplier, id: s.id, farmer_name: s.farmer_name } : s)));
          setShowModal(false);
          setEditingSupplier(null);
          alert("Supply updated");
        } else {
          alert(data?.message || "Failed to update supply");
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/suppliers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newSupplier),
        });

        const data = await response.json();
        if (data.success) {
          const updatedResponse = await fetch(`${API_BASE_URL}/suppliers/product/${id}`);
          const updatedData = await updatedResponse.json();
          if (updatedData.success) {
            setSuppliers(Array.isArray(updatedData.data) ? updatedData.data : updatedData.data?.suppliers || []);
          }
          setShowModal(false);
          alert("Supplier added successfully");
        } else {
          alert(data.message || "Failed to add supplier");
        }
      }
    } catch (err) {
      console.error("Error adding supplier:", err);
      alert("Error adding supplier");
    }
  };

  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const openAddModal = () => {
    setEditingSupplier(null);
    setSelectedFarmerId(null);
    setFarmerQuery("");
    setShowModal(true);
  };

  const openEditModal = (s: Supplier) => {
    setEditingSupplier(s);
    setSelectedFarmerId(s.farmer_id);
    setFarmerQuery(s.farmer_name);
    setShowModal(true);
  };

  const handleDeleteSupplier = async (supplierId: number) => {
    const ok = window.confirm("Delete this supply? This action cannot be undone.");
    if (!ok) return;

    try {
      setDeletingIds((s) => [...s, supplierId]);

      const res = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
      } else {
        alert(data?.message || "Failed to delete supply");
      }
    } catch (err) {
      console.error("Error deleting supplier:", err);
      alert("Error deleting supply");
    } finally {
      setDeletingIds((s) => s.filter((id) => id !== supplierId));
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
    <>
      <div className="dashboard">
        <Sidebar />
        <div className="main">
          <Navbar />
          <div className="content product-page">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <button className="back-btn" onClick={() => router.back()} aria-label="Go back">← Back</button>
              <h2 style={{ margin: 0 }}>
                P#{product.id} - {product.product_name}
              </h2>
            </div>

            <div className="product-row">
              <table className="farmer-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Farmer Name</th>
                    <th>Quantity ({product.unit})</th>
                    <th>Unit Price (Rs.)</th>
                    <th>Supply Date</th>
                    <th>Total Value (Rs.)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: "center", color: "#666" }}>
                        No suppliers found
                      </td>
                    </tr>
                  ) : (
                    suppliers.map((supplier, index) => (
                      <tr key={supplier.id}>
                        <td>{index + 1}</td>
                        <td>{supplier.farmer_name}</td>
                        <td>{supplier.quantity}</td>
                        <td>Rs. {Number(supplier.price_per_unit).toFixed(2)}</td>
                        <td>
                          {new Date(supplier.supply_date).toLocaleDateString()}
                        </td>
                        <td>
                          Rs.{" "}
                          {(supplier.quantity * supplier.price_per_unit).toFixed(2)}
                        </td>
                        <td style={{ display: "flex", alignItems: "center" }}>
                          <button className="btn ghost" onClick={() => openEditModal(supplier)} style={{ marginRight: 8 }}>Edit</button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                            disabled={deletingIds.includes(supplier.id)}
                          >
                            {deletingIds.includes(supplier.id) ? "Deleting..." : "Delete"}
                          </button>
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
                <h3 id="add-supplier-title">{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
                <button type="button" className="close-btn" aria-label="Close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form className="product-form" onSubmit={handleSubmit}>
                <div className="form-title">{editingSupplier ? 'Edit Supply' : 'Add Supply'}</div>
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
                      defaultValue={editingSupplier?.quantity ?? ''}
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
                      defaultValue={editingSupplier ? new Date(editingSupplier.supply_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]}
                    />

                    <label className="input-label">Unit Price</label>
                    <input
                      className="input-lg"
                      type="number"
                      name="price_per_unit"
                      required
                      min="0.01"
                      step="0.01"
                      defaultValue={editingSupplier?.price_per_unit ?? ''}
                    />
                  </div>
                </div>

                <label className="input-label">Notes (Optional)</label>
                <textarea className="input-lg" name="notes" rows={3} maxLength={500} defaultValue={editingSupplier?.notes ?? ''} />

                <div className="form-actions centered">
                  <button className="submit-btn" type="submit">{editingSupplier ? 'Save' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      <style jsx>{`
        /* Modal overlay/content - ensure centered */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          overflow-y: auto;
        }

        .modal-content {
          position: relative;
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          animation: modalIn 0.12s ease-out;
          margin: auto;
        }

        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .modal-header h3 { margin: 0; font-size: 18px; font-weight: 700; color: #111827; }
        .close-btn { border: none; background: transparent; font-size: 22px; line-height: 1; cursor: pointer; color: #6b7280; padding: 4px 8px; border-radius: 6px; transition: all 0.2s ease; }
        .close-btn:hover { background: #f3f4f6; color: #111827; }

        .farmer-suggestions { margin-top: 8px; max-height: 180px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
        .farmer-option { width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; border: none; background: #fff; cursor: pointer; text-align: left; transition: background 0.2s ease; }
        .farmer-option:hover { background: #f9fafb; }
        .farmer-option.selected { background: #ecfdf5; }
        .farmer-name { font-weight: 600; color: #111827; }
        .farmer-contact { color: #6b7280; font-size: 12px; margin-left: 8px; }
        .no-results { padding: 8px 10px; color: #6b7280; font-size: 14px; text-align: center; }

        @keyframes modalIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        /* Form layout/styles */
        .form-title { text-align: center; font-weight: 700; font-size: 18px; margin-bottom: 12px; color: #111827; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-col { display: flex; flex-direction: column; gap: 10px; }
        .input-label { font-size: 12px; font-weight: 700; color: #374151; margin-bottom: 4px; }

        .input-lg, .product-form textarea { padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; width: 100%; transition: border-color 0.2s ease; }
        .input-lg:focus, .product-form textarea:focus { outline: none; border-color: #22c55e; box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1); }
        .product-form textarea { resize: vertical; font-family: inherit; }

        .form-actions.centered { display: flex; justify-content: center; gap: 12px; margin-top: 16px; }
        .submit-btn { background: #22c55e; color: white; border: none; padding: 10px 24px; border-radius: 9999px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; font-size: 14px; }
        .submit-btn:hover { background: #16a34a; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3); }
        .submit-btn:active { transform: translateY(0); }

        /* Table action buttons */
        .btn.ghost {
          background: green;
          border: 1px solid #e5e7eb;
          color: white;
          padding: 6px 10px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.08s ease;
        }
        .btn.ghost:hover {
          background: #f3f4f6;
          transform: translateY(-1px);
        }

        .delete-btn {
          background: #ef4444;
          color: #fff;
          border: none;
          padding: 6px 10px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease, opacity 0.08s ease, transform 0.08s ease;
        }
        .delete-btn:hover { background: #dc2626; transform: translateY(-1px); }
        .delete-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Add button (inventory panel) */
        .add-btn {
          background: green;
          color: #fff;
          border: none;
          padding: 8px 12px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
        }
        .add-btn:hover { background: #1d4ed8; transform: translateY(-1px); }

        /* Back button */
        .back-btn {
          background: transparent;
          border: 1px solid #e5e7eb;
          color: #111827;
          padding: 6px 10px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        .back-btn:hover { background: #f3f4f6; transform: translateY(-1px); }

        /* Responsive */
        @media (max-width: 560px) { .form-grid { grid-template-columns: 1fr; } .modal-content { max-height: 95vh; } }
        @media (max-height: 700px) { .modal-overlay { align-items: flex-start; } .modal-content { margin-top: 20px; margin-bottom: 20px; } }
      `}</style>
    </>
  );
}
