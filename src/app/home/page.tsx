"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Search, Star, Truck, Shield, Leaf, Plus, Minus } from "lucide-react";
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

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

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
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  };

  const saveCartToLocalStorage = (cart: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/province/${WESTERN_PROVINCE_ID}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      if (data.success) {
        setProducts(data.data.filter((product: Product) => product.status === 'active'));
      } else {
        setError(data.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = async (product: Product) => {
    setAddingToCart(product.id);

    console.log('Attempting to add to cart:', product);

    if (!product.id || typeof product.id !== 'number' || product.id <= 0) {
      alert('Invalid product. Cannot add to cart.');
      setAddingToCart(null);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${USER_ID}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          qty: 1
        }),
      });

      if (response.ok) {
        const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
        let updatedCart;

        if (existingItemIndex >= 0) {
          updatedCart = cartItems.map((item, index) =>
            index === existingItemIndex
              ? { ...item, qty: item.qty + 1 }
              : item
          );
        } else {
          const newItem: CartItem = {
            id: product.id,
            name: product.product_name,
            price: product.final_price,
            qty: 1,
            unit: product.unit
          };
          updatedCart = [...cartItems, newItem];
        }

        setCartItems(updatedCart);
        saveCartToLocalStorage(updatedCart);
      } else {
        const errorText = await response.text();
        console.error('Failed to add item to cart:', errorText);
        alert('Failed to add item to cart. ' + errorText);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart. See console for details.');
    } finally {
      setAddingToCart(null);
    }
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.qty, 0);
  };


  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="home-container">
      <Navbar cartItemCount={getCartItemCount()} />

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <h1 className="hero-title">Don’t miss our daily amazing deals.</h1>
            <p className="hero-subtitle">Save up to 60% off on your first order</p>
          </div>
          <div className="hero-right">
            <img src="/image2.png" alt="Fresh produce" className="hero-img" />
          </div>
        </div>
      </section>

      <section className="categories-section">
        <div className="categories-container">
          <h2 className="categories-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
              >
                <div className="category-image-placeholder">
                  {categoryImages[category.name] && (
                    <img
                      src={categoryImages[category.name]}
                      alt={category.name}
                      style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                    />
                  )}
                </div>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="products-section">
        <div className="products-container">
          <div className="products-header">
            <h2>
              {selectedCategory === "all" ? "All Products" : selectedCategory}
              <span className="products-count">({filteredProducts.length} items)</span>
            </h2>
          </div>

          {error && (
            <div className="error-message">
              <p>Failed to load products. Please try again.</p>
              <button onClick={fetchProducts} className="retry-button">Retry</button>
            </div>
          )}

          {filteredProducts.length === 0 && !error ? (
            <div className="no-products">
              <p>No products found for "{searchTerm}" in {selectedCategory === "all" ? "all categories" : selectedCategory}</p>
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCart(product)}
                  isAddingToCart={addingToCart === product.id}
                  getProductImage={(category) => {
                    // fallback to emoji if no image
                    const emojiMap: Record<string, string> = {
                      "Vegetables": "🥕",
                      "Fruits": "🍎",
                      "Leafy Greens": "🥬",
                      "Root Vegetables": "🥔",
                    };
                    // You can add images for each category if you want
                    return emojiMap[category] || "🌱";
                  }}
                />
              ))}
            </div>

          )}
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-col footer-logo-info">
            <div className="footer-logo-row">
              <div className="footer-logo-placeholder">
                <img src="/logo.png" alt="AgriConnect Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
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
          {/* Account */}
          <div className="footer-col">
            <div className="footer-col-title">Account</div>
            <ul className="footer-link-list">
              <li><Link href="/wishlist">Wishlist</Link></li>
              <li><Link href="/cart">Cart</Link></li>
              <li><Link href="/orders">Track Order</Link></li>
              <li><Link href="/shipping">Shipping Details</Link></li>
            </ul>
          </div>
          {/* Useful Links */}
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
          {/* Help Center */}
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
            <a href="#" className="footer-social-icon" aria-label="Facebook"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#22c55e"/><path d="M15.5 8.5h-2a.5.5 0 0 0-.5.5v2h2.5l-.5 2H13v6h-2v-6H9v-2h2v-1.5A2.5 2.5 0 0 1 13.5 7h2v1.5Z" fill="#fff"/></svg></a>
            <a href="#" className="footer-social-icon" aria-label="LinkedIn"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#22c55e"/><path d="M8.5 10.5v6h-2v-6h2Zm-1-1.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm3 1.5v6h2v-3c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5v3h2v-3.5c0-1.7-1.3-3-3-3s-3 1.3-3 3Z" fill="#fff"/></svg></a>
            <a href="#" className="footer-social-icon" aria-label="Instagram"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#22c55e"/><path d="M12 9.5A2.5 2.5 0 1 0 12 14.5a2.5 2.5 0 0 0 0-5Zm4.5-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM12 7a5 5 0 0 1 5 5v2a5 5 0 0 1-5 5 5 5 0 0 1-5-5v-2a5 5 0 0 1 5-5Z" fill="#fff"/></svg></a>
            <a href="#" className="footer-social-icon" aria-label="Twitter"><svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#22c55e"/><path d="M17.5 9.5c-.4.2-.8.3-1.2.4.4-.2.7-.6.8-1-.4.2-.8.4-1.2.5a2.1 2.1 0 0 0-3.6 1.9c-1.7-.1-3.2-.9-4.2-2.1-.2.4-.3.8-.3 1.2 0 .8.4 1.5 1.1 1.9-.4 0-.7-.1-1-.3v.1c0 1.1.8 2 1.8 2.2-.2.1-.4.1-.7.1-.1 0-.2 0-.3-.1.2.7.9 1.2 1.7 1.2A4.2 4.2 0 0 1 7 16.3c-.3 0-.5 0-.7-.1A6 6 0 0 0 10.3 17c3.6 0 5.6-3 5.6-5.6v-.3c.4-.3.7-.6.9-1Z" fill="#fff"/></svg></a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .home-container {
          min-height: 100vh;
          background: #fafafa;
        }

        /* Hero Section */
        .hero-section {
          background: #e6f7ef url('/image1.png') no-repeat center center;
          background-size: cover;
          padding: 0rem;
          padding-left: 2.5rem;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .hero-title {
          font-size: 3rem;
          color: #1f2937;
          margin-bottom: 1.5rem;
          font-weight: 700;
          line-height: 1.1;
        }

        .hero-subtitle {
          font-size: 1.3rem;
          color: #6b7280;
          margin-bottom: 2.5rem;
        }

        .subscribe-form {
          width: 100%;
          max-width: 500px;
        }

        .subscribe-input-wrapper {
          display: flex;
          align-items: center;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          padding: 0.5rem 0.5rem 0.5rem 1rem;
        }

        .subscribe-icon {
          margin-right: 0.5rem;
          display: flex;
          align-items: center;
        }

        .subscribe-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 1rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: transparent;
        }

        .subscribe-btn {
          background: #22c55e;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 0.75rem 2rem;
          font-size: 1rem;
          font-weight: 600;
          margin-left: 0.5rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .subscribe-btn:hover {
          background: #16a34a;
        }

        .hero-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .hero-img {
          max-width: 600px;
          width: 100%;
        }

        /* Search Section */
        .search-section {
          padding: 2rem;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }

        .search-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
        }

        .search-bar {
          width: 100%;
          max-width: 500px;
        }

        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: #6b7280;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 25px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.3s;
        }

        .search-input:focus {
          border-color: #15803d;
        }

        /* Categories Section */
        .categories-section {
          padding: 4rem 2rem;
          background: white;
        }

        .categories-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .categories-title {
          text-align: center;
          font-size: 2.5rem;
          color: #1f2937;
          margin-bottom: 3rem;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .category-button {
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 2rem 1rem 1.2rem 1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.2rem;
          min-height: 220px;
        }

        .category-button:hover,
        .category-button.active {
          border-color: #15803d;
          background: #f0fdf4;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(21,128,61,0.2);
        }

        .category-image-placeholder {
          width: 80px;
          height: 80px;
          background: #fff;
          border-radius: 12px;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .category-name {
          font-weight: 600;
          color: #374151;
          font-size: 1.1rem;
        }

        /* Products Section */
        .products-section {
          padding: 4rem 2rem;
          background: #f9fafb;
        }

        .products-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .products-header {
          margin-bottom: 2rem;
        }

        .products-header h2 {
          font-size: 2rem;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .products-count {
          color: #6b7280;
          font-size: 1rem;
          font-weight: normal;
        }

        .error-message {
          text-align: center;
          padding: 2rem;
          background: #fef2f2;
          border-radius: 12px;
          color: #dc2626;
        }

        .retry-button {
          background: #dc2626;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          margin-top: 1rem;
          cursor: pointer;
        }

        .no-products {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }

        /* Footer */
        .site-footer {
          background: #fff;
          color: #222;
          padding: 3rem 2rem 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .footer-main {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2.5rem;
          align-items: flex-start;
        }

        .footer-col {
          min-width: 180px;
        }

        .footer-logo-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.2rem;
        }

        .footer-logo-placeholder {
          width: 48px;
          height: 48px;
          background: #e0f7e9;
          border-radius: 12px;
        }

        .footer-brand {
          font-size: 2rem;
          font-weight: 700;
          color: #22c55e;
        }

        .footer-brand-sub {
          color: #bdbdbd;
          font-size: 1rem;
          font-weight: 500;
        }

        .footer-info-list {
          margin-top: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-info-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #222;
          font-size: 1rem;
        }

        .footer-info-icon {
          font-size: 1.2rem;
          color: #22c55e;
        }

        .footer-col-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #222;
          margin-bottom: 1.2rem;
        }

        .footer-link-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .footer-link-list a {
          color: #222;
          text-decoration: none;
          font-size: 1rem;
          transition: color 0.2s;
        }

        .footer-link-list a:hover {
          color: #22c55e;
        }

        .footer-bottom-row {
          max-width: 1200px;
          margin: 2.5rem auto 0 auto;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .footer-copyright {
          color: #222;
          font-size: 1rem;
        }

        .footer-social-row {
          display: flex;
          gap: 1.2rem;
        }

        .footer-social-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: none;
          transition: box-shadow 0.2s;
        }

        .footer-social-icon:hover {
          box-shadow: 0 2px 8px #22c55e33;
        }

        /* Responsive Design */
        @media (max-width: 900px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .hero-right {
            justify-content: center;
            margin-top: 2rem;
          }
          .hero-title {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2>Loading Fresh Produce...</h2>
        <p>Getting the best products for you</p>
      </div>

      <style jsx>{`
        .loading-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }

        .loading-content {
          text-align: center;
        }

        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #15803d;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 2rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-content h2 {
          color: #15803d;
          margin-bottom: 0.5rem;
        }

        .loading-content p {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}

function ProductCard({ product, onAddToCart, isAddingToCart, getProductImage }: {
  product: Product;
  onAddToCart: () => void;
  isAddingToCart: boolean;
  getProductImage: (category: string) => string;
}) {
  return (
    <div className="product-card">
      <Link href={`/product/${product.id}`} className="product-link">
        <div className="product-image">
          <div className="product-image-placeholder">
            {getProductImage(product.category_name)}
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

            <div className="product-stock">
              <span className="stock-status" style={{ color: "#10b981" }}>
                In Stock
              </span>
              <span className="stock-quantity">
                {product.total_supplied} {product.unit} available
              </span>
            </div>

            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < 4 ? "star-filled" : "star-empty"}
                  />
                ))}
              </div>
              <span className="supplier-count">{product.supplier_count} suppliers</span>
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
        .product-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .product-link {
          text-decoration: none;
          color: inherit;
          flex: 1;
        }

        .product-image {
          height: 200px;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .product-image-placeholder {
          font-size: 4rem;
        }

        .product-info {
          padding: 1.5rem;
        }

        .product-name {
          font-size: 1.3rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .product-category {
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .product-price {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
        }

        .price-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #15803d;
        }

        .price-unit {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .product-stock {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .stock-status {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .stock-quantity {
          color: #6b7280;
          font-size: 0.8rem;
        }

        .product-rating {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stars {
          display: flex;
          gap: 2px;
        }

        .star-filled {
          color: #fbbf24;
        }

        .star-empty {
          color: #e5e7eb;
        }

        .supplier-count {
          color: #6b7280;
          font-size: 0.8rem;
        }

        .product-actions {
          padding: 1rem 1.5rem;
          border-top: 1px solid #f3f4f6;
        }

        .add-to-cart-btn {
          width: 100%;
          background: linear-gradient(135deg, #15803d, #059669);
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #166534, #047857);
          transform: translateY(-1px);
        }

        .add-to-cart-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .loading-spinner-small {
          width: 18px;
          height: 18px;
          border: 2px solid #ffffff60;
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}