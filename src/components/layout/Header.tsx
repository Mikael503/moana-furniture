'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, ChevronDown, Menu, X, Search } from 'lucide-react';

const CATEGORIES = [
  { label: 'Salon', href: '/products?category=salon' },
  { label: 'Chambre', href: '/products?category=chambre' },
  { label: 'Salle à manger', href: '/products?category=salle-a-manger' },
  { label: 'Bureau', href: '/products?category=bureau' },
  { label: 'Jardin', href: '/products?category=jardin' },
  { label: 'Rangement', href: '/products?category=rangement' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const linkClass = `text-xs font-medium tracking-widest uppercase transition-all duration-300 relative group ${
    scrolled ? 'text-muted-foreground hover:text-accent' : 'text-white/80 hover:text-accent'
  }`;

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-card/96 backdrop-blur-xl border-b border-accent/20 h-16 shadow-sm'
          : 'bg-transparent h-20'
      }`}
    >
      <nav className="container mx-auto px-6 h-full flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className={`text-2xl font-bold font-heading tracking-wide transition-colors duration-500 ${scrolled ? 'text-foreground' : 'text-white'}`}>
            Moana
          </span>
          <span className="text-2xl font-bold font-heading tracking-wide text-accent">
            Furniture
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">

          {/* Accueil */}
          <Link href="/" className={linkClass}>
            Accueil
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Produits avec sous-menu */}
          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button className={`${linkClass} flex items-center gap-1`}>
              Produits
              <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${productsOpen ? 'rotate-180' : ''}`} />
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
            </button>

            {/* Mega menu */}
            {productsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-card border border-border shadow-xl">
                <div className="p-2">
                  <Link
                    href="/products"
                    className="block px-4 py-3 text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors border-b border-border mb-1"
                  >
                    Tous les produits
                  </Link>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="block px-4 py-2.5 text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-accent hover:bg-accent/5 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nouveautés */}
          <Link href="/products?sort=newest" className={linkClass}>
            Nouveautés
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Contact */}
          <Link href="/contact" className={linkClass}>
            Contact
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
          </Link>

        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-5">

          {/* Search */}
          <button className={`transition-colors duration-300 ${scrolled ? 'text-muted-foreground hover:text-accent' : 'text-white/80 hover:text-accent'}`}>
            <Search className="h-5 w-5" />
          </button>

          {/* Cart */}
          <Link
            href="/cart"
            className={`relative transition-colors duration-300 ${scrolled ? 'text-muted-foreground hover:text-accent' : 'text-white/80 hover:text-accent'}`}
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`flex items-center gap-2 text-xs font-medium tracking-widest uppercase transition-colors duration-300 ${scrolled ? 'text-muted-foreground hover:text-accent' : 'text-white/80 hover:text-accent'}`}>
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">{user.email?.split('@')[0]}</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <Package className="h-4 w-4" />
                    Mes commandes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 cursor-pointer text-accent">
                        <LayoutDashboard className="h-4 w-4" />
                        Administration
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="flex items-center gap-2 text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/login">
                <button className={`text-xs font-medium tracking-widest uppercase transition-colors duration-300 ${scrolled ? 'text-muted-foreground hover:text-accent' : 'text-white/80 hover:text-accent'}`}>
                  Connexion
                </button>
              </Link>
              <Link href="/register">
                <button className="text-xs font-medium tracking-widest uppercase px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300">
                  Inscription
                </button>
              </Link>
            </div>
          )}

          {/* Mobile Button */}
          <button
            className={`lg:hidden transition-colors duration-300 ${scrolled ? 'text-foreground' : 'text-white'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border">
          <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
            <Link href="/" className="text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Accueil</Link>
            <Link href="/products" className="text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Tous les produits</Link>
            {CATEGORIES.map((cat) => (
              <Link key={cat.href} href={cat.href} className="text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-accent transition-colors pl-4" onClick={() => setMobileMenuOpen(false)}>
                — {cat.label}
              </Link>
            ))}
            <Link href="/products?sort=newest" className="text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Nouveautés</Link>
            <Link href="/contact" className="text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-accent transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            {!user && (
              <div className="flex gap-4 pt-4 border-t border-border">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium tracking-widest uppercase text-muted-foreground hover:text-accent transition-colors">Connexion</Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="text-xs font-medium tracking-widest uppercase px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-white transition-all duration-300">Inscription</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}