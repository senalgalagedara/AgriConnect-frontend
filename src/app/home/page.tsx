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
const USER_ID = 1; // Demo user ID

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const categories = [
    { id: "all", name: "All Products", icon: "🏪" },
    { id: "Vegetables", name: "Vegetables", icon: "🥕" },
    { id: "Fruits", name: "Fruits", icon: "🍎" },
    { id: "Leafy Greens", name: "Leafy Greens", icon: "🥬" },
    { id: "Root Vegetables", name: "Root Vegetables", icon: "🥔" },
  ];

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

    try {
      // Add to backend cart
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
        // Update local cart
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
        console.error('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.qty, 0);
  };

  const getProductImage = (categoryName: string) => {
    switch (categoryName) {
      case "Vegetables": return "🥕";
      case "Fruits": return "🍎";
      case "Leafy Greens": return "🥬";
      case "Root Vegetables": return "🥔";
      default: return "🌱";
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="home-container">
      <Navbar cartItemCount={getCartItemCount()} />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Fresh from Farm to Your Table</h1>
            <p>Discover premium quality fruits and vegetables sourced directly from local farmers. Fresh, organic, and delivered to your doorstep.</p>
            <div className="hero-features">
              <div className="hero-feature">
                <Truck size={20} />
                <span>Free Delivery</span>
              </div>
              <div className="hero-feature">
                <Shield size={20} />
                <span>Quality Assured</span>
              </div>
              <div className="hero-feature">
                <Leaf size={20} />
                <span>Farm Fresh</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-placeholder">
              🥕🍎🥬🍊🥔
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-bar">
            <div className="search-input-container">
              <Search size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search for fresh fruits & vegetables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
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
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
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
                  getProductImage={getProductImage}
                />
              ))}
            </div>

          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>AgriConnect</h3>
            <p>Connecting farmers with consumers for fresh, quality produce.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/faq">FAQ</Link>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <Link href="/help">Help Center</Link>
            <Link href="/shipping">Shipping Info</Link>
            <Link href="/returns">Returns</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 AgriConnect. All rights reserved.</p>
        </div>
      </footer>

      <style jsx>{`
        .home-container {
          min-height: 100vh;
          background: #fafafa;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          padding: 4rem 2rem;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-text h1 {
          font-size: 3rem;
          color: #1f2937;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .hero-text p {
          font-size: 1.2rem;
          color: #6b7280;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .hero-features {
          display: flex;
          gap: 2rem;
        }

        .hero-feature {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #15803d;
          font-weight: 600;
        }

        .hero-image-placeholder {
          font-size: 8rem;
          text-align: center;
          background: white;
          border-radius: 20px;
          padding: 3rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
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
          padding: 2rem 1rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .category-button:hover,
        .category-button.active {
          border-color: #15803d;
          background: #f0fdf4;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(21,128,61,0.2);
        }

        .category-icon {
          font-size: 3rem;
        }

        .category-name {
          font-weight: 600;
          color: #374151;
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
          background: #1f2937;
          color: white;
          padding: 3rem 2rem 1rem;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .footer-section h3,
        .footer-section h4 {
          margin-bottom: 1rem;
          color: #15803d;
        }

        .footer-section a {
          color: #d1d5db;
          text-decoration: none;
          display: block;
          margin-bottom: 0.5rem;
        }

        .footer-section a:hover {
          color: #15803d;
        }

        .footer-bottom {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #374151;
          color: #9ca3af;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 2rem;
          }

          .hero-text h1 {
            font-size: 2rem;
          }

          .hero-features {
            justify-content: center;
            flex-wrap: wrap;
          }

          .categories-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .products-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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