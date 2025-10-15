"use client";

import { useEffect, useMemo, useState } from "react";
import { useFeedback } from "@/components/FeedbackContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, ChevronDown, ChevronUp, Filter } from "lucide-react";
import Navbar from "../../components/NavbarHome";

interface Product {
  id: number;
  product_name: string;
  final_price: number;
  unit: string;
  category_name: string;
  supplier_count: number;
  total_supplied: number;
  status: string;
  image_url?: string;      // <- optional (recommended from backend)
  created_at?: string;     // <- optional (for sorting by added date)
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  unit: string;
}

const API_BASE_URL = "http://localhost:5000/api";
const WESTERN_PROVINCE_ID = 1;
const USER_ID = 1;

type SortKey = "price" | "name" | "date";
type SortDir = "asc" | "desc";

export default function HomePage() {
  const { open: openFeedback } = useFeedback();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  // NEW: sorting state
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const categories = [
    { id: "all", name: "All Products" },
    { id: "Vegetables", name: "Vegetables" },
    { id: "Fruits", name: "Fruits" },
    { id: "Leafy Greens", name: "Leafy Greens" },
    { id: "Root Vegetables", name: "Root Vegetables" },
  ];

  const categoryImages: Record<string, string> = {
    "All Products": "/images/all-products.png",
    "Vegetables": "/images/vegetables.png",
    "Fruits": "/images/fruits.png",
    "Leafy Greens": "/images/leafy-greens.png",
    "Root Vegetables": "/images/root-vegetables.png",
  };

  useEffect(() => {
    fetchProducts();
    loadCartFromLocalStorage();
  }, []);

  const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  };

  const saveCartToLocalStorage = (cart: CartItem[]) => {
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/products/province/${WESTERN_PROVINCE_ID}`);
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      if (data.success) {
        // keep only active products
        setProducts(
          (data.data as Product[]).filter((p) => p.status === "active")
        );
      } else {
        setError(data.message || "Failed to fetch products");
      }
    } catch (err: any) {
      // Silently handle network errors when backend is not running
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        console.info("Products backend not available. Using empty product list.");
        setProducts([]);
        setError(null); // Don't show error to user when backend is simply not running
      } else {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        !term ||
        p.product_name.toLowerCase().includes(term) ||
        p.category_name.toLowerCase().includes(term);
      const matchCat = selectedCategory === "all" || p.category_name === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  const sortedProducts = useMemo(() => {
    const copy = [...filteredProducts];
    copy.sort((a, b) => {
      if (sortKey === "price") {
        const diff = (a.final_price ?? 0) - (b.final_price ?? 0);
        return sortDir === "asc" ? diff : -diff;
      }
      if (sortKey === "name") {
        const diff = a.product_name.localeCompare(b.product_name);
        return sortDir === "asc" ? diff : -diff;
      }
      // date (fallback: newest first if missing)
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      const diff = da - db;
      return sortDir === "asc" ? diff : -diff;
    });
    return copy;
  }, [filteredProducts, sortKey, sortDir]);

  const addToCart = async (product: Product) => {
    setAddingToCart(product.id);
    if (!product.id || typeof product.id !== "number" || product.id <= 0) {
      alert("Invalid product. Cannot add to cart.");
      setAddingToCart(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${USER_ID}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, qty: 1 }),
      });

      if (response.ok) {
        const existingItemIndex = cartItems.findIndex((item) => item.id === product.id);
        let updated: CartItem[];
        if (existingItemIndex >= 0) {
          updated = cartItems.map((it, i) => (i === existingItemIndex ? { ...it, qty: it.qty + 1 } : it));
        } else {
          updated = [
            ...cartItems,
            { id: product.id, name: product.product_name, price: product.final_price, qty: 1, unit: product.unit },
          ];
        }
        setCartItems(updated);
        saveCartToLocalStorage(updated);
      } else {
        const errorText = await response.text();
        console.error("Failed to add item to cart:", errorText);
        alert("Failed to add item to cart. " + errorText);
      }
    } catch (err: any) {
      // Handle backend not available gracefully - still update local cart
      if (err.message === "Failed to fetch" || err.name === "TypeError") {
        console.info("Cart backend not available. Adding to local cart only.");
        const existingItemIndex = cartItems.findIndex((item) => item.id === product.id);
        let updated: CartItem[];
        if (existingItemIndex >= 0) {
          updated = cartItems.map((it, i) => (i === existingItemIndex ? { ...it, qty: it.qty + 1 } : it));
        } else {
          updated = [
            ...cartItems,
            { id: product.id, name: product.product_name, price: product.final_price, qty: 1, unit: product.unit },
          ];
        }
        setCartItems(updated);
        saveCartToLocalStorage(updated);
      } else {
        console.error("Error adding to cart:", err);
        alert("Error adding to cart. Please try again later.");
      }
    } finally {
      setAddingToCart(null);
    }
  };

  const getCartItemCount = () => cartItems.reduce((t, i) => t + i.qty, 0);

  if (loading) return <LoadingScreen />;

  return (
    <div className="home-container">
      <Navbar 
        cartItemCount={getCartItemCount()} 
        user={user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        } : null}
      />

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-title">Don’t miss our daily amazing deals.</h1>
            <p className="hero-subtitle">Save up to 60% off on your first order</p>
            <div style={{display:'flex', gap:12, marginTop:16}}>
              
            </div>
          </div>
          <div className="hero-right">
            <img src="/image2.png" alt="Fresh produce" className="hero-img" />
          </div>
        </div>
      </section>

      {/* CATEGORIES
      <button
                onClick={() => openFeedback({ title: 'Share your feedback', subtitle: 'Help us improve your shopping experience', showRatingSummary: true, autoCloseDelay: null })}
                style={{background:'#9333ea', color:'#fff', fontWeight:600, padding:'12px 28px', borderRadius:12, border:'none', cursor:'pointer', boxShadow:'0 4px 12px rgba(147,51,234,0.3)'}}
              >
                Give Feedback
              </button>
      */}
      <section className="categories-section">
        <div className="categories-container">
          <h2 className="categories-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`category-button ${selectedCategory === category.id ? "active" : ""}`}
              >
                <div className="category-image-placeholder">
                  {categoryImages[category.name] && (
                    <img
                      src={categoryImages[category.name]}
                      alt={category.name}
                      style={{ width: "64px", height: "64px", objectFit: "contain" }}
                    />
                  )}
                </div>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS + SORT BAR */}
      <section className="products-section">
        <div className="products-container">
          <div className="products-header">
            <div className="products-header-left">
              <h2>
                {selectedCategory === "all" ? "All Products" : selectedCategory}
                <span className="products-count">({sortedProducts.length} items)</span>
              </h2>
            </div>

            <div className="products-header-right">
              <div className="sort-wrap">
                <span className="sort-label"><Filter size={16} /> Sort by</span>
                <select
                  className="sort-select"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                >
                  <option value="date">Added Date</option>
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                </select>
                <button
                  className="sort-dir-btn"
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  aria-label="Toggle sort direction"
                  title="Toggle sort direction"
                >
                  {sortDir === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              <input
                className="search-input"
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <p>Failed to load products. Please try again.</p>
              <button onClick={fetchProducts} className="retry-button">Retry</button>
            </div>
          )}

          {sortedProducts.length === 0 && !error ? (
            <div className="no-products">
              <p>No products found for “{searchTerm}” in {selectedCategory === "all" ? "all categories" : selectedCategory}</p>
            </div>
          ) : (
            <div className="products-grid">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCart(product)}
                  isAddingToCart={addingToCart === product.id}
                  imageUrl={getBestImage(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FOOTER (unchanged) */}
      <footer className="site-footer">
        {/* ... your existing footer content unchanged ... */}
        <div className="footer-main">
          <div className="footer-col footer-logo-info">
            <div className="footer-logo-row">
              <div className="footer-logo-placeholder">
                <img src="/logo.png" alt="AgriConnect Logo" style={{ width: "48px", height: "48px", objectFit: "contain" }} />
              </div>
              <div>
                <span className="footer-brand">AgriConnect</span>
                <div className="footer-brand-sub">GROCERY</div>
              </div>
            </div>
            <div className="footer-info-list">
              <div className="footer-info-item"><span className="footer-info-icon">📍</span> <span>Address: 123 Green Lane, Colombo</span></div>
              <div className="footer-info-item"><span className="footer-info-icon">📞</span> <span>Call Us: 0112-345678</span></div>
              <div className="footer-info-item"><span className="footer-info-icon">✉️</span> <span>Email: agriconnect@contact.com</span></div>
              <div className="footer-info-item"><span className="footer-info-icon">⏰</span> <span>Work hours: 8:00 - 20:00, Mon - Sat</span></div>
            </div>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Account</div>
            <ul className="footer-link-list">
              <li><Link href="/wishlist">Wishlist</Link></li>
              <li><Link href="/cart">Cart</Link></li>
              <li><Link href="/orders">Track Order</Link></li>
              <li><Link href="/shipping">Shipping Details</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Useful links</div>
            <ul className="footer-link-list">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/deals">Hot deals</Link></li>
              <li><Link href="/promotions">Promotions</Link></li>
              <li><Link href="/products">New products</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col-title">Help Center</div>
            <ul className="footer-link-list">
              <li><Link href="/payments">Payments</Link></li>
              <li><Link href="/refund">Refund</Link></li>
              <li><Link href="/checkout">Checkout</Link></li>
              <li><Link href="/shipping">Shipping</Link></li>
              <li><Link href="/faq">Q&amp;A</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-row">
          <div className="footer-copyright">© 2025 AgriConnect, All rights reserved</div>
          <div className="footer-social-row">
            {/* ... social icons unchanged ... */}
          </div>
        </div>
      </footer>

      <style jsx>{`
        .home-container { min-height: 100vh; background: #fafafa; }

        /* HERO */
        .hero-section { background: #e6f7ef url('/image1.png') no-repeat center center; background-size: cover; padding: 0rem; padding-left: 2.5rem; }
        .hero-content { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .hero-left { display: flex; flex-direction: column; justify-content: center; }
        .hero-title { font-size: 3rem; color: #1f2937; margin-bottom: 1.5rem; font-weight: 700; line-height: 1.1; }
        .hero-subtitle { font-size: 1.3rem; color: #6b7280; margin-bottom: 2.5rem; }
        .hero-right { display: flex; align-items: center; justify-content: flex-end; }
        .hero-img { max-width: 600px; width: 100%; }

        /* CATEGORIES */
        .categories-section { padding: 4rem 2rem; background: white; }
        .categories-container { max-width: 1200px; margin: 0 auto; }
        .categories-title { text-align: center; font-size: 2.2rem; color: #1f2937; margin-bottom: 2rem; }
        .categories-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.2rem; }
        .category-button { background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 16px; padding: 1.8rem 1rem 1.1rem 1rem; cursor: pointer; transition: all 0.3s; display: flex; flex-direction: column; align-items: center; gap: 1rem; min-height: 200px; }
        .category-button:hover, .category-button.active { border-color: #15803d; background: #f0fdf4; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(21,128,61,0.2); }
        .category-image-placeholder { width: 80px; height: 80px; background: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .category-name { font-weight: 600; color: #374151; font-size: 1.05rem; }

        /* PRODUCTS */
        .products-section { padding: 3rem 2rem 4rem; background: #f9fafb; }
        .products-container { max-width: 1200px; margin: 0 auto; }
        .products-header { margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .products-header h2 { font-size: 1.6rem; color: #1f2937; display: flex; align-items: center; gap: 0.6rem; }
        .products-count { color: #6b7280; font-size: 1rem; font-weight: normal; }

        .products-header-right { display: flex; align-items: center; gap: 0.75rem; }
        .sort-wrap { display: inline-flex; align-items: center; gap: 0.5rem; background: #fff; border: 1px solid #e5e7eb; padding: 0.4rem 0.6rem; border-radius: 10px; }
        .sort-label { display: inline-flex; align-items: center; gap: 0.4rem; color: #374151; font-size: 0.9rem; }
        .sort-select { border: none; outline: none; background: transparent; font-size: 0.95rem; color: #111827; padding: 0.2rem 0.25rem; }
        .sort-dir-btn { background: #f3f4f6; border: 1px solid #e5e7eb; padding: 0.25rem; border-radius: 8px; cursor: pointer; }
        .sort-dir-btn:hover { background: #e5e7eb; }

        .search-input { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.55rem 0.8rem; outline: none; min-width: 220px; }

        /* 4-COLUMN GRID (responsive) */
        .products-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.2rem; }
        @media (max-width: 1100px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 820px)  { .products-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px)  { .products-grid { grid-template-columns: 1fr; } }

        .error-message { text-align: center; padding: 2rem; background: #fef2f2; border-radius: 12px; color: #dc2626; }
        .retry-button { background: #dc2626; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; margin-top: 1rem; cursor: pointer; }
        .no-products { text-align: center; padding: 3rem 2rem; color: #6b7280; }

        /* FOOTER (kept from your version) */
        .site-footer { background: #fff; color: #222; padding: 3rem 2rem 1rem; border-top: 1px solid #e5e7eb; }
        .footer-main { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 2.5rem; align-items: flex-start; }
        .footer-col { min-width: 180px; }
        .footer-logo-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.2rem; }
        .footer-logo-placeholder { width: 48px; height: 48px; background: #e0f7e9; border-radius: 12px; }
        .footer-brand { font-size: 2rem; font-weight: 700; color: #22c55e; }
        .footer-brand-sub { color: #bdbdbd; font-size: 1rem; font-weight: 500; }
        .footer-info-list { margin-top: 1.2rem; display: flex; flex-direction: column; gap: 0.5rem; }
        .footer-info-item { display: flex; align-items: center; gap: 0.5rem; color: #222; font-size: 1rem; }
        .footer-info-icon { font-size: 1.2rem; color: #22c55e; }
        .footer-col-title { font-size: 1.3rem; font-weight: 700; color: #222; margin-bottom: 1.2rem; }
        .footer-link-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.7rem; }
        .footer-link-list a { color: #222; text-decoration: none; font-size: 1rem; transition: color 0.2s; }
        .footer-link-list a:hover { color: #22c55e; }
        .footer-bottom-row { max-width: 1200px; margin: 2.5rem auto 0 auto; padding-top: 2rem; border-top: 1px solid #e5e7eb; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.5rem; }
        .footer-social-row { display: flex; gap: 1.2rem; }

        /* Responsive hero adjustments */
        @media (max-width: 900px) {
          .hero-content { grid-template-columns: 1fr; gap: 2rem; }
          .hero-right { justify-content: center; margin-top: 2rem; }
          .hero-title { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}

/* ===== Helpers ===== */

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getBestImage(product: Product): string {
  if (product.image_url) return product.image_url; // from backend (CDN/public URL)
  // local convention fallback: /public/images/products/<slug>.webp
  const slug = slugify(product.product_name);
  return `/images/products/${slug}.webp`;
}

/* ===== Components ===== */

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2>Loading Fresh Produce...</h2>
        <p>Getting the best products for you</p>
      </div>

      <style jsx>{`
        .loading-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); }
        .loading-content { text-align: center; }
        .loading-spinner { width: 60px; height: 60px; border: 4px solid #e5e7eb; border-top: 4px solid #15803d; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 2rem; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .loading-content h2 { color: #15803d; margin-bottom: 0.5rem; }
        .loading-content p { color: #6b7280; }
      `}</style>
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
  isAddingToCart,
  imageUrl
}: {
  product: Product;
  onAddToCart: () => void;
  isAddingToCart: boolean;
  imageUrl: string;
}) {
  // graceful runtime fallback if derived/local image missing
  const [src, setSrc] = useState(imageUrl);
  const fallbackByCategory: Record<string, string> = {
    "Vegetables": "/images/vegetables.png",
    "Fruits": "/images/fruits.png",
    "Leafy Greens": "/images/leafy-greens.png",
    "Root Vegetables": "/images/root-vegetables.png",
  };

  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`} className="product-link">
        <div className="product-image">
          <div className="image-wrap">
            <Image
              src={src}
              alt={product.product_name}
              fill
              sizes="(max-width: 520px) 100vw, (max-width: 1100px) 33vw, 25vw"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjZWVlIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+"
              onError={() => {
                const fb = fallbackByCategory[product.category_name] || "/images/all-products.png";
                if (src !== fb) setSrc(fb);
              }}
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.product_name}</h3>
          <p className="product-category">{product.category_name}</p>

          <div className="product-details">
            <div className="product-price">
              <span className="price-value">Rs. {Number(product.final_price || 0).toFixed(2)}</span>
              <span className="price-unit">per {product.unit}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="product-actions">
        <button
          className="add-to-cart-btn"
          onClick={(e) => {
            e.preventDefault();
            onAddToCart();
          }}
          disabled={isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <div className="loading-spinner-small"></div>
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              Add to Cart
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .product-card { background: white; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); transition: all 0.3s ease; overflow: hidden; display: flex; flex-direction: column; }
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .product-link { text-decoration: none; color: inherit; flex: 1; display: block; }
        .product-image { aspect-ratio: 4/3; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); position: relative; }
        .image-wrap { position: absolute; inset: 0; }
        .product-info { padding: 1rem; }
        .product-name { font-size: 1.05rem; font-weight: 700; color: #1f2937; margin-bottom: 0.25rem; }
        .product-category { color: #6b7280; font-size: 0.85rem; margin-bottom: 0.5rem; }

        .product-details { display: flex; flex-direction: column; gap: 0.6rem; }
        .product-price { display: flex; align-items: baseline; gap: 0.35rem; }
        .price-value { font-size: 1.25rem; font-weight: 800; color: #15803d; }
        .price-unit { color: #6b7280; font-size: 0.85rem; }

        .product-stock { display: flex; flex-direction: column; gap: 0.15rem; }
        .stock-status { font-weight: 700; font-size: 0.8rem; }
        .stock-quantity { color: #6b7280; font-size: 0.8rem; }

        .product-rating { display: flex; align-items: center; justify-content: space-between; }
        .stars { display: flex; gap: 2px; }
        .star-filled { color: #fbbf24; }
        .star-empty { color: #e5e7eb; }
        .supplier-count { color: #6b7280; font-size: 0.8rem; }

        .product-actions { padding: 0.9rem 1rem 1.1rem; border-top: 1px solid #f3f4f6; }
        .add-to-cart-btn { width: 100%; background: linear-gradient(135deg, #15803d, #059669); color: white; border: none; padding: 0.7rem 1rem; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.25s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .add-to-cart-btn:hover:not(:disabled) { background: linear-gradient(135deg, #166534, #047857); transform: translateY(-1px); }
        .add-to-cart-btn:disabled { background: #d1d5db; cursor: not-allowed; }
        .loading-spinner-small { width: 18px; height: 18px; border: 2px solid #ffffff60; border-top: 2px solid #ffffff; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
