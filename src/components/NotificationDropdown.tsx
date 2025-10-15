'use client';

import React, { useEffect, useState, useRef } from 'react';

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
    | 'milestone_orders';
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

interface NotificationDropdownProps {
  className?: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

export default function NotificationDropdown({ className = '' }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fetch notifications and count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();

    // Check for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/count`);
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setShowModal(true);

    // Mark as read
    try {
      await fetch(`${API_BASE_URL}/notifications/${notification.id}/read`, {
        method: 'PATCH',
      });
      
      // Refresh notifications and count
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
      });
      
      fetchUnreadCount();
      fetchNotifications();
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
      
      fetchUnreadCount();
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNotification(null);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
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
        return '#dc2626'; // red
      case 'low_stock':
        return '#f59e0b'; // amber
      case 'new_product':
        return '#10b981'; // green
      case 'supplier_added':
        return '#3b82f6'; // blue
      case 'stock_updated':
        return '#8b5cf6'; // purple
      case 'order_placed':
        return '#10b981'; // green
      case 'order_cancelled':
        return '#dc2626'; // red
      case 'driver_assigned':
        return '#0891b2'; // cyan-600
      case 'milestone_earnings':
        return '#eab308'; // yellow
      case 'milestone_orders':
        return '#06b6d4'; // cyan
      default:
        return '#6b7280'; // gray
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

  return (
    <>
      <div className={`notification-dropdown ${className}`} ref={dropdownRef}>
        <button className="notification-bell" onClick={toggleDropdown}>
          <span className="bell-icon">🔔</span>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>

        {isOpen && (
          <div className="notification-panel">
            <div className="notification-header">
              <h3>Notifications</h3>
              {notifications.length > 0 && (
                <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                  Mark all as read
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <span className="no-notif-icon">✓</span>
                  <p>No new notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="notification-item"
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon" style={{ color: getNotificationColor(notification.notification_type) }}>
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
                      className="delete-notification"
                      onClick={(e) => handleDeleteNotification(notification.id, e)}
                      title="Delete notification"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notification Modal */}
      {showModal && selectedNotification && (
        <div className="notification-modal-overlay" onClick={closeModal}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon" style={{ color: getNotificationColor(selectedNotification.notification_type) }}>
                {getNotificationIcon(selectedNotification.notification_type)}
              </div>
              <h2>
                {getNotificationTitle(selectedNotification.notification_type)}
              </h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-body">
              {/* Product-related notifications */}
              {selectedNotification.product_id && selectedNotification.product_name && (
                <>
                  <div className="modal-info-row">
                    <span className="info-label">Product:</span>
                    <span className="info-value">{selectedNotification.product_name}</span>
                  </div>
                  
                  {selectedNotification.province_name && (
                    <div className="modal-info-row">
                      <span className="info-label">Province:</span>
                      <span className="info-value">{selectedNotification.province_name}</span>
                    </div>
                  )}

                  {selectedNotification.notification_type === 'low_stock' && selectedNotification.current_stock !== undefined && (
                    <div className="modal-info-row">
                      <span className="info-label">Current Stock:</span>
                      <span className="info-value">{selectedNotification.current_stock}</span>
                    </div>
                  )}
                </>
              )}

              {/* Order-related notifications */}
              {selectedNotification.order_id && (
                <>
                  <div className="modal-info-row">
                    <span className="info-label">Order #:</span>
                    <span className="info-value">{selectedNotification.order_no || selectedNotification.order_id}</span>
                  </div>
                  
                  {selectedNotification.order_total !== undefined && (
                    <div className="modal-info-row">
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
                    <div className="modal-info-row">
                      <span className="info-label">Driver:</span>
                      <span className="info-value">{selectedNotification.driver_name}</span>
                    </div>
                  )}
                  {selectedNotification.driver_phone && (
                    <div className="modal-info-row">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{selectedNotification.driver_phone}</span>
                    </div>
                  )}
                </>
              )}

              <div className="modal-message">
                <p>{selectedNotification.message}</p>
              </div>

              <div className="modal-info-row">
                <span className="info-label">Time:</span>
                <span className="info-value">{new Date(selectedNotification.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={closeModal}>Close</button>
              {/* Show View Product button only for product notifications */}
              {selectedNotification.product_id && selectedNotification.province_name && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    window.location.href = `/dashboard/inventory/${selectedNotification.province_name!.toLowerCase()}/${selectedNotification.product_id}`;
                  }}
                >
                  View Product
                </button>
              )}
              {/* Show View Order button only for order notifications */}
              {selectedNotification.order_id && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    window.location.href = `/dashboard/orders/${selectedNotification.order_id}`;
                  }}
                >
                  View Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .notification-dropdown {
          position: relative;
        }

        .notification-bell {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 24px;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }

        .notification-bell:hover {
          transform: scale(1.1);
        }

        .bell-icon {
          display: block;
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #dc2626;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: bold;
          min-width: 18px;
          text-align: center;
        }

        .notification-panel {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 8px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          width: 380px;
          max-height: 500px;
          display: flex;
          flex-direction: column;
          z-index: 1000;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .notification-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .mark-all-read {
          background: none;
          border: none;
          color: #15803d;
          font-size: 13px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .mark-all-read:hover {
          background: #f0fdf4;
        }

        .notification-list {
          overflow-y: auto;
          max-height: 420px;
        }

        .no-notifications {
          padding: 60px 20px;
          text-align: center;
          color: #6b7280;
        }

        .no-notif-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 12px;
        }

        .notification-item {
          display: flex;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
        }

        .notification-item:hover {
          background: #f9fafb;
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-icon {
          font-size: 24px;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
          min-width: 0;
        }

        .notification-title {
          font-weight: 600;
          color: #111827;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .notification-message {
          color: #6b7280;
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .notification-time {
          color: #9ca3af;
          font-size: 12px;
        }

        .delete-notification {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 24px;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
          opacity: 0;
          transition: opacity 0.2s, color 0.2s;
        }

        .notification-item:hover .delete-notification {
          opacity: 1;
        }

        .delete-notification:hover {
          color: #dc2626;
        }

        /* Modal Styles */
        .notification-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }

        .notification-modal {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          position: relative;
        }

        .modal-icon {
          font-size: 32px;
        }

        .modal-header h2 {
          flex: 1;
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }

        .modal-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: none;
          border: none;
          font-size: 28px;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
          transition: color 0.2s;
        }

        .modal-close:hover {
          color: #dc2626;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-info-row {
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

        .modal-message {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
        }

        .modal-message p {
          margin: 0;
          color: #374151;
          line-height: 1.6;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e5e7eb;
          justify-content: flex-end;
        }

        .btn-primary,
        .btn-secondary {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 14px;
        }

        .btn-primary {
          background: #15803d;
          color: white;
        }

        .btn-primary:hover {
          background: #166534;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        @media (max-width: 480px) {
          .notification-panel {
            width: calc(100vw - 40px);
            right: -10px;
          }

          .notification-modal {
            margin: 20px;
          }
        }
      `}</style>
    </>
  );
}
