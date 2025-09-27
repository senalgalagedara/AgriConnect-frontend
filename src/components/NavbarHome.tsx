'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';

interface NavbarProps {
  cartItemCount?: number;
  showSearch?: boolean;
  onSearch?: (term: string) => void;
}

export default function Navbar({ cartItemCount = 0, showSearch = false, onSearch }: NavbarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    } else {
      // Fallback navigation to products with search param
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: '/home', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link href="/home" className="nav-logo">
          <span className="logo-icon">🥬</span>
          <span className="logo-text">AgriConnect</span>
        </Link>

        {/* Search Bar (if enabled) */}
        {showSearch && (
          <div className="nav-search">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-container">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </form>
          </div>
        )}

        {/* Desktop Navigation */}
        <div className="nav-links-desktop">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          <Link href="/auth/login" className="nav-link auth-link">
            <User size={20} />
            <span className="auth-text">Login</span>
          </Link>
          <Link href="/cart" className="cart-button">
            <ShoppingCart size={20} />
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </Link>
          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            type="button"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            {showSearch && (
              <form onSubmit={handleSearch} className="search-form" style={{ marginBottom: '1rem' }}>
                <div className="search-input-container">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </form>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="mobile-nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mobile-menu-divider" />
            <Link
              href="/auth/login"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              <User size={18} />
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="mobile-nav-link signup"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        .navbar {
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          gap: 2rem;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: #15803d;
          font-weight: bold;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .logo-icon {
          font-size: 2rem;
        }
        .nav-search {
          flex: 1;
          max-width: 400px;
        }
        .search-form {
          width: 100%;
        }
        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 0.75rem;
          color: #6b7280;
          z-index: 1;
        }
        .search-input {
          width: 100%;
          padding: 0.6rem 0.75rem 0.6rem 2.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 20px;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.3s;
        }
        .search-input:focus {
          border-color: #15803d;
        }
        .nav-links-desktop {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .nav-link {
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 0;
          border-bottom: 2px solid transparent;
          transition: all 0.3s;
        }
        .nav-link:hover {
          color: #15803d;
          border-bottom-color: #15803d;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .auth-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: all 0.3s;
        }
        .auth-link:hover {
          background: #f3f4f6;
          border-bottom: none;
        }
        .auth-text {
          font-size: 0.9rem;
        }
        .cart-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: #15803d;
          color: white;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.3s;
        }
        .cart-button:hover {
          background: #166534;
          transform: translateY(-1px);
        }
        .cart-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: bold;
          border: 2px solid white;
        }
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #374151;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: background 0.3s;
        }
        .mobile-menu-btn:hover {
          background: #f3f4f6;
        }
        .mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border-top: 1px solid #e5e7eb;
        }
        .mobile-menu-content {
          padding: 1rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .mobile-nav-link {
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.3s;
        }
        .mobile-nav-link:hover {
          color: #15803d;
        }
        .mobile-nav-link:last-child {
          border-bottom: none;
        }
        .mobile-nav-link.signup {
          background: #15803d;
          color: white;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin-top: 0.5rem;
          text-align: center;
          justify-content: center;
        }
        .mobile-nav-link.signup:hover {
          background: #166534;
          color: white;
        }
        .mobile-menu-divider {
          height: 1px;
          background: #e5e7eb;
          margin: 0.5rem 0;
        }
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .nav-container {
            padding: 1rem;
            gap: 1rem;
          }
          .nav-links-desktop {
            display: none;
          }
          .mobile-menu-btn {
            display: block;
          }
          .mobile-menu {
            display: block;
          }
          .nav-search {
            display: none;
          }
          .auth-text {
            display: none;
          }
          .logo-text {
            display: none;
          }
          .logo-icon {
            font-size: 1.5rem;
          }
        }
        @media (max-width: 480px) {
          .nav-container {
            padding: 0.75rem;
          }
          .cart-button {
            width: 40px;
            height: 40px;
          }
          .cart-badge {
            width: 20px;
            height: 20px;
            font-size: 0.7rem;
          }
        }
      `}
      </style>
      </nav>
    );
  }