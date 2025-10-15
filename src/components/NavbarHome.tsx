'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  Phone,
  Search,
  LogIn,
  UserPlus,
} from 'lucide-react';

interface UserInfo {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  email?: string;
}

interface NavbarProps {
  cartItemCount?: number;
  notificationsCount?: number;
  cartAmount?: number | string; // optional: show "$21" style
  onSearch?: (term: string, category: string) => void;
  categories?: string[];
  user?: UserInfo | null; // null/undefined -> logged out
  logoSrc?: string; // image space (e.g. '/logo-basket.png')
  brandTitle?: string; // e.g. 'Groceyish'
  brandSubtitle?: string; // e.g. 'GROCERY'
}

export default function Navbar({
  cartItemCount = 0,
  notificationsCount = 0,
  cartAmount,
  onSearch,
  categories = ['All Categories', 'Fruits & Veggies', 'Bakery', 'Dairy', 'Snacks', 'Beverages'],
  user = null,
  logoSrc = '/logo.png', 
  brandTitle = 'AgriConnect',
  brandSubtitle = '',
}: NavbarProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState(categories[0] || 'All Categories');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm, category);
    } else {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (category && category !== 'All Categories') params.set('category', category);
      router.push(`/products?${params.toString()}`);
    }
    setIsMenuOpen(false);
  };

  const mainLinks = [
    { href: '/home', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/feedback', label: 'Feedback' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="wrapper">
      <div className="topbar">
        <Link href="/" className="brand">
          <div className="logoBox" aria-label="Brand logo">
            <Image src={logoSrc} alt="Logo" fill sizes="64px" className="logoImg" />
          </div>
          <div className="brandText">
            <span className="brandTitle">{brandTitle}</span>
            <span className="brandSubtitle">{brandSubtitle}</span>
          </div>
        </Link>

        <form onSubmit={handleSearch} className="searchBlock" role="search" aria-label="Product search">
          <select
            className="categorySelect"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Select category"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="searchInput"
            placeholder="Search for items…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button type="submit" className="searchBtn" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>

        <div className="actions">
          <Link href="/notifications" className="iconBtn" aria-label="Notifications">
            <Bell size={20} />
            {notificationsCount > 0 && <span className="badge">{notificationsCount}</span>}
          </Link>

          <Link href="/cart" className="cartBtn" aria-label="Cart">
            <ShoppingCart size={20} />
            {typeof cartAmount !== 'undefined' && (
              <span className="cartAmount">{typeof cartAmount === 'number' ? `$${cartAmount}` : cartAmount}</span>
            )}
            {/* Render badge only when there are items in cart (positive integer) */}
            {Number.isFinite(cartItemCount) && cartItemCount > 0 ? (
              <span className="badge" aria-live="polite">{cartItemCount}</span>
            ) : null}
          </Link>

          {!user ? (
            <div className="authBtns">
              <Link href="/auth/login" className="textBtn">
                <span>Login</span>
              </Link>
              <Link href="/auth/signup" className="filledBtn">
                <span>Register</span>
              </Link>
            </div>
          ) : (
            <Link href="/account" className="userBlock">
              <User size={20} className="userIcon" />
              <span className="userName">Hello, {user.firstName || user.email}</span>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="mobileToggle"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className="secondbar">
        <nav className="mainnav" aria-label="Primary">
          {mainLinks.map((l) => (
            <Link key={l.href} href={l.href} className="navlink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      {isMenuOpen && (
        <div className="mobileMenu" role="dialog" aria-modal="true">
          <div className="mobileSection">
            <form onSubmit={handleSearch} className="mobileSearch">
              <select
                className="mobileSelect"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Select category"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                className="mobileInput"
                placeholder="Search for items…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="mobileSearchBtn">Search</button>
            </form>
          </div>
          <div className="mobileSection">
            {mainLinks.map((l) => (
              <Link key={l.href} href={l.href} className="mobileLink" onClick={() => setIsMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mobileSection">
            {!user ? (
              <>
                <Link href="/auth/login" className="mobileAction" onClick={() => setIsMenuOpen(false)}>
                  <LogIn size={18} /> Login
                </Link>
                <Link href="/auth/signup" className="mobileAction" onClick={() => setIsMenuOpen(false)}>
                  <UserPlus size={18} /> Register
                </Link>
              </>
            ) : (
              <Link href="/account" className="mobileAction" onClick={() => setIsMenuOpen(false)}>
                <User size={18} /> Hello, {user.firstName || user.email}
              </Link>
            )}
            <Link href="/notifications" className="mobileAction" onClick={() => setIsMenuOpen(false)}>
              <Bell size={18} /> Notifications
            </Link>
            <Link href="/cart" className="mobileAction" onClick={() => setIsMenuOpen(false)}>
              <ShoppingCart size={18} /> Cart
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        :root {
          --green: #21a565;
          --green-600: #189a5c;
          --green-700: #148a52;
          --text: #1f2937;
          --muted: #6b7280;
          --line: #e5e7eb;
          --bg: #ffffff;
        }

        .wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
          border-bottom: 1px solid rgba(33, 165, 101, 0.08);
        }

        /* ========== TOP BAR ========== */
        .topbar {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem 1.5rem;
        }

        .brand {
          display: grid;
          grid-template-columns: 60px auto;
          gap: .65rem;
          align-items: center;
          text-decoration: none;
          color: var(--text);
          min-width: 220px;
          transition: transform 0.2s ease;
        }
        .brand:hover {
          transform: translateY(-1px);
        }
        .logoBox {
          width: 60px;
          height: 60px;
          position: relative;
          border-radius: 14px;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(33, 165, 101, 0.15), inset 0 0 0 1px rgba(33, 165, 101, 0.1);
        }
        .logoImg { 
          object-fit: contain; 
          padding: 8px;
        }
        .brandText { 
          line-height: 1.15; 
        }
        .brandTitle {
          display: block;
          font-weight: 700;
          font-size: 1.35rem;
          background: linear-gradient(135deg, #169357 0%, #21a565 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.3px;
        }
        .brandSubtitle {
          display: block;
          font-size: .75rem;
          color: var(--muted);
          letter-spacing: .15em;
          text-transform: uppercase;
          font-weight: 600;
        }

        .searchBlock {
          display: grid;
          grid-template-columns: 190px 1fr 52px;
          align-items: stretch;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #e5e7eb;
          background: white;
          transition: all 0.3s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .searchBlock:focus-within {
          border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(33, 165, 101, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .categorySelect {
          appearance: none;
          background: var(--green);
          border: none;
          padding: 0 1rem;
          font-weight: 600;
          font-size: 0.9rem;
          color: white;
          outline: none;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .categorySelect:hover {
          background: var(--green-600);
        }
        .searchInput {
          border: none;
          padding: .9rem 1.1rem;
          outline: none;
          font-size: .95rem;
          background: white;
        }
        .searchInput::placeholder {
          color: #9ca3af;
        }
        .searchBtn {
          display: grid;
          place-items: center;
          background: var(--green);
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .searchBtn:hover { 
          background: var(--green-600);
          transform: scale(1.05);
        }
        .searchBtn:active {
          transform: scale(0.98);
        }

        /* actions */
        .actions {
          display: flex;
          align-items: center;
          gap: .8rem;
        }
        .iconBtn, .cartBtn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border-radius: 12px;
          text-decoration: none;
          color: var(--text);
          border: 2px solid #f3f4f6;
          background: #fff;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .iconBtn:hover {
          background: #f9fafb;
          border-color: var(--green);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(33, 165, 101, 0.15);
        }

        .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #fff;
          font-size: .7rem;
          display: grid;
          place-items: center;
          border: 2px solid #fff;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }

        .cartBtn {
          gap: .5rem;
          width: auto;
          padding: 0 1rem;
          color: #fff;
          background: linear-gradient(135deg, var(--green) 0%, var(--green-600) 100%);
          border-color: transparent;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(33, 165, 101, 0.25);
        }
        .cartBtn:hover { 
          background: linear-gradient(135deg, var(--green-600) 0%, var(--green-700) 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(33, 165, 101, 0.35);
        }
        .cartAmount {
          font-weight: 700;
          margin-left: .25rem;
        }

        .authBtns {
          display: flex;
          gap: .6rem;
          margin-left: .25rem;
        }
        .textBtn, .filledBtn {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          height: 46px;
          border-radius: 12px;
          padding: 0 1.3rem;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .textBtn {
          color: var(--text);
          border: 2px solid #e5e7eb;
          background: white;
        }
        .textBtn:hover {
          background: #f9fafb;
          border-color: var(--green);
          color: var(--green);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(33, 165, 101, 0.1);
        }

        .filledBtn {
          color: #fff;
          background: linear-gradient(135deg, var(--green) 0%, var(--green-600) 100%);
          border: 2px solid transparent;
          box-shadow: 0 2px 8px rgba(33, 165, 101, 0.25);
        }
        .filledBtn:hover { 
          background: linear-gradient(135deg, var(--green-600) 0%, var(--green-700) 100%);
          border-color: transparent;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(33, 165, 101, 0.35);
        }

        .userBlock {
          display: inline-flex;
          align-items: center;
          gap: .8rem;
          text-decoration: none;
          color: var(--text);
          padding: .65rem 1.2rem;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          background: white;
          transition: all 0.2s ease;
          cursor: pointer;
          white-space: nowrap;
          min-width: fit-content;
        }
        .userBlock:hover {
          background: #f9fafb;
          border-color: var(--green);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(33, 165, 101, 0.15);
        }
        .userIcon {
          color: var(--green);
          transition: transform 0.2s ease;
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }
        .userBlock:hover .userIcon {
          transform: scale(1.1);
        }
        .userName { 
          font-weight: 700; 
          font-size: .95rem;
          color: var(--text);
          white-space: nowrap;
          line-height: 1;
        }

        .mobileToggle {
          display: none;
          background: #fff;
          border: 1px solid var(--line);
          width: 44px; 
          height: 44px;
          border-radius: 12px;
          margin-left: .25rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mobileToggle:hover {
          background: #f9fafb;
          border-color: var(--green);
        }

        /* ========== SECOND BAR ========== */
        .secondbar {
          border-top: 1px solid rgba(33, 165, 101, 0.08);
          background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
          display: block;
          align-items: center;
          gap: 1rem;
          padding: .8rem 1.5rem;
          max-width: 1280px;
          margin: 0 auto;
        }

        .browseBtn {
          display: inline-flex;
          align-items: center;
          gap: .6rem;
          text-decoration: none;
          background: #e9f9f2;
          color: #137b49;
          border: 1px solid #c9f0df;
          padding: .6rem .9rem;
          border-radius: 12px;
          font-weight: 700;
        }
        .gridIcon {
          width: 18px; height: 18px;
          background: linear-gradient(180deg,#17a05d,#1ab06a);
          border-radius: 4px;
          box-shadow: inset 0 0 0 2px rgba(255,255,255,.6);
        }

        .mainnav {
          display: flex;
          margin: auto;
          gap: 2rem;
          justify-content: center;
        }
        .navlink {
          color: var(--text);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          padding: .4rem 0;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
          position: relative;
        }
        .navlink:hover { 
          color: var(--green-700); 
          border-bottom-color: var(--green-700); 
        }
        .navlink::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--green-700);
          transition: width 0.3s ease;
        }
        .navlink:hover::before {
          width: 100%;
        }

        .support {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
          color: var(--muted);
        }
        .supportNum {
          font-weight: 800;
          text-decoration: none;
          color: var(--green-700);
        }
        .supportText { font-size: .9rem; }

        /* ========== MOBILE ========== */
        @media (max-width: 1000px) {
          .searchBlock { grid-template-columns: 150px 1fr 48px; }
          .brand { min-width: 180px; }
        }

        /* Mobile dropdown panel */
        .mobileMenu {
          border-top: 1px solid var(--line);
          background: #fff;
        }
        .mobileSection {
          padding: .9rem 1rem;
          border-bottom: 1px solid var(--line);
        }
        .mobileSearch {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: .5rem;
        }
        .mobileSelect, .mobileInput, .mobileSearchBtn {
          height: 42px; border-radius: 10px; border: 1px solid var(--line);
        }
        .mobileSelect, .mobileInput {
          padding: 0 .75rem;
        }
        .mobileSearchBtn {
          background: var(--green); 
          color: #fff; 
          border: none; 
          padding: 0 1rem; 
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .mobileSearchBtn:hover {
          background: var(--green-700);
        }
        .mobileLink {
          display: block;
          text-decoration: none;
          color: var(--text);
          font-weight: 600;
          padding: .6rem 0;
          transition: color 0.2s ease;
        }
        .mobileLink:hover {
          color: var(--green);
        }
        .mobileAction {
          display: inline-flex; 
          align-items: center; 
          gap: .5rem;
          text-decoration: none; 
          color: var(--text);
          margin-right: 1rem; 
          font-weight: 600;
          transition: color 0.2s ease;
        }
        .mobileAction:hover {
          color: var(--green);
        }
      `}</style>
    </header>
  );
}
