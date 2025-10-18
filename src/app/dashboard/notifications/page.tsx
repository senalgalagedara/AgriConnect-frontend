"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/sidebar";
import Navbar from "../../../components/navbar";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  product_id: number | null;
  order_id: number | null;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  product_name?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = filter === "unread" ? "/notifications/unread" : "/notifications";
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { cache: "no-store" });
      
      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      if (data.success) {
        setNotifications(data.data || []);
      } else {
        setError(data.message || "Failed to fetch notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: "PATCH",
      });

      const data = await response.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PATCH",
      });

      const data = await response.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      setDeletingIds((prev) => [...prev, id]);
      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    } finally {
      setDeletingIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const triggerCheck = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/notifications/check`, {
        method: "POST",
      });

      const data = await response.json();
      if (data.success) {
        alert("Notification check completed!");
        fetchNotifications();
      }
    } catch (err) {
      console.error("Error triggering check:", err);
      alert("Failed to trigger notification check");
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "low_stock":
        return "📉";
      case "expired":
        return "⏰";
      case "new_product":
        return "🆕";
      case "supplier_added":
        return "📦";
      case "stock_updated":
        return "📊";
      case "order_placed":
        return "🛒";
      case "order_cancelled":
        return "❌";
      case "driver_assigned":
        return "🚗";
      case "milestone_earnings":
      case "milestone_orders":
        return "🏆";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "low_stock":
        return "#f59e0b"; // amber
      case "expired":
        return "#ef4444"; // red
      case "new_product":
        return "#3b82f6"; // blue
      case "supplier_added":
        return "#10b981"; // green
      case "stock_updated":
        return "#6366f1"; // indigo
      case "order_placed":
        return "#22c55e"; // green
      case "order_cancelled":
        return "#dc2626"; // red
      case "driver_assigned":
        return "#8b5cf6"; // purple
      case "milestone_earnings":
      case "milestone_orders":
        return "#f59e0b"; // amber
      default:
        return "#6b7280"; // gray
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading && notifications.length === 0) {
    return (
      <div className="dashboard">
        <Sidebar />
        <div className="main">
          <Navbar />
          <div className="content">
            <div className="loading">Loading notifications...</div>
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
          <div className="notifications-header">
            <div>
              <h1>Notifications</h1>
              <p className="subtitle">Stay updated with your inventory alerts</p>
            </div>
            <div className="header-actions">
              <button onClick={triggerCheck} className="btn-check" disabled={loading}>
                {loading ? "Checking..." : "Check Now"}
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="btn-mark-all">
                  Mark All as Read ({unreadCount})
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
              <button onClick={fetchNotifications} className="retry-btn">
                Retry
              </button>
            </div>
          )}

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>
            <button
              className={`filter-tab ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="no-notifications">
              <div className="icon">🔔</div>
              <p>No notifications found</p>
              <button onClick={triggerCheck} className="btn-check-empty">
                Check for Notifications
              </button>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-card ${!notification.is_read ? "unread" : ""}`}
                  style={{ borderLeftColor: getNotificationColor(notification.type) }}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-meta">
                      <span className="notification-type">{notification.type.replace(/_/g, " ")}</span>
                      <span className="notification-date">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="notification-actions">
                    {!notification.is_read && (
                      <button
                        className="btn-icon"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    {notification.product_id && (
                      <button
                        className="btn-icon"
                        onClick={() => router.push(`/dashboard/inventory/1/${notification.product_id}`)}
                        title="View product"
                      >
                        👁️
                      </button>
                    )}
                    <button
                      className="btn-icon delete"
                      onClick={() => deleteNotification(notification.id)}
                      disabled={deletingIds.includes(notification.id)}
                      title="Delete"
                    >
                      {deletingIds.includes(notification.id) ? "⏳" : "🗑️"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .loading {
          padding: 40px;
          text-align: center;
          font-size: 18px;
          color: #666;
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .notifications-header h1 {
          margin: 0 0 4px 0;
          font-size: 28px;
          font-weight: 700;
          color: #111827;
        }

        .subtitle {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-check,
        .btn-mark-all,
        .btn-check-empty {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
        }

        .btn-check {
          background: #3b82f6;
          color: white;
        }

        .btn-check:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .btn-check:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-mark-all {
          background: #10b981;
          color: white;
        }

        .btn-mark-all:hover {
          background: #059669;
          transform: translateY(-1px);
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

        .filter-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0;
        }

        .filter-tab {
          padding: 12px 24px;
          border: none;
          background: transparent;
          color: #6b7280;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s ease;
        }

        .filter-tab:hover {
          color: #111827;
          background: #f9fafb;
        }

        .filter-tab.active {
          color: #22c55e;
          border-bottom-color: #22c55e;
        }

        .no-notifications {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .no-notifications .icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .no-notifications p {
          font-size: 18px;
          margin-bottom: 20px;
        }

        .btn-check-empty {
          background: #22c55e;
          color: white;
        }

        .btn-check-empty:hover {
          background: #16a34a;
          transform: translateY(-1px);
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notification-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          border-left: 4px solid #6b7280;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .notification-card.unread {
          background: #f0fdf4;
          box-shadow: 0 2px 4px rgba(34, 197, 94, 0.1);
        }

        .notification-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .notification-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-message {
          font-size: 15px;
          color: #111827;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .notification-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 12px;
          color: #6b7280;
        }

        .notification-type {
          text-transform: capitalize;
          font-weight: 600;
          padding: 2px 8px;
          background: #f3f4f6;
          border-radius: 4px;
        }

        .notification-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .btn-icon {
          background: transparent;
          border: 1px solid #e5e7eb;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 16px;
        }

        .btn-icon:hover:not(:disabled) {
          background: #f3f4f6;
          transform: scale(1.1);
        }

        .btn-icon.delete:hover:not(:disabled) {
          background: #fee2e2;
          border-color: #fecaca;
        }

        .btn-icon:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .notifications-header {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            justify-content: stretch;
          }

          .btn-check,
          .btn-mark-all {
            flex: 1;
          }

          .notification-card {
            flex-direction: column;
            gap: 12px;
          }

          .notification-actions {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
