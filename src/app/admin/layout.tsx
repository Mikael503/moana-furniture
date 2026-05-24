'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, ChevronLeft, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAdmin, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-muted rounded-full" />
          <p className="mt-4 text-muted-foreground">Vérification des droits...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const navItems = [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Produits', icon: Package },
    { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
    { href: '/admin/categories', label: 'Catégories', icon: Tag },
    { href: '/admin/customers', label: 'Clients', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header mobile + desktop */}
      <header className="bg-primary text-primary-foreground border-b sticky top-0 z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Burger mobile */}
            <button
              className="md:hidden p-1"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" className="flex items-center gap-2 text-sm hover:opacity-80">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Retour au site</span>
            </Link>
            <span className="text-primary-foreground/40 hidden sm:inline">|</span>
            <span className="font-semibold">Administration</span>
          </div>
          <div className="text-xs text-primary-foreground/80 hidden sm:block truncate max-w-48">
            {user.email}
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-14 z-40 md:z-auto
          h-[calc(100vh-56px)] w-64 bg-card border-r p-4
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}