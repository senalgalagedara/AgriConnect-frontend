'use client';

import React, { useEffect, useState } from 'react';

interface Notification {
  id: number;
  product_id: number | null;
  order_id?: number | null;
  notification_type: 
    | 'expired' 
    | 'low_stock' 
    | 'new_product' 
    | 'supplier_added' 
    | 'stock_updated'
    | 'order_placed'
    | 'order_cancelled'
    | 'driver_assigned'
    | 'milestone_earnings'
    | 'milestone_orders'
    | 'payment_deleted';
  message: string;
  is_read: boolean;
  created_at: string;
  product_name?: string;
  province_name?: string;
  current_stock?: number;
  supplier_name?: string;
  farmer_name?: string;
  order_no?: number;
  order_total?: number;
  driver_name?: string;
  driver_phone?: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const API_BASE_URL = 'http://localhost:5000/api';

export default function NotificationModal({ isOpen, onClose, onRefresh }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);

    // Mark as read
    try {
      await fetch(`${API_BASE_URL}/notifications/${notification.id}/read`, {
        method: 'PATCH',
      });
      
      // Refresh notifications
      fetchNotifications();
      onRefresh();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
      });
      
      fetchNotifications();
      onRefresh();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
      });
      
      fetchNotifications();
      onRefresh();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const closeDetailModal = () => {
    setSelectedNotification(null);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'expired':
        return '⚠️';
      case 'low_stock':
        return '📦';
      case 'new_product':
        return '✨';
      case 'supplier_added':
        return '🚚';
      case 'stock_updated':
        return '🔄';
      case 'order_placed':
        return '🛒';
      case 'order_cancelled':
      case 'payment_deleted':
        return '❌';
      case 'driver_assigned':
        return '🚗';
      case 'milestone_earnings':
        return '💰';
      case 'milestone_orders':
        return '🎯';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'expired':
        return '#dc2626';
      case 'low_stock':
        return '#f59e0b';
      case 'new_product':
        return '#10b981';
      case 'supplier_added':
        return '#3b82f6';
      case 'stock_updated':
        return '#8b5cf6';
      case 'order_placed':
        return '#10b981';
      case 'order_cancelled':
      case 'payment_deleted':
        return '#dc2626';
      case 'driver_assigned':
        return '#0891b2';
      case 'milestone_earnings':
        return '#eab308';
      case 'milestone_orders':
        return '#06b6d4';
      default:
        return '#6b7280';
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'expired':
        return 'Product Expired';
      case 'low_stock':
        return 'Low Stock Alert';
      case 'new_product':
        return 'New Product Added';
      case 'supplier_added':
        return 'Stock Supplied';
      case 'stock_updated':
        return 'Stock Updated';
      case 'order_placed':
        return 'Order Placed';
      case 'order_cancelled':
        return 'Order Cancelled';
      case 'payment_deleted':
        return 'Payment Deleted';
      case 'driver_assigned':
        return 'Driver Assigned';
      case 'milestone_earnings':
        return 'Earnings Milestone!';
      case 'milestone_orders':
        return 'Orders Milestone!';
      default:
        return 'Notification';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Notification List Modal */}
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Notifications</h2>
            <div className="modal-header-actions">
              {notifications.length > 0 && (
                <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
                  Mark all as read
                </button>
              )}
              <button className="close-btn" onClick={onClose}>×</button>
            </div>
          </div>

          <div className="modal-body">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">✓</span>
                <h3>All caught up!</h3>
                <p>You have no new notifications</p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="notification-card"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div 
                      className="notification-icon" 
                      style={{ color: getNotificationColor(notification.notification_type) }}
                    >
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">
                        {getNotificationTitle(notification.notification_type)}
                      </div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">
                        {new Date(notification.created_at).toLocaleString()}
                      </div>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="detail-modal-overlay" onClick={closeDetailModal}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-header">
              <div 
                className="detail-icon" 
                style={{ color: getNotificationColor(selectedNotification.notification_type) }}
              >
                {getNotificationIcon(selectedNotification.notification_type)}
              </div>
              <h2>{getNotificationTitle(selectedNotification.notification_type)}</h2>
              <button className="close-btn" onClick={closeDetailModal}>×</button>
            </div>

            <div className="detail-body">
              {/* Product-related notifications */}
              {selectedNotification.product_id && selectedNotification.product_name && (
                <>
                  <div className="info-row">
                    <span className="info-label">Product:</span>
                    <span className="info-value">{selectedNotification.product_name}</span>
                  </div>
                  
                  {selectedNotification.province_name && (
                    <div className="info-row">
                      <span className="info-label">Province:</span>
                      <span className="info-value">{selectedNotification.province_name}</span>
                    </div>
                  )}

                  {selectedNotification.notification_type === 'low_stock' && 
                   selectedNotification.current_stock !== undefined && (
                    <div className="info-row">
                      <span className="info-label">Current Stock:</span>
                      <span className="info-value">{selectedNotification.current_stock}</span>
                    </div>
                  )}
                </>
              )}

              {/* Order-related notifications */}
              {selectedNotification.order_id && (
                <>
                  <div className="info-row">
                    <span className="info-label">Order #:</span>
                    <span className="info-value">
                      {selectedNotification.order_no || selectedNotification.order_id}
                    </span>
                  </div>
                  
                  {selectedNotification.order_total !== undefined && (
                    <div className="info-row">
                      <span className="info-label">Total:</span>
                      <span className="info-value">Rs. {selectedNotification.order_total.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}

              {/* Driver assignment notifications */}
              {selectedNotification.notification_type === 'driver_assigned' && (
                <>
                  {selectedNotification.driver_name && (
                    <div className="info-row">
                      <span className="info-label">Driver:</span>
                      <span className="info-value">{selectedNotification.driver_name}</span>
                    </div>
                  )}
                  {selectedNotification.driver_phone && (
                    <div className="info-row">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{selectedNotification.driver_phone}</span>
                    </div>
                  )}
                </>
              )}

              <div className="message-box">
                <p>{selectedNotification.message}</p>
              </div>

              <div className="info-row">
                <span className="info-label">Time:</span>
                <span className="info-value">
                  {new Date(selectedNotification.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="detail-footer">
              <button className="btn-secondary" onClick={closeDetailModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-container {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          color: #111827;
        }

        .modal-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mark-all-btn {
          background: #f0fdf4;
          color: #15803d;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mark-all-btn:hover {
          background: #dcfce7;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 32px;
          color: #9ca3af;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: #dc2626;
        }

        .modal-body {
          overflow-y: auto;
          flex: 1;
          padding: 16px;
        }

        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f4f6;
          border-top-color: #15803d;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          display: block;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }

        .empty-state p {
          margin: 0;
          color: #6b7280;
        }

        .notification-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notification-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .notification-card:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .notification-icon {
          font-size: 28px;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-weight: 600;
          color: #111827;
          font-size: 15px;
          margin-bottom: 4px;
        }

        .notification-message {
          color: #4b5563;
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 6px;
        }

        .notification-time {
          color: #9ca3af;
          font-size: 12px;
        }

        .delete-btn {
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.2s;
          opacity: 0;
          flex-shrink: 0;
        }

        .notification-card:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        /* Detail Modal Styles */
        .detail-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        .detail-modal {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.3s ease-out;
        }

        .detail-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          position: relative;
        }

        .detail-icon {
          font-size: 32px;
        }

        .detail-header h2 {
          flex: 1;
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }

        .detail-body {
          padding: 24px;
        }

        .info-row {
          display: flex;
          margin-bottom: 16px;
          gap: 12px;
        }

        .info-label {
          font-weight: 600;
          color: #374151;
          min-width: 120px;
        }

        .info-value {
          color: #6b7280;
          flex: 1;
        }

        .message-box {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #15803d;
        }

        .message-box p {
          margin: 0;
          color: #374151;
          line-height: 1.6;
        }

        .detail-footer {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          justify-content: flex-end;
        }

        .btn-secondary {
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 14px;
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        @media (max-width: 640px) {
          .modal-container,
          .detail-modal {
            max-width: 100%;
            max-height: 95vh;
            margin: 0;
          }

          .modal-header h2 {
            font-size: 20px;
          }

          .notification-card {
            padding: 12px;
          }
        }
      `}</style>
    </>
  );
}
