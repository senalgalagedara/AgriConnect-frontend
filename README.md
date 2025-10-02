# AgriConnect Frontend

A modern agricultural marketplace platform built with Next.js, TypeScript, and Tailwind CSS. AgriConnect connects farmers, buyers, and suppliers in a seamless digital ecosystem for agricultural products and services.

## 🚀 Features

### Core Functionality
- **User Authentication** - Secure login and signup system
- **Product Marketplace** - Browse and purchase agricultural products
- **Inventory Management** - Track and manage product inventory
- **Order & Delivery Management** - Complete order processing and delivery tracking
- **Payment Processing** - Secure payment handling
- **User Dashboard** - Comprehensive user management interface

### Additional Features
- **Feedback System** - Interactive feedback modal with star ratings
- **Responsive Design** - Mobile-first responsive interface
- **Admin Panel** - Administrative controls for platform management
- **Cart System** - Shopping cart functionality
- **Invoice Generation** - Automated invoice creation

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Lucide React (icons)
- **Code Quality**: Prettier for code formatting
- **Package Manager**: npm

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── home/              # Home page
│   ├── product/           # Product pages
│   └── feedback/          # Feedback system
├── components/            # Reusable React components
│   ├── Dashboard.tsx
│   ├── FeedbackContext.tsx
│   ├── navbar.tsx
│   ├── sidebar.tsx
│   └── ...
├── interface/            # TypeScript interfaces
│   ├── Feedback.ts
│   ├── User.ts
│   └── ...
└── styles/              # Global styles
    └── globals.css
```

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/senalgalagedara/AgriConnect-frontend.git
   cd AgriConnect-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## 🎨 Features Overview

### Feedback System
- Interactive modal with star ratings (1-5 stars)
- Text feedback collection
- Success confirmation screen
- Reusable across the entire application
- Clean separation of concerns with TypeScript interfaces

### User Management
- Comprehensive user profiles
- Role-based access control
- Admin and user dashboards

### E-commerce Features
- Product catalog browsing
- Shopping cart functionality
- Secure checkout process
- Order tracking and management

## 🔧 Development

### Code Style
This project uses Prettier for code formatting. The configuration is defined in `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### TypeScript
The project is fully typed with TypeScript. Interface definitions are organized in the `src/interface/` directory for better maintainability.

### Styling
- Tailwind CSS v4 for utility-first styling
- Responsive design principles
- Component-based styling approach

## 📱 Responsive Design

The application is built with mobile-first responsive design principles:
- Mobile (320px+)
- Tablet (768px+)
- Desktop (1024px+)
- Large Desktop (1280px+)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 📧 Contact

For questions or support, please contact the development team.

---

**Built with ❤️ for the agricultural community**