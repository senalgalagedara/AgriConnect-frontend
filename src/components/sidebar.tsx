import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">AgriConnect</h2>
      <nav>
        <Link href="/dashboard" className="nav-link">
          Dashboard
        </Link>
        <Link href="/dashboard/users" className="nav-link">
          User Management
        </Link>
        <Link href="/dashboard/inventory" className="nav-link">
          Inventory Management
        </Link>
        <Link href="/dashboard/orderdelivery" className="nav-link">
          Order Delivery
        </Link>
        <Link href="/dashboard/payment" className="nav-link">
          Payment Management
        </Link>
        <Link href="/dashboard/feedback" className="nav-link">
          Customer Feedback
        </Link>
      </nav>

      <style jsx>{`
        .sidebar {
          width: 240px;
          height: 100vh;
          color: white;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .logo {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 30px;
          text-align: center;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .nav-link {
          padding: 10px 15px;
          border-radius: 8px;
          background: transparent;
          color: white;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-link:hover {
          background: #374151;
        }
      `}</style>
    </div>
  );
}
