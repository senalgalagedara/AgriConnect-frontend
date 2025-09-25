"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <div className="home-container">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">
            <h1>🌾 AgriConnect</h1>
          </div>
          <nav className="nav">
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#about" className="nav-link">About</Link>
            <Link href="/inventory" className="nav-link primary-btn">Dashboard</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Connect Farmers, Optimize Agriculture
            </h1>
            <p className="hero-subtitle">
              Streamline inventory management, connect suppliers with buyers, 
              and build a sustainable agricultural network across provinces.
            </p>
            <div className="hero-actions">
              <Link href="/inventory" className="btn primary">
                Get Started
              </Link>
              <button className="btn secondary">
                Learn More
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="agriculture-graphic">
              🚜🌱📊
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Inventory Management</h3>
              <p>Track products, stock levels, and pricing across multiple provinces with real-time updates.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Supplier Network</h3>
              <p>Connect with trusted suppliers and manage relationships efficiently.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Analytics & Reports</h3>
              <p>Get insights into stock trends, supplier performance, and market demands.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌍</div>
              <h3>Province Coverage</h3>
              <p>Manage agricultural operations across different provinces from one central platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Transform Your Agricultural Business?</h2>
          <p>Join thousands of farmers and suppliers already using AgriConnect</p>
          <Link href="/inventory" className="btn primary large">
            Access Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>🌾 AgriConnect</h3>
              <p>Connecting agriculture, empowering communities</p>
            </div>
            <div className="footer-section">
              <h4>Platform</h4>
              <Link href="/inventory">Dashboard</Link>
              <Link href="#features">Features</Link>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <Link href="#about">About</Link>
              <Link href="#contact">Contact</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 AgriConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .home-container {
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Header */
        .header {
          background: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 20px;
        }

        .logo h1 {
          color: #15803d;
          margin: 0;
          font-size: 1.8rem;
        }

        .nav {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          text-decoration: none;
          color: #374151;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-link:hover {
          color: #15803d;
        }

        .primary-btn {
          background: #15803d;
          color: white !important;
          padding: 0.5rem 1rem;
          border-radius: 6px;
        }

        .primary-btn:hover {
          background: #166534;
          color: white !important;
        }

        /* Hero */
        .hero {
          background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
          padding: 4rem 0;
        }

        .hero .container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 1rem 0;
          line-height: 1.2;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: #6b7280;
          margin: 0 0 2rem 0;
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-block;
        }

        .btn.primary {
          background: #15803d;
          color: white;
        }

        .btn.primary:hover {
          background: #166534;
        }

        .btn.secondary {
          background: transparent;
          color: #15803d;
          border: 2px solid #15803d;
        }

        .btn.secondary:hover {
          background: #15803d;
          color: white;
        }

        .btn.large {
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }

        .hero-image {
          text-align: center;
        }

        .agriculture-graphic {
          font-size: 8rem;
          opacity: 0.8;
        }

        /* Features */
        .features {
          padding: 5rem 0;
          background: white;
        }

        .section-title {
          text-align: center;
          font-size: 2.5rem;
          color: #1f2937;
          margin-bottom: 3rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: #f9fafb;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
          border: 1px solid #e5e7eb;
          transition: transform 0.2s;
        }

        .feature-card:hover {
          transform: translateY(-4px);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          color: #1f2937;
          margin: 0 0 1rem 0;
          font-size: 1.25rem;
        }

        .feature-card p {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        /* CTA */
        .cta {
          background: linear-gradient(135deg, #15803d 0%, #166534 100%);
          color: white;
          padding: 4rem 0;
          text-align: center;
        }

        .cta h2 {
          font-size: 2.5rem;
          margin: 0 0 1rem 0;
        }

        .cta p {
          font-size: 1.2rem;
          margin: 0 0 2rem 0;
          opacity: 0.9;
        }

        .cta .btn.primary {
          background: white;
          color: #15803d;
        }

        .cta .btn.primary:hover {
          background: #f3f4f6;
        }

        /* Footer */
        .footer {
          background: #1f2937;
          color: white;
          padding: 3rem 0 1rem 0;
        }

        .footer-content {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-section h3 {
          color: #15803d;
          margin: 0 0 1rem 0;
        }

        .footer-section h4 {
          margin: 0 0 1rem 0;
        }

        .footer-section p {
          color: #9ca3af;
          margin: 0;
        }

        .footer-section a {
          color: #9ca3af;
          text-decoration: none;
          display: block;
          margin-bottom: 0.5rem;
          transition: color 0.2s;
        }

        .footer-section a:hover {
          color: #15803d;
        }

        .footer-bottom {
          border-top: 1px solid #374151;
          padding-top: 1rem;
          text-align: center;
          color: #9ca3af;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero .container {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-title {
            font-size: 2rem;
          }

          .nav {
            gap: 1rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .footer-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .agriculture-graphic {
            font-size: 4rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .cta h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}