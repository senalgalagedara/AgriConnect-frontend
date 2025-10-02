'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();

  const initiallyOpen = pathname?.startsWith("/dashboard/orderdelivery") ?? false;
  const [orderOpen, setOrderOpen] = useState(initiallyOpen);

  useEffect(() => {
    if (pathname?.startsWith("/dashboard/orderdelivery")) setOrderOpen(true);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <div className="sidebar">
      <h2 className="logo">AgriConnect</h2>

      <nav>
        <Link href="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>
          Dashboard
        </Link>

        <Link href="/dashboard/users" className={`nav-link ${isActive("/dashboard/users") ? "active" : ""}`}>
          User Management
        </Link>

        <Link href="/dashboard/inventory" className={`nav-link ${isActive("/dashboard/inventory") ? "active" : ""}`}>
          Inventory Management
        </Link>

        <button
          type="button"
          className={`nav-link group-toggle ${pathname?.startsWith("/dashboard/orderdelivery") ? "active" : ""}`}
          onClick={() => setOrderOpen(v => !v)}
          aria-expanded={orderOpen}
          aria-controls="order-subnav"
        >
          <span>Order Delivery</span>
          <span className={`caret ${orderOpen ? "open" : ""}`} aria-hidden>▾</span>
        </button>

        {orderOpen && (
          <div id="order-subnav" className="subnav">
            <Link
              href="/dashboard/orderdelivery/driverlist"
              className={`sub-link ${isActive("/dashboard/orderdelivery/driverlist") ? "active" : ""}`}
            >
              Driver List
            </Link>
            <Link
              href="/dashboard/orderdelivery/orderlist"
              className={`sub-link ${isActive("/dashboard/orderdelivery/orderlist") ? "active" : ""}`}
            >
              Order List
            </Link>
            <Link
              href="/dashboard/orderdelivery/assigneddrivers"
              className={`sub-link ${isActive("/dashboard/orderdelivery/assigneddrivers") ? "active" : ""}`}
            >
              Assign Drivers
            </Link>
          </div>
        )}

        <Link href="/dashboard/payment" className={`nav-link ${isActive("/dashboard/payment") ? "active" : ""}`}>
          Payment Management
        </Link>

        <Link href="/dashboard/feedback" className={`nav-link ${isActive("/dashboard/feedback") ? "active" : ""}`}>
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
          color: black !important;
          gap: 8px;
        }

        .nav-link {
          padding: 10px 15px;
          border-radius: 8px;
          background: transparent;
          color: black !important;
          text-decoration: none;
          font-weight: 500;
          transition: background 0.2s ease, color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .nav-link:hover {
          background: green;
        }

        .nav-link.active {
          background: green;
        }

        .group-toggle {
          cursor: pointer;
          border: none;
          text-align: left;
        }

        .caret {
          transform: rotate(-90deg);
          transition: transform 0.2s ease;
          font-size: 12px;
          line-height: 1;
        }
        .caret.open {
          transform: rotate(0deg);
        }

        .subnav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: black !important;
          margin-left: 10px;
          padding-left: 10px;
          border-left: 2px solid #374151;
        }

        .sub-link {
          padding: 8px 12px;
          border-radius: 6px;
          color: black !important;
          text-decoration: none;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
