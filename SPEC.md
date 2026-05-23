# Meubles Polynésie - E-commerce Platform Specification

## 1. Project Overview

**Project Name:** Meubles Polynésie
**Type:** Full-stack E-commerce Web Application
**Core Functionality:** Online furniture store for French Polynesia with shopping cart, Stripe payments, user dashboard, and admin management panel.
**Target Users:** Residents of French Polynesia (Tahiti and outer islands) looking to purchase furniture online.

## 2. Technology Stack

- **Framework:** Next.js 15 with TypeScript
- **Styling:** Tailwind CSS v4
- **Fonts:** Poppins (headings/buttons), Inter (body text)
- **UI Components:** Radix UI + custom components
- **Database:** Supabase (nubase) - PostgreSQL
- **Authentication:** Supabase Auth
- **Payments:** Stripe
- **State Management:** React Context + localStorage for cart

## 3. Design System

### Color Palette
- **Primary:** #2D5A4A (Forest Green)
- **Primary Light:** #3D7A6A
- **Primary Dark:** #1D4A3A
- **Accent:** #D4A574 (Warm Sand/Terracotta)
- **Accent Light:** #E4B584
- **Background:** #FAFAF8 (Warm White)
- **Surface:** #FFFFFF
- **Text Primary:** #1A1A1A
- **Text Secondary:** #6B6B6B
- **Success:** #22C55E
- **Warning:** #F59E0B
- **Error:** #EF4444

### Typography
- **Headings:** Poppins, weights 600-700
- **Body Text:** Inter, weights 400-500
- **Scale:**
  - H1: 48px / 56px line-height
  - H2: 36px / 44px
  - H3: 24px / 32px
  - Body: 16px / 24px
  - Small: 14px / 20px
  - Caption: 12px / 16px

### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px

## 4. Database Schema

### Tables

#### users
- id (UUID, PK)
- email (TEXT, unique)
- password_hash (TEXT)
- full_name (TEXT)
- phone (TEXT)
- role (ENUM: 'customer', 'admin')
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### addresses
- id (UUID, PK)
- user_id (UUID, FK -> users)
- label (TEXT) - e.g., "Maison", "Travail"
- street (TEXT)
- city (TEXT) - e.g., "Papeete", "Bora Bora"
- island (TEXT) - e.g., "Tahiti", "Moorea", "Iles Sous-le-Vent"
- postal_code (TEXT)
- is_default (BOOLEAN)
- created_at (TIMESTAMP)

#### categories
- id (UUID, PK)
- name (TEXT)
- slug (TEXT, unique)
- description (TEXT)
- image_url (TEXT)
- created_at (TIMESTAMP)

#### products
- id (UUID, PK)
- category_id (UUID, FK -> categories)
- name (TEXT)
- slug (TEXT, unique)
- description (TEXT)
- price_xpf (INTEGER) - stored in XPF cents
- compare_at_price_xpf (INTEGER, nullable)
- images (TEXT[]) - array of image URLs
- stock_quantity (INTEGER)
- is_active (BOOLEAN)
- is_featured (BOOLEAN)
- dimensions (JSONB) - {width, height, depth, unit}
- weight_kg (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### orders
- id (UUID, PK)
- user_id (UUID, FK -> users)
- status (ENUM: 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
- subtotal_xpf (INTEGER)
- shipping_xpf (INTEGER)
- total_xpf (INTEGER)
- shipping_address (JSONB)
- stripe_payment_intent_id (TEXT, nullable)
- stripe_session_id (TEXT, nullable)
- notes (TEXT, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### order_items
- id (UUID, PK)
- order_id (UUID, FK -> orders)
- product_id (UUID, FK -> products)
- quantity (INTEGER)
- unit_price_xpf (INTEGER)
- total_price_xpf (INTEGER)

## 5. Page Structure

### Public Pages

#### Homepage (/)
- Hero section with featured banner
- Featured products carousel
- Category showcase grid
- Trust badges (delivery info, secure payment)
- Newsletter signup

#### Products Page (/products)
- Filter sidebar (category, price range)
- Sort options (newest, price low-high, price high-low)
- Product grid with pagination
- Quick view modal

#### Product Detail (/products/[slug])
- Image gallery with zoom
- Product info (name, price, description)
- Dimensions and weight
- Stock status
- Add to cart button
- Related products

#### Cart (/cart)
- Cart items list with images
- Quantity adjusters
- Remove item buttons
- Subtotal calculation
- Shipping estimate by zone
- Checkout button

#### Checkout (/checkout)
- Shipping address form
- Delivery zone selection (Tahiti / Outer Islands)
- Order summary
- Stripe payment element
- Terms acceptance

#### Order Confirmation (/checkout/success)
- Order number
- Order details summary
- Estimated delivery
- Continue shopping button

### User Pages

#### Login (/login)
- Email/password form
- Remember me option
- Forgot password link

#### Register (/register)
- Full name
- Email
- Phone number
- Password confirmation
- Terms acceptance

#### User Dashboard (/dashboard)
- Welcome message
- Quick stats (total orders, pending orders)
- Recent orders list
- Account settings link

#### My Orders (/dashboard/orders)
- Order history table
- Order status badges
- Order detail view

#### Profile (/dashboard/profile)
- Personal information form
- Change password
- Saved addresses

#### Addresses (/dashboard/addresses)
- Address list
- Add/edit address modal
- Set default address

### Admin Pages

#### Admin Dashboard (/admin)
- Sales overview cards
- Revenue chart (last 30 days)
- Recent orders list
- Low stock alerts

#### Products Management (/admin/products)
- Products table with search
- Add new product button
- Edit/delete actions
- Bulk actions

#### Add/Edit Product (/admin/products/new, /admin/products/[id]/edit)
- Product form (name, category, price, description)
- Image upload
- Stock management
- Dimensions input

#### Categories Management (/admin/categories)
- Categories list
- Add/edit/delete categories

#### Orders Management (/admin/orders)
- Orders table with filters
- Status update dropdown
- Order detail modal

#### Customers (/admin/customers)
- Customers table
- Search by name/email
- View customer orders

## 6. Component Inventory

### Navigation
- **Header:** Logo, navigation links, cart icon with badge, user menu
- **Mobile Menu:** Slide-out drawer with all navigation
- **Footer:** Company info, quick links, social links, copyright

### Buttons
- **Primary:** Green background, white text, hover darkens
- **Secondary:** White background, green border, hover fills
- **Accent:** Sand/terracotta background for CTAs
- **Ghost:** Transparent, text only, hover shows background
- **Sizes:** sm (32px), md (40px), lg (48px)

### Cards
- **Product Card:** Image, title, price, add to cart button
- **Order Card:** Order number, date, status badge, total
- **Stat Card:** Icon, label, value, trend indicator

### Forms
- **Input:** Label, input field, helper text, error state
- **Select:** Dropdown with search for categories
- **Textarea:** For descriptions
- **Checkbox/Radio:** For filters and options
- **File Upload:** Drag and drop zone for images

### Feedback
- **Toast:** Success (green), error (red), info (blue)
- **Badge:** Status indicators (pending, confirmed, etc.)
- **Spinner:** Loading states
- **Empty State:** Illustration with message

### Tables
- **Data Table:** Sortable headers, pagination, row actions
- **Responsive:** Horizontal scroll on mobile

## 7. Shipping Zones

### Tahiti
- Delivery fee: 2,000 XPF
- Estimated delivery: 3-5 business days

### Moorea
- Delivery fee: 4,000 XPF
- Estimated delivery: 5-7 business days

### Outer Islands
- Delivery fee: 6,000 XPF
- Estimated delivery: 10-14 business days

## 8. Features Detail

### Shopping Cart
- Add/remove products
- Update quantities
- Persist in localStorage
- Calculate shipping by zone
- Show item count in header

### User Authentication
- Email/password registration and login
- Session persistence
- Protected routes for dashboard
- Admin role verification

### Stripe Integration
- Stripe Checkout Session creation
- Payment success/failure handling
- Webhook for order confirmation
- XPF currency support

### Admin Features
- Full CRUD for products
- Order status management
- Customer management
- Sales analytics

## 9. Responsive Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

## 10. API Routes

### Public
- GET /api/products - List products with filters
- GET /api/products/[slug] - Get product detail
- GET /api/categories - List categories

### Auth Required
- GET /api/user/orders - User's orders
- GET /api/user/addresses - User's addresses
- POST /api/checkout - Create Stripe session

### Admin Only
- POST /api/admin/products - Create product
- PUT /api/admin/products/[id] - Update product
- DELETE /api/admin/products/[id] - Delete product
- PUT /api/admin/orders/[id]/status - Update order status
- GET /api/admin/stats - Dashboard statistics
