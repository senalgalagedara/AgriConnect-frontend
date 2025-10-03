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

## 🔐 Session-Based Authentication (Frontend Integration)

The frontend now supports a cookie (session) based authentication flow. Your backend must expose three endpoints and manage an httpOnly session cookie (e.g. `sid`).

### Required Backend Endpoints
| Method | Path | Purpose | Response (200) |
|--------|------|---------|----------------|
| POST | `/auth/login` | Validate credentials, issue cookie | `{ "user": { id, email, role?, name? } }` |
| POST | `/auth/logout` | Invalidate session & clear cookie | `{ "success": true }` |
| GET | `/auth/session` | Return current session user | `{ "user": { ... } }` or `{ "user": null }` |

Cookie should be set with: `HttpOnly; Secure (prod); SameSite=Lax; Path=/`.

### Frontend Components
| File | Description |
|------|-------------|
| `src/context/AuthContext.tsx` | Loads session, stores `user`, exposes `login`, `logout`, `refresh`. |
| `src/components/RequireAuth.tsx` | Wrapper that blocks access unless a session user exists. |
| `middleware.ts` | (Heuristic) Redirects unauthenticated users from protected routes to login. |
| `src/components/FeedbackContext.tsx` | Prevents submitting feedback if not logged in. |

### Protecting a Page
Wrap page content:
```tsx
import { RequireAuth } from '@/components/RequireAuth';
export default function OrdersPage() {
   return (
      <RequireAuth>
         <div>Your orders here</div>
      </RequireAuth>
   );
}
```

### Login Flow
`AuthContext.login(email, password)` sends POST `/auth/login` and on success stores the returned user. Redirect logic in the login page uses a `next` query param to send users back to their intended destination.

### Middleware Protection
`middleware.ts` checks for a session cookie (`sid`, `sessionid`, or `auth`) on selected route prefixes (checkout, cart, dashboard, orders, payments). Adjust `PROTECTED_PREFIXES` and cookie names to match backend reality.

### Feedback Restriction
If no `user`, the feedback modal displays an error instead of sending the POST.

### Backend Implementation Notes
1. After validating credentials in `/auth/login`, generate a session id and `Set-Cookie: sid=<random>; HttpOnly; Path=/; SameSite=Lax`.
2. `/auth/session` reads the cookie, looks up session, returns `{ user }` or `{ user: null }`.
3. `/auth/logout` removes/invalidate session and sets cookie expiry in the past.
4. Ensure CORS (if cross-origin) allows `credentials` and that frontend requests (if needed) include `credentials: 'include'`.

### Testing Checklist
```bash
# 1. Unauthenticated
curl -i https://api.example.com/auth/session

# 2. Login (capture Set-Cookie header)
curl -i -X POST https://api.example.com/auth/login \
   -H 'Content-Type: application/json' \
   -d '{"email":"user@example.com","password":"secret"}'

# 3. Use returned cookie to confirm session
curl -i -H 'Cookie: sid=...'
   https://api.example.com/auth/session

# 4. Logout
curl -i -X POST -H 'Cookie: sid=...' https://api.example.com/auth/logout
```

### Common Pitfalls
| Issue | Cause | Fix |
|-------|-------|-----|
| Session lost after redirect | Missing `SameSite` or domain mismatch | Add `SameSite=Lax` and consistent domain | 
| Always unauthenticated | Cookie not sent cross-origin | Configure CORS + `credentials: 'include'` | 
| Login works in Postman but not browser | Using non-httpOnly in dev or blocked third-party cookie | Ensure first-party domain & httpOnly cookie |

### Next Steps
- Add role-based guards (e.g. admin routes) by extending `AuthUser.role`.
- Implement silent session refresh or expiry warnings.
- Add optimistic UI for user menu based on `user` object.

### Recent Enhancements (Session Auth v2)
The session authentication layer has been extended with:

1. `apiRequest` now automatically:
    - Sends cookies (`credentials: 'include'`) for cross-origin session persistence.
    - Parses error bodies and throws a typed `ApiError` exposing `status` & `details`.
    - Supports optional `query`, `rawBody`, custom `headers`, and abort `signal`.

2. `AuthContext` additions:
    - `isAuthenticated` boolean for quick checks.
    - `hasRole(...roles)` helper (case-insensitive) for role-based gating.
    - Automatic session refresh every 10 minutes and on window focus.
    - Graceful handling of 401 responses (clears stale user state).

3. `RoleGuard` component (`src/components/RoleGuard.tsx`):
```tsx
import RoleGuard from '@/components/RoleGuard';

export default function AdminOnly() {
   return (
      <RoleGuard allow={["admin"]}>
         <div>Secret admin dashboard</div>
      </RoleGuard>
   );
}
```

4. Example combining `RequireAuth` and `RoleGuard`:
```tsx
import { RequireAuth } from '@/components/RequireAuth';
import RoleGuard from '@/components/RoleGuard';

export default function Page() {
   return (
      <RequireAuth>
         <RoleGuard allow={["admin", "manager"]}>
            <div>Visible only to authenticated admins or managers.</div>
         </RoleGuard>
      </RequireAuth>
   );
}
```

5. Handling ApiError in UI:
```tsx
import { apiRequest, ApiError } from '@/lib/api';

try {
   const data = await apiRequest('/secure');
} catch (e) {
   if (e instanceof ApiError) {
      console.error('API failed', e.status, e.message, e.details);
   }
}
```

6. Customizing refresh interval:
Adjust interval logic inside `AuthContext` (default 10 minutes). For a shorter interval, change `10 * 60 * 1000`.

7. Adding new protected route prefix:
Update `PROTECTED_PREFIXES` in `middleware.ts` to include the path segment.

These enhancements make the authentication layer more resilient, ergonomic, and ready for role-based access expansion.

### API Path Prefix & 404 Troubleshooting

If your backend mounts routes under a prefix (e.g. `/api` or `/api/v1`), set:
```
NEXT_PUBLIC_API_PATH_PREFIX=/api/v1
```
The client automatically prepends this to every request. All frontend calls should continue to use paths like `/auth/login` (without the prefix).

When a request returns 404 the client now logs:
```
[apiRequest] 404 Not Found { url, method }
```
Checklist:
1. Confirm `NEXT_PUBLIC_API_BASE_URL` points to the correct host/port.
2. If backend uses a prefix, set `NEXT_PUBLIC_API_PATH_PREFIX` (no trailing slash).
3. Ensure you include a leading slash in each `apiRequest` call path (`/auth/login`).
4. Restart `npm run dev` after adding or changing env variables.
5. Curl the final URL shown in the console to verify server route exists.

Example `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_API_PATH_PREFIX=/api
```
