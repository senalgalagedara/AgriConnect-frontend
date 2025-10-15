'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Plus, Minus, ArrowLeft, Truck, Shield, Leaf, Users, ImageOff } from 'lucide-react';
import Navbar from '../../../components/NavbarHome';

interface ProductDetail {
  id: number;
  product_name: string;
  final_price: number;
  unit: string;
  category_name: string;
  province_name: string;
  supplier_count: number;
  total_supplied: number;
  status: string;
  daily_limit: number;
  created_at: string;
  updated_at: string;
  image_url?: string | null;   // <-- NEW
}

// Reflect possible API shapes, then normalize into ProductDetail
type ProductDetailRaw = {
  id: number | string | null;
  product_name?: string | null;
  final_price?: number | string | null;
  unit?: string | null;
  category_name?: string | null;
  province_name?: string | null;
  supplier_count?: number | string | null;
  total_supplied?: number | string | null;
  status?: string | null;
  daily_limit?: number | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  image_url?: string | null;   // <-- NEW
};

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  unit: string;
}

const API_BASE_URL = 'http://localhost:5000/api';
const USER_ID = 1; // Demo user ID

function toNum(v: unknown, fallback = 0): number {
  if (v === null || v === undefined || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function normalizeProduct(raw: ProductDetailRaw): ProductDetail {
  return {
    id: toNum(raw.id, 0),
    product_name: String(raw.product_name ?? ''),
    final_price: toNum(raw.final_price, 0),
    unit: String(raw.unit ?? ''),
    category_name: String(raw.category_name ?? ''),
    province_name: String(raw.province_name ?? ''),
    supplier_count: toNum(raw.supplier_count, 0),
    total_supplied: toNum(raw.total_supplied, 0),
    status: String(raw.status ?? ''),
    daily_limit: toNum(raw.daily_limit, 0),
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
    image_url: raw.image_url ?? null,
  };
}

export default function ProductDetailPage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const productId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const [reviews] = useState([
    { id: 1, user: 'John D.', rating: 5, comment: 'Fresh and high quality vegetables!', date: '2024-01-15' },
    { id: 2, user: 'Sarah M.', rating: 4, comment: 'Good quality, delivered on time.', date: '2024-01-10' },
    { id: 3, user: 'Mike R.', rating: 5, comment: 'Excellent product, will order again.', date: '2024-01-08' },
  ]);

  useEffect(() => {
    if (productId) {
      fetchProductDetail();
    }
    loadCartFromLocalStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // when product is loaded, compute best image src
  useEffect(() => {
    if (!product) return;
    const best = getBestImage(product);
    setImgSrc(best);
  }, [product]);

  const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed: CartItem[] = JSON.parse(savedCart);
        setCartItems(parsed.map(ci => ({ ...ci, price: toNum(ci.price, 0) })));
      } catch {
        setCartItems([]);
      }
    }
  };

  const saveCartToLocalStorage = (cart: CartItem[]) => {
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/products/${productId}`);

      if (!response.ok) {
        throw new Error('Product not found');
      }

      const data = await response.json();
      if (data?.success) {
        const normalized = normalizeProduct(data.data as ProductDetailRaw);
        setProduct(normalized);
      } else {
        setError(data?.message || 'Failed to fetch product details');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to fetch product details');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (change: number) => {
    const maxQty = product?.daily_limit ?? 100;
    const newQty = Math.max(1, Math.min(quantity + change, maxQty));
    setQuantity(newQty);
  };

  const addToCart = async () => {
    if (!product) return;

    setAddingToCart(true);

    try {
      const response = await fetch(`${API_BASE_URL}/cart/${USER_ID}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          qty: quantity,
        }),
      });
      const result = await response.json().catch(() => null);
      console.debug('Add to cart response', response.status, result);

      if (response.ok) {
        // If backend returned the full cart, use it to update UI/localStorage
        const returnedItems = result?.data?.items ?? result?.items ?? null;

        if (Array.isArray(returnedItems)) {
          const mapped = returnedItems.map((it: any) => ({
            id: Number(it.product_id ?? it.productId ?? it.id),
            name: it.name ?? it.product_name ?? `Item ${it.product_id ?? it.id}`,
            price: toNum(it.price ?? it.final_price ?? 0),
            qty: Number(it.qty ?? it.quantity ?? 0),
            unit: it.unit ?? product.unit,
          }));
          setCartItems(mapped);
          saveCartToLocalStorage(mapped);
        } else {
          // Fallback: update local cart optimistically
          const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
          let updatedCart: CartItem[];

          if (existingItemIndex >= 0) {
            updatedCart = cartItems.map((item, index) =>
              index === existingItemIndex ? { ...item, qty: item.qty + quantity } : item
            );
          } else {
            const newItem: CartItem = {
              id: product.id,
              name: product.product_name,
              price: toNum(product.final_price, 0),
              qty: quantity,
              unit: product.unit,
            };
            updatedCart = [...cartItems, newItem];
          }

          setCartItems(updatedCart);
          saveCartToLocalStorage(updatedCart);
        }

        router.push('/cart');
      } else {
        const message = result?.message || result?.error || `Failed to add item (status ${response.status})`;
        console.error('Failed to add item to cart:', message, result);
        alert(message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.qty, 0);
  };

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  function getBestImage(p: ProductDetail): string {
    if (p.image_url && p.image_url.trim() !== '') return p.image_url;
    const slug = slugify(p.product_name);
    return `/images/products/${slug}.webp`;
  }

  const categoryFallback: Record<string, string> = {
    'Vegetables': '/images/vegetables.png',
    'Fruits': '/images/fruits.png',
    'Leafy Greens': '/images/leafy-greens.png',
    'Root Vegetables': '/images/root-vegetables.png',
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <Navbar cartItemCount={getCartItemCount()} />
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h2>Loading Product Details...</h2>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-screen">
        <Navbar cartItemCount={getCartItemCount()} />
        <div className="error-content">
          <h2>Product Not Found</h2>
          <p>{error || 'The product you are looking for does not exist.'}</p>
          <Link href="/home" className="back-button">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const price = toNum(product.final_price, 0); // guaranteed number
  const total = (price * quantity).toFixed(2);

  return (
    <div className="product-detail-page">
      <Navbar cartItemCount={getCartItemCount()} />

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <Link href="/home" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">›</span>
          <Link href="/products" className="breadcrumb-link">Products</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{product.product_name}</span>
        </div>
      </div>

      <div className="product-detail-container">
        {/* Back Button */}
        <button onClick={() => router.back()} className="back-btn">
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Product Details */}
        <div className="product-detail-grid">
          {/* Product Image */}
          <div className="product-image-section">
            <div className="product-image-large">
              {/* Real image with graceful fallbacks */}
              {imgSrc ? (
                <div className="image-wrap">
                  <Image
                    src={imgSrc}
                    alt={product.product_name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjQ4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCBmaWxsPSIjZWVlIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+"
                    onError={() => {
                      const fb = categoryFallback[product.category_name] || '/images/all-products.png';
                      if (imgSrc !== fb) setImgSrc(fb);
                    }}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="no-image-fallback">
                  <ImageOff size={28} />
                  <span>No image</span>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <Truck size={16} />
                <span>Free Delivery</span>
              </div>
              <div className="trust-badge">
                <Shield size={16} />
                <span>Quality Assured</span>
              </div>
              <div className="trust-badge">
                <Leaf size={16} />
                <span>Farm Fresh</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <div className="product-header">
              <div className="product-category">{product.category_name}</div>
              <h1 className="product-title">{product.product_name}</h1>

              {/* Rating */}
              <div className="product-rating">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className={i < averageRating ? 'star-filled' : 'star-empty'} />
                  ))}
                </div>
                <span className="rating-text">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="product-price">
              <span className="price-value">Rs. {price.toFixed(2)}</span>
              <span className="price-unit">per {product.unit}</span>
            </div>

            {/* Stock Info */}
            <div className="stock-info">
              <div className="stock-item">
                <span className="stock-label">Available Stock:</span>
                <span className="stock-value">{product.total_supplied} {product.unit}</span>
              </div>
              <div className="stock-item">
                <span className="stock-label">Daily Limit:</span>
                <span className="stock-value">{product.daily_limit} {product.unit}</span>
              </div>
              <div className="stock-item">
                <span className="stock-label">Suppliers:</span>
                <span className="stock-value">
                  <Users size={16} />
                  {product.supplier_count} suppliers
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="quantity-section">
              <label className="quantity-label">Quantity ({product.unit})</label>
              <div className="quantity-controls">
                <button
                  onClick={() => updateQuantity(-1)}
                  className="quantity-btn"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="quantity-input"
                  min={1}
                  max={product.daily_limit}
                />
                <button
                  onClick={() => updateQuantity(1)}
                  className="quantity-btn"
                  disabled={quantity >= product.daily_limit}
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className="quantity-total">
                Total: Rs. {total}
              </span>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={addToCart}
              disabled={addingToCart}
              className="add-to-cart-main"
            >
              {addingToCart ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Adding to Cart...
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  Add to Cart
                </>
              )}
            </button>

            {/* Product Description */}
            <div className="product-description">
              <h3>Product Details</h3>
              <p>
                Fresh {product.product_name.toLowerCase()} sourced directly from local farmers in {product.province_name}.
                Our {product.category_name.toLowerCase()} are carefully selected for quality and freshness,
                ensuring you get the best produce delivered to your doorstep.
              </p>
              <ul>
                <li>Farm fresh and organic</li>
                <li>Carefully selected for quality</li>
                <li>Direct from local farmers</li>
                <li>Delivered fresh to your door</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2 className="reviews-title">Customer Reviews</h2>
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-user">{review.user}</div>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? 'star-filled' : 'star-empty'}
                      />
                    ))}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                <div className="review-date">{new Date(review.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-detail-page { min-height: 100vh; background: #fafafa; }
        .loading-screen, .error-screen { min-height: 100vh; display: flex; flex-direction: column; }
        .loading-content, .error-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem; }
        .loading-spinner { width: 60px; height: 60px; border: 4px solid #e5e7eb; border-top: 4px solid #15803d; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 2rem; }
        .back-button { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #15803d; color: white; text-decoration: none; border-radius: 8px; transition: all 0.3s; }
        .back-button:hover { background: #166534; }
        .breadcrumb { background: white; border-bottom: 1px solid #e5e7eb; }
        .breadcrumb-container { max-width: 1200px; margin: 0 auto; padding: 1rem 2rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
        .breadcrumb-link { color: #6b7280; text-decoration: none; transition: color 0.3s; }
        .breadcrumb-link:hover { color: #15803d; }
        .breadcrumb-separator { color: #d1d5db; }
        .breadcrumb-current { color: #15803d; font-weight: 500; }

        .product-detail-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .back-btn { display: inline-flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #6b7280; font-size: 0.9rem; cursor: pointer; margin-bottom: 2rem; padding: 0.5rem; border-radius: 6px; transition: all 0.3s; }
        .back-btn:hover { background: #f3f4f6; color: #15803d; }

        .product-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-bottom: 4rem; }
        .product-image-section { display: flex; flex-direction: column; gap: 1.5rem; }
        .product-image-large { position: relative; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 20px; padding: 0; min-height: 420px; overflow: hidden; }
        .image-wrap { position: absolute; inset: 0; }
        .no-image-fallback { min-height: 420px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.5rem; color: #6b7280; }
        .trust-badges { display: flex; gap: 1rem; justify-content: center; }
        .trust-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); color: #15803d; font-size: 0.8rem; font-weight: 500; }

        .product-info-section { display: flex; flex-direction: column; gap: 2rem; }
        .product-header { display: flex; flex-direction: column; gap: 1rem; }
        .product-category { color: #6b7280; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .product-title { font-size: 2.5rem; font-weight: bold; color: #1f2937; line-height: 1.2; }
        .product-rating { display: flex; align-items: center; gap: 1rem; }
        .stars { display: flex; gap: 2px; }
        .star-filled { color: #fbbf24; }
        .star-empty { color: #e5e7eb; }
        .rating-text { color: #6b7280; font-size: 0.9rem; }

        .product-price { display: flex; align-items: baseline; gap: 1rem; padding: 1.5rem 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; }
        .price-value { font-size: 2.5rem; font-weight: bold; color: #15803d; }
        .price-unit { color: #6b7280; font-size: 1.1rem; }

        .stock-info { display: flex; flex-direction: column; gap: 0.75rem; padding: 1.5rem; background: #f8fafc; border-radius: 12px; }
        .stock-item { display: flex; justify-content: space-between; align-items: center; }
        .stock-label { color: #6b7280; font-weight: 500; }
        .stock-value { color: #1f2937; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; }

        .quantity-section { display: flex; flex-direction: column; gap: 1rem; }
        .quantity-label { font-weight: 600; color: #1f2937; }
        .quantity-controls { display: flex; align-items: center; gap: 1rem; }
        .quantity-btn { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border: 2px solid #e5e7eb; background: white; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
        .quantity-btn:hover:not(:disabled) { border-color: #15803d; color: #15803d; }
        .quantity-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .quantity-input { width: 80px; height: 40px; text-align: center; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 1rem; font-weight: 600; outline: none; }
        .quantity-input:focus { border-color: #15803d; }
        .quantity-total { color: #15803d; font-weight: 600; font-size: 1.1rem; }

        .add-to-cart-main { display: flex; align-items: center; justify-content: center; gap: 0.75rem; width: 100%; padding: 1rem 2rem; background: linear-gradient(135deg, #15803d, #059669); color: white; border: none; border-radius: 12px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .add-to-cart-main:hover:not(:disabled) { background: linear-gradient(135deg, #166534, #047857); transform: translateY(-2px); box-shadow: 0 4px 15px rgba(21,128,61,0.3); }
        .add-to-cart-main:disabled { background: #d1d5db; cursor: not-allowed; transform: none; box-shadow: none; }
        .loading-spinner-small { width: 20px; height: 20px; border: 2px solid #ffffff60; border-top: 2px solid #ffffff; border-radius: 50%; animation: spin 1s linear infinite; }

        .product-description { display: flex; flex-direction: column; gap: 1rem; padding: 2rem; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .product-description h3 { font-size: 1.2rem; font-weight: 600; color: #1f2937; }
        .product-description p { color: #6b7280; line-height: 1.6; }
        .product-description ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
        .product-description li { display: flex; align-items: center; gap: 0.5rem; color: #6b7280; }
        .product-description li::before { content: '✓'; color: #15803d; font-weight: bold; }

        .reviews-section { padding: 2rem 0; border-top: 1px solid #e5e7eb; }
        .reviews-title { font-size: 2rem; font-weight: bold; color: #1f2937; margin-bottom: 2rem; }
        .reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .review-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 1rem; }
        .review-header { display: flex; justify-content: space-between; align-items: center; }
        .review-user { font-weight: 600; color: #1f2937; }
        .review-rating { display: flex; gap: 1px; }
        .review-comment { color: #6b7280; line-height: 1.5; margin: 0; }
        .review-date { color: #9ca3af; font-size: 0.8rem; }

        @media (max-width: 768px) {
          .product-detail-container { padding: 1rem; }
          .product-detail-grid { grid-template-columns: 1fr; gap: 2rem; }
          .product-title { font-size: 2rem; }
          .price-value { font-size: 2rem; }
          .product-image-large { min-height: 320px; }
          .trust-badges { flex-direction: column; align-items: center; }
          .trust-badge { width: 100%; justify-content: center; }
          .quantity-controls { justify-content: center; }
          .reviews-grid { grid-template-columns: 1fr; }
          .breadcrumb-container { padding: 1rem; }
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
