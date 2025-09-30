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
  name: string;
  avatarUrl?: string;
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
            {cartItemCount > 0 && <span className="badge">{cartItemCount}</span>}
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
              <div className="avatar">
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.name} fill sizes="36px" className="avatarImg" />
                ) : (
                  <User size={18} />
                )}
              </div>
              <div className="userMeta">
                <span className="hello">Hello,</span>
                <span className="userName">{user.name}</span>
              </div>
              <ChevronDown size={16} className="chev" />
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
                <User size={18} /> {user.name}
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
          position:   sticky;
          top: 0;
          z-index: 1000;
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,.06);
        }

        /* ========== TOP BAR ========== */
        .topbar {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 1rem;
          padding: .8rem 1rem;
        }

        .brand {
          display: grid;
          grid-template-columns: 56px auto;
          gap: .5rem;
          align-items: center;
          text-decoration: none;
          color: var(--text);
          min-width: 210px;
        }
        .logoBox {
          width: 56px;
          height: 56px;
          position: relative;
          border-radius: 12px;
          background: #f0fdf4;
          overflow: hidden;
          box-shadow: inset 0 0 0 1px #d1fae5;
        }
        .logoImg { object-fit: contain; }
        .brandText { line-height: 1.05; }
        .brandTitle {
          display: block;
          font-weight: 700;
          font-size: 1.25rem;
          color: #169357;
          letter-spacing: .2px;
        }
        .brandSubtitle {
          display: block;
          font-size: .8rem;
          color: var(--muted);
          letter-spacing: .25em;
        }

        /* search block */
        .searchBlock {
          display: grid;
          grid-template-columns: 180px 1fr 48px;
          align-items: stretch;
          border-radius: 10px;
          overflow: hidden;
          border: 1.5px solid var(--line);
        }
        .categorySelect {
          appearance: none;
          background: green;
          border: none;
          padding: 0 .9rem;
          font-weight: 600;
          color: white;
          border-right: 1.5px solid var(--line);
          outline: none;
        }
        .searchInput {
          border: 1px solid black;
          border-radius:0px 10px 10px 0px;
          padding: .85rem 1rem;
          outline: none;
          font-size: .95rem;
        }
        .searchBtn {
          display: grid;
          place-items: center;
          background: var(--green);
          color: white;
          border: none;
          cursor: pointer;
          transition: background .2s ease;
        }
        .searchBtn:hover { background: var(--green-600); }

        /* actions */
        .actions {
          display: flex;
          align-items: center;
          gap: .6rem;
        }
        .iconBtn, .cartBtn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          margin-left: -50px !important;
          height: 44px;
          border-radius: 12px;
          text-decoration: none;
          color: var(--text);
          border: 1px solid var(--line);
          background: #fff;
        }

        .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 999px;
          background: #ef4444;
          color: #fff;
          font-size: .7rem;
          display: grid;
          place-items: center;
          border: 2px solid #fff;
          font-weight: 700;
        }

        .cartBtn {
          gap: .4rem;
          width: auto;
          padding: 0 .8rem;
          color: #fff;
          background: var(--green);
          border-color: transparent;
        }
        .cartBtn:hover { background: var(--green-700); }
        .cartAmount {
          font-weight: 700;
          margin-left: .25rem;
        }

        .authBtns {
          display: flex;
          gap: .5rem;
          margin-left: .25rem;
        }
        .textBtn, .filledBtn {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          height: 44px;
          border-radius: 12px;
          padding: 0 .9rem;
          text-decoration: none;
          font-weight: 600;
        }
        .textBtn {
          color: var(--text);
          border: 1px solid var(--line);
          background: green !important;
        }

        .filledBtn {
          color: #fff;
          background: green;
        }
        .filledBtn:hover { background: var(--green-700); }

        .userBlock {
          display: grid;
          grid-template-columns: 36px auto 16px;
          gap: .5rem;
          align-items: center;
          text-decoration: none;
          color: var(--text);
          padding: .25rem;
          border-radius: 10px;
          border: 1px solid var(--line);
        }
        .avatar {
          width: 36px; height: 36px; border-radius: 999px;
          position: relative; overflow: hidden;
          display: grid; place-items: center;
          background: #f3f4f6; color: #6b7280;
        }
        .avatarImg { object-fit: cover; }
        .userMeta { line-height: 1.05; }
        .hello { display: block; font-size: .65rem; color: var(--muted); }
        .userName { display: block; font-weight: 700; font-size: .9rem; }
        .chev { color: var(--muted); }

        .mobileToggle {
          display: none;
          background: #fff;
          border: 1px solid var(--line);
          width: 44px; height: 44px;
          border-radius: 12px;
          margin-left: .25rem;
        }

        /* ========== SECOND BAR ========== */
        .secondbar {
          border-top: 1px solid var(--line);
          background: #fff;
          display: block;
          align-items: center;
          gap: 1rem;
          padding: .6rem 1rem;
          max-width: 1200px;
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
          gap: 1.5rem;
          justify-content: center;
        }
        .navlink {
          color: var(--text);
          text-decoration: none;
          font-weight: 600;
          padding: .35rem 0;
          border-bottom: 2px solid transparent;
        }
        .navlink:hover { color: var(--green-700); border-bottom-color: var(--green-700); }

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
        @media (max-width: 860px) {
          .topbar { grid-template-columns: auto 1fr auto; gap: .6rem; }
          .brandSubtitle { display: none; }
          .categorySelect { display: none; }
          .searchBlock { grid-template-columns: 1fr 48px; }
          .authBtns { display: none; }
          .userBlock { display: none; }
          .mobileToggle { display: inline-grid; place-items: center; }
          .secondbar { grid-template-columns: 1fr auto; }
          .browseBtn { display: none; }
          .mainnav { justify-content: flex-start; overflow-x: auto; }
          .support { display: none; }
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
          background: var(--green); color: #fff; border: none; padding: 0 1rem; font-weight: 700;
        }
        .mobileLink {
          display: block;
          text-decoration: none;
          color: var(--text);
          font-weight: 600;
          padding: .6rem 0;
        }
        .mobileAction {
          display: inline-flex; align-items: center; gap: .5rem;
          text-decoration: none; color: var(--text);
          margin-right: 1rem; font-weight: 600;
        }
      `}</style>
    </header>
  );
}
