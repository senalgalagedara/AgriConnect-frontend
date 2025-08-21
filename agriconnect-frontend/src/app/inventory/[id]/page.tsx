"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar";
import Navbar from "../../../components/navbar";

interface Farmer {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface ItemPageProps {
  params: { id: string };
}

export default function ItemPage({ params }: ItemPageProps) {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Mock API (replace with backend later)
    setFarmers([
      { id: 1, name: "Senal Galagedara", quantity: 150, unitPrice: 120 },
      { id: 2, name: "Mirishabyapa", quantity: 150, unitPrice: 100 },
      { id: 3, name: "Yasith Navodya", quantity: 150, unitPrice: 110 },
    ]);
  }, [params.id]);

  const avgPrice =
    farmers.length > 0
      ? farmers.reduce((acc, f) => acc + f.unitPrice, 0) / farmers.length
      : 0;

  const finalPrice = avgPrice + avgPrice * 0.02;

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="main">
        <Navbar />
        <div className="content product-page">
          <h2>P#{params.id} - Eggplant</h2>

          {/* Wrap table + status in a row */}
          <div className="product-row">
            {/* Farmers Table */}
            <table className="farmer-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Farmer Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                </tr>
              </thead>
              <tbody>
                {farmers.map((farmer, index) => (
                  <tr key={farmer.id}>
                    <td>{index + 1}</td>
                    <td>{farmer.name}</td>
                    <td>{farmer.quantity} Units</td>
                    <td>Rs. {farmer.unitPrice}</td>
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
            <form className="product-form">
              <label>Farmer NIC</label>
              <input type="text" placeholder="Enter NIC" />

              <label>Product ID</label>
              <input type="text" placeholder="Product ID" defaultValue={`P${params.id}`} />

              <label>Quantity</label>
              <input type="number" placeholder="Enter Quantity" />

              <label>Produce Date</label>
              <input type="date" />

              <label>Unit Price</label>
              <input type="number" placeholder="Enter Unit Price" />

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
