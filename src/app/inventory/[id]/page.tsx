"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar";
import Navbar from "../../../components/navbar";

interface Product {
  id: number;
  product_name: string;
  qty: number;
  farmer_price: number;
  farmer_id: number;
}

interface ItemPageProps {
  params: { id: string };
}

export default function ItemPage({ params }: ItemPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`http://localhost:5000/products/${params.id}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, [params.id]);

  const avgPrice =
    products.length > 0
      ? products.reduce((acc, p) => acc + p.farmer_price, 0) / products.length
      : 0;

  const finalPrice = avgPrice + avgPrice * 0.02;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newProduct = {
      product_name: formData.get("product_name"),
      in_location: formData.get("in_location"),
      d_limit: Number(formData.get("d_limit")),
      qty: Number(formData.get("qty")),
      category: formData.get("category"),
      final_price: Number(formData.get("final_price")),
      farmer_price: Number(formData.get("farmer_price")),
      farmer_id: Number(formData.get("farmer_id")),
    };

    try {
      const res = await fetch("http://localhost:5000/products/1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (!res.ok) throw new Error("Failed to add product");
      const addedProduct = await res.json();

      setProducts((prev) => [...prev, addedProduct]);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Error adding product");
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main">
        <Navbar />
        <div className="content product-page">
          <h2>P#{params.id} - Eggplant</h2>

          {/* Wrap table + status in a row */}
          <div className="product-row">
            {/* Products Table */}
            <table className="farmer-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Product Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, index) => (
                  <tr key={p.id}>
                    <td>{index + 1}</td>
                    <td>{p.product_name}</td>
                    <td>{p.qty} Units</td>
                    <td>Rs. {p.farmer_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Right side status */}
            <div className="inventory-status">
              <h3>Inventory Status</h3>
              <p>
                <strong>Daily Stock Limit:</strong>{" "}
                <input
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(Number(e.target.value))}
                />{" "}
                KG
              </p>
              <p>
                <strong>Average Unit Price:</strong> Rs. {avgPrice.toFixed(2)}
              </p>
              <p className="final-price">
                <strong>Final Unit Price:</strong> Rs. {finalPrice.toFixed(2)}
              </p>
              <button className="add-btn" onClick={() => setShowModal(true)}>
                + Add materials
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Products</h3>
            <form className="product-form" onSubmit={handleSubmit}>
              <label>Farmer ID</label>
              <input type="number" name="farmer_id" placeholder="Enter Farmer ID" required />

              <label>Product Name</label>
              <input type="text" name="product_name" placeholder="Product Name" required />

              <label>Location</label>
              <input type="text" name="in_location" placeholder="Enter Location" />

              <label>Daily Limit</label>
              <input type="number" name="d_limit" placeholder="Daily Limit" defaultValue={dailyLimit} />

              <label>Quantity</label>
              <input type="number" name="qty" placeholder="Enter Quantity" required />

              <label>Category</label>
              <input type="text" name="category" placeholder="Enter Category" />

              <label>Final Price</label>
              <input type="number" name="final_price" placeholder="Final Price" />

              <label>Unit Price</label>
              <input type="number" name="farmer_price" placeholder="Enter Unit Price" required />

              <div className="form-actions">
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
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
        }
        .product-form {
          display: flex;
          flex-direction: column;
        }
        .product-form label {
          margin-top: 10px;
          font-weight: bold;
        }
        .product-form input {
          padding: 8px;
          margin-top: 5px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .form-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
        }
        .form-actions button {
          padding: 8px 14px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .form-actions button:first-child {
          background: green;
          color: white;
        }
        .form-actions button:last-child {
          background: gray;
          color: white;
        }
      `}</style>
    </div>
  );
}
