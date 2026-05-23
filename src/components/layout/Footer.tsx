'use client';

import Link from 'next/link';
import { Facebook, Instagram, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold font-heading">Moana</span>
              <span className="text-2xl font-medium text-accent"> Furniture</span>
            </Link>
            <p className="text-sm text-primary-foreground/80">
              Votre destination pour des meubles de qualité en Polynésie française.
              Livraison sur Tahiti et les îles.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-heading font-semibold mb-4 text-xs tracking-widest uppercase">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-accent transition-colors">Accueil</Link></li>
              <li><Link href="/products" className="hover:text-accent transition-colors">Tous les produits</Link></li>
              <li><Link href="/products?category=salon" className="hover:text-accent transition-colors">Salon</Link></li>
              <li><Link href="/products?category=chambre" className="hover:text-accent transition-colors">Chambre</Link></li>
              <li><Link href="/products?category=jardin" className="hover:text-accent transition-colors">Jardin</Link></li>
              <li><Link href="/products?sort=newest" className="hover:text-accent transition-colors">Nouveautés</Link></li>
            </ul>
          </div>

          {/* Service Client */}
          <div>
            <h3 className="font-heading font-semibold mb-4 text-xs tracking-widest uppercase">Service Client</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="hover:text-accent transition-colors">Mon compte</Link></li>
              <li><Link href="/dashboard/orders" className="hover:text-accent transition-colors">Mes commandes</Link></li>
              <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold mb-4 text-xs tracking-widest uppercase">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:mikaelbohime8@gmail.com" className="hover:text-accent transition-colors">
                  mikaelbohime8@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} Moana Furniture. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link href="/mentions-legales" className="hover:text-accent transition-colors">
                Mentions légales
              </Link>
              <Link href="/politique-confidentialite" className="hover:text-accent transition-colors">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}