"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar";
import Navbar from "../../../components/navbar";

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

interface ItemPageProps {
  params: { id: string };
}

const API_BASE_URL = "http://localhost:5000/api";

export default function ItemPage({ params }: ItemPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [dailyLimit, setDailyLimit] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        
        // Fetch product details with suppliers
        const response = await fetch(`${API_BASE_URL}/products/${params.id}/suppliers`);
        if (!response.ok) {
          throw new Error('Failed to fetch product data');
        }
        
        const data = await response.json();
        if (data.success) {
          setProduct(data.data);
          setSuppliers(data.data.suppliers || []);
          setDailyLimit(data.data.daily_limit || 0);
        } else {
          setError(data.message || 'Failed to fetch product data');
        }
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Failed to fetch product data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProductData();
    }
  }, [params.id]);

  const handleDailyLimitUpdate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${params.id}/daily-limit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ daily_limit: dailyLimit }),
      });

      const data = await response.json();
      if (data.success) {
        setProduct(prev => prev ? { ...prev, daily_limit: dailyLimit } : null);
        alert('Daily limit updated successfully');
      } else {
        alert('Failed to update daily limit');
      }
    } catch (err) {
      console.error('Error updating daily limit:', err);
      alert('Error updating daily limit');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newSupplier = {
      farmer_id: Number(formData.get("farmer_id")),
      product_id: Number(params.id),
      quantity: Number(formData.get("quantity")),
      price_per_unit: Number(formData.get("price_per_unit")),
      supply_date: formData.get("supply_date") as string,
      notes: formData.get("notes") as string,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSupplier),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the product data to get updated suppliers and prices
        const updatedResponse = await fetch(`${API_BASE_URL}/products/${params.id}/suppliers`);
        const updatedData = await updatedResponse.json();
        
        if (updatedData.success) {
          setProduct(updatedData.data);
          setSuppliers(updatedData.data.suppliers || []);
        }
        
        setShowModal(false);
        alert('Supplier added successfully');
      } else {
        alert(data.message || 'Failed to add supplier');
      }
    } catch (err) {
      console.error('Error adding supplier:', err);
      alert('Error adding supplier');
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
            <div className="error">Error: {error || 'Product not found'}</div>
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
          <h2>P#{product.id} - {product.product_name}</h2>

          {/* Wrap table + status in a row */}
          <div className="product-row">
            {/* Suppliers Table */}
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
                    <td colSpan={7} style={{ textAlign: 'center', color: '#666' }}>
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
                      <td>Rs. {supplier.price_per_unit.toFixed(2)}</td>
                      <td>{new Date(supplier.supply_date).toLocaleDateString()}</td>
                      <td>Rs. {(supplier.quantity * supplier.price_per_unit).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Right side status */}
            <div className="inventory-status">
              <h3>Inventory Status</h3>
              
              <p>
                <strong>Current Stock:</strong> {product.current_stock} {product.unit}
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
                <strong>Average Unit Price:</strong> Rs. {product.average_price.toFixed(2)}
              </p>
              
              <p className="final-price">
                <strong>Final Unit Price:</strong> Rs. {product.final_price.toFixed(2)}
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

      {/* Popup Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Supplier</h3>
            <form className="product-form" onSubmit={handleSubmit}>
              <label>Farmer ID</label>
              <input 
                type="number" 
                name="farmer_id" 
                placeholder="Enter Farmer ID" 
                required 
                min="1"
              />

              <label>Quantity ({product.unit})</label>
              <input 
                type="number" 
                name="quantity" 
                placeholder="Enter Quantity" 
                required 
                min="0.01"
                step="0.01"
              />

              <label>Price per {product.unit} (Rs.)</label>
              <input 
                type="number" 
                name="price_per_unit" 
                placeholder="Enter Price per Unit" 
                required 
                min="0.01"
                step="0.01"
              />

              <label>Supply Date</label>
              <input 
                type="date" 
                name="supply_date" 
                defaultValue={new Date().toISOString().split('T')[0]}
              />

              <label>Notes (Optional)</label>
              <textarea 
                name="notes" 
                placeholder="Enter any additional notes"
                rows={3}
                maxLength={500}
              />

              <div className="form-actions">
                <button type="submit">Add Supplier</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .loading, .error {
          padding: 20px;
          text-align: center;
          font-size: 18px;
        }
        
        .error {
          color: #dc2626;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          width: 400px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .product-form {
          display: flex;
          flex-direction: column;
        }
        
        .product-form label {
          margin-top: 10px;
          font-weight: bold;
        }
        
        .product-form input,
        .product-form textarea {
          padding: 8px;
          margin-top: 5px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-family: inherit;
        }
        
        .product-form textarea {
          resize: vertical;
        }
        
        .form-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
          gap: 10px;
        }
        
        .form-actions button {
          padding: 8px 14px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          flex: 1;
        }
        
        .form-actions button:first-child {
          background: #15803d;
          color: white;
        }
        
        .form-actions button:first-child:hover {
          background: #166534;
        }
        
        .form-actions button:last-child {
          background: #6b7280;
          color: white;
        }
        
        .form-actions button:last-child:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
}