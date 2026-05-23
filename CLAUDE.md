# Meubles Polynésie - E-commerce Platform

## Overview

Full-stack e-commerce web application for selling furniture in French Polynesia. Features include product catalog, shopping cart, Stripe payments, user dashboard, and admin management panel.

## Tech Stack

- **Framework**: Next.js 15 with TypeScript and App Router
- **Database**: Supabase (PostgreSQL via nubase)
- **Authentication**: Supabase Auth
- **Payments**: Stripe Checkout
- **UI Components**: shadcn/ui + Radix UI + Tailwind CSS v4
- **Typography**: Poppins (headings), Inter (body)
- **Charts**: Recharts
- **State Management**: React Context (Auth, Cart)

## Directory Structure

```
src/
├── app/
│   ├── admin/              # Admin dashboard pages
│   │   ├── layout.tsx
│   │   ├── page.tsx        # Dashboard overview
│   │   ├── products/       # Products management
│   │   ├── orders/         # Orders management
│   │   ├── categories/      # Categories management
│   │   └── customers/      # Customers management
│   ├── api/
│   │   └── checkout/       # Stripe checkout API
│   ├── cart/               # Shopping cart page
│   ├── checkout/            # Checkout flow
│   │   └── success/        # Order confirmation
│   ├── dashboard/           # User dashboard
│   │   ├── orders/         # User orders
│   │   ├── profile/        # User profile
│   │   └── addresses/      # User addresses
│   ├── login/              # Authentication
│   ├── products/           # Product catalog
│   │   └── [slug]/        # Product detail
│   ├── register/           # Registration
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/
│   ├── layout/             # Header, Footer, StoreLayout
│   └── ui/                # shadcn/ui components
├── hooks/
│   ├── useAuth.tsx         # Authentication context
│   └── useCart.tsx         # Cart context
└── integrations/
    └── supabase/           # Supabase client
```

## Core Systems

### Database Schema (nubase/Supabase)
- **users/profiles**: User information and roles
- **categories**: Product categories
- **products**: Furniture products with pricing, stock, images
- **orders**: Customer orders with status tracking
- **order_items**: Order line items
- **addresses**: User delivery addresses
- **user_roles**: Role-based access (customer/admin)

### Authentication
- Status: Implemented
- Email/password signup and login
- Role-based access control (customer vs admin)
- Protected routes for dashboard and admin

### Shopping Cart
- Status: Implemented
- Client-side state with localStorage persistence
- Add/remove/update quantities
- Shipping zone calculation (Tahiti, Moorea, Outer Islands)

### Stripe Payment Integration
- Status: Implemented
- Stripe Checkout Session creation via API route
- XPF currency support
- Webhook-ready for order confirmation

### User Dashboard
- Status: Implemented
- Order history and tracking
- Profile management
- Saved addresses management

### Admin Dashboard
- Status: Implemented
- Dashboard with sales overview and charts
- Products CRUD management
- Orders status management
- Categories management
- Customers list view

## Design System

### Colors
- Primary: #2D5A4A (Forest Green)
- Accent: #D4A574 (Warm Sand)
- Background: #FAFAF8
- Success/Warning/Error: Standard semantic colors

### Typography
- Headings: Poppins (600-700 weight)
- Body: Inter (400-500 weight)

### Shipping Zones
- Tahiti: 2,000 XPF (3-5 days)
- Moorea: 4,000 XPF (5-7 days)
- Outer Islands: 6,000 XPF (10-14 days)

## Current State

### Completed Features
- [x] Database schema with RLS policies
- [x] Authentication system (signup/login/logout)
- [x] User profile management
- [x] Product catalog with categories
- [x] Product detail pages with gallery
- [x] Shopping cart functionality
- [x] Checkout flow with shipping selection
- [x] Stripe payment integration (API ready)
- [x] Order confirmation page
- [x] User dashboard with order history
- [x] Admin dashboard with stats
- [x] Admin products management
- [x] Admin orders management
- [x] Admin categories management
- [x] Admin customers view
- [x] Responsive design
- [x] French localization

### Configuration Required
- [ ] Stripe API keys in environment variables
- [ ] Admin user promotion in database

## Maintenance Log
- 2026-05-23: Initial project setup with complete e-commerce platform
- 2026-05-23: Database schema with 7 tables and RLS policies
- 2026-05-23: Added 12 sample products and 7 categories
- 2026-05-23: Implemented authentication, cart, checkout, dashboards
