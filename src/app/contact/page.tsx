import { StoreLayout } from '@/components/layout/StoreLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Moana Furniture',
};

export default function ContactPage() {
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-20 max-w-2xl">
        <h1 className="text-4xl font-bold font-heading mb-2">Nous contacter</h1>
        <p className="text-muted-foreground mb-10">
          Une question sur une commande ou un produit ? Écrivez-nous, nous vous répondons dans les plus brefs délais.
        </p>

        <div className="mb-12">
          <p className="text-xs font-medium tracking-widest uppercase text-accent mb-2">Email</p>
          <a href="mailto:mikaelbohime8@gmail.com" className="text-muted-foreground hover:text-accent transition-colors">
            mikaelbohime8@gmail.com
          </a>
        </div>

        <form className="space-y-5">
          <div>
            <label className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-2">
              Nom complet
            </label>
            <input
              type="text"
              placeholder="Votre nom"
              className="w-full px-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="votre@email.com"
              className="w-full px-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium tracking-widest uppercase text-muted-foreground block mb-2">
              Message
            </label>
            <textarea
              rows={5}
              placeholder="Votre message..."
              className="w-full px-4 py-3 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-accent text-white text-xs font-medium tracking-widest uppercase hover:bg-accent/90 transition-colors"
          >
            Envoyer le message
          </button>
        </form>
      </div>
    </StoreLayout>
  );
}