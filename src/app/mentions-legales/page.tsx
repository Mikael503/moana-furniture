import { StoreLayout } from '@/components/layout/StoreLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales | Meubles Polynésie',
};

export default function MentionsLegalesPage() {
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold font-heading mb-8">Mentions légales</h1>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Éditeur du site</h2>
            <p className="text-muted-foreground">
              Meubles Polynésie<br />
              Société à responsabilité limitée (SARL)<br />
              Siège social : Papeete, Tahiti, Polynésie française<br />
              Email : contact@meubles-pf.fr<br />
              Téléphone : +689 40 12 34 56
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Hébergement</h2>
            <p className="text-muted-foreground">
              Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Propriété intellectuelle</h2>
            <p className="text-muted-foreground">
              L'ensemble des contenus présents sur ce site (textes, images, logos, graphismes) sont la propriété exclusive
              de Meubles Polynésie ou de ses partenaires. Toute reproduction, représentation ou diffusion, en tout ou
              partie, du contenu de ce site sur quelque support que ce soit, sans l'autorisation expresse de Meubles
              Polynésie, est interdite et constitue une contrefaçon.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Responsabilité</h2>
            <p className="text-muted-foreground">
              Meubles Polynésie s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site.
              Toutefois, Meubles Polynésie ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations
              mises à disposition sur ce site. En conséquence, Meubles Polynésie décline toute responsabilité pour toute
              imprécision, inexactitude ou omission portant sur des informations disponibles sur ce site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Droit applicable</h2>
            <p className="text-muted-foreground">
              Le présent site est soumis au droit français applicable en Polynésie française. Tout litige relatif à
              l'utilisation de ce site sera soumis à la juridiction compétente de Papeete.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Cookies</h2>
            <p className="text-muted-foreground">
              Ce site utilise des cookies techniques nécessaires au bon fonctionnement du service (session utilisateur,
              panier d'achat). Aucun cookie publicitaire ou de traçage tiers n'est utilisé.
            </p>
          </section>

          <p className="text-sm text-muted-foreground pt-4 border-t">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </StoreLayout>
  );
}
