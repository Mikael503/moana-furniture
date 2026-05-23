'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, ChevronLeft } from 'lucide-react';

// NOTE : La vérification principale est faite côté serveur dans middleware.ts.
// Ce layout ne fait qu'un rendu conditionnel de fallback (si le hook côté client
// détecte l'absence de droits avant que la session soit chargée).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAdmin, isLoading } = useAuth();

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

  // Fallback — le middleware a déjà bloqué les non-admins
  if (!user || !isAdmin) return (
  <div className="min-h-screen flex items-center justify-center">
    <p className="text-muted-foreground">Accès refusé.</p>
  </div>
);

  const navItems = [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Produits', icon: Package },
    { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
    { href: '/admin/categories', label: 'Catégories', icon: Tag },
    { href: '/admin/customers', label: 'Clients', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm hover:opacity-80">
              <ChevronLeft className="h-4 w-4" />
              Retour au site
            </Link>
            <span className="text-primary-foreground/40">|</span>
            <span className="font-semibold">Administration</span>
          </div>
          <div className="text-sm">
            Connecté en tant que <span className="font-medium">{user.email}</span>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-card border-r min-h-[calc(100vh-56px)] p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
