import { StoreLayout } from '@/components/layout/StoreLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité | Meubles Polynésie',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <StoreLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold font-heading mb-8">Politique de confidentialité</h1>

        <div className="space-y-8 text-foreground">

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Responsable du traitement</h2>
            <p className="text-muted-foreground">
              Meubles Polynésie, dont le siège est à Papeete, Tahiti, Polynésie française,
              est responsable du traitement de vos données personnelles dans le cadre de l'utilisation de ce site
              (contact@meubles-pf.fr).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Données collectées</h2>
            <p className="text-muted-foreground mb-2">Nous collectons les données suivantes :</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Données d'identification : nom, prénom, adresse email, numéro de téléphone</li>
              <li>Données de livraison : adresse postale, île, code postal</li>
              <li>Données de paiement : traitées exclusivement par Stripe (nous ne stockons aucune donnée bancaire)</li>
              <li>Données de navigation : pages visitées, panier (stocké localement dans votre navigateur)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Finalités du traitement</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>Gestion de votre compte client et authentification</li>
              <li>Traitement et suivi de vos commandes</li>
              <li>Communication relative à vos achats (confirmation, expédition)</li>
              <li>Amélioration de nos services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Base légale</h2>
            <p className="text-muted-foreground">
              Le traitement de vos données est fondé sur l'exécution du contrat (traitement des commandes),
              votre consentement (inscription à la newsletter si applicable), et nos obligations légales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Destinataires des données</h2>
            <p className="text-muted-foreground">
              Vos données sont transmises à nos sous-traitants techniques dans le cadre de la fourniture du service :
              Supabase (base de données et authentification, hébergé aux États-Unis avec garanties RGPD) et
              Stripe (paiement en ligne). Ces prestataires agissent uniquement sur nos instructions et s'engagent
              à respecter la confidentialité de vos données.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Durée de conservation</h2>
            <p className="text-muted-foreground">
              Vos données sont conservées pendant la durée de votre relation commerciale avec nous, puis archivées
              pendant 5 ans conformément aux obligations légales comptables et fiscales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Vos droits</h2>
            <p className="text-muted-foreground">
              Conformément aux dispositions applicables en Polynésie française et au RGPD, vous disposez d'un droit
              d'accès, de rectification, d'effacement, de portabilité et d'opposition concernant vos données personnelles.
              Pour exercer ces droits, contactez-nous à : contact@meubles-pf.fr
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold font-heading mb-3">Sécurité</h2>
            <p className="text-muted-foreground">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données
              contre tout accès non autorisé, toute modification, divulgation ou destruction. Les communications entre
              votre navigateur et notre site sont chiffrées via HTTPS.
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
