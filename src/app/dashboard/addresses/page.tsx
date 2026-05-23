'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Plus, MapPin, Edit, Trash2, Check } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  island: string;
  postal_code: string | null;
  is_default: boolean;
}

const ISLANDS = [
  { value: 'Tahiti', label: 'Tahiti' },
  { value: 'Moorea', label: 'Moorea' },
  { value: 'Îles du Vent', label: 'Îles du Vent' },
  { value: 'Îles Sous-le-Vent', label: 'Îles Sous-le-Vent' },
  { value: 'Tuamotu', label: 'Tuamotu' },
  { value: 'Gambier', label: 'Gambier' },
  { value: 'Australes', label: 'Australes' },
  { value: 'Marquises', label: 'Marquises' },
];

export default function AddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: '',
    street: '',
    city: '',
    island: '',
    postalCode: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id);

    if (data) setAddresses(data);
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ label: '', street: '', city: '', island: '', postalCode: '' });
    setEditingId(null);
  };

  const handleOpenDialog = (address?: Address) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        label: address.label,
        street: address.street,
        city: address.city,
        island: address.island,
        postalCode: address.postal_code || '',
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const addressData = {
        user_id: user.id,
        label: formData.label,
        street: formData.street,
        city: formData.city,
        island: formData.island,
        postal_code: formData.postalCode || null,
        is_default: addresses.length === 0,
      };

      let error;

      if (editingId) {
        const { error: updateError } = await supabase
          .from('addresses')
          .update(addressData)
          .eq('id', editingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('addresses')
          .insert(addressData);
        error = insertError;
      }

      if (error) throw error;

      toast.success(editingId ? 'Adresse mise à jour' : 'Adresse ajoutée');
      setDialogOpen(false);
      resetForm();
      fetchAddresses();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) return;

    const { error } = await supabase.from('addresses').delete().eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Adresse supprimée');
      fetchAddresses();
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;

    // Remove default from all addresses
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);

    // Set new default
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', id);

    if (!error) {
      toast.success('Adresse par défaut définie');
      fetchAddresses();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading mb-2">Mes adresses</h2>
          <p className="text-muted-foreground">
            Gérez vos adresses de livraison.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une adresse
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Modifier l\'adresse' : 'Ajouter une adresse'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Libellé</Label>
                <Input
                  id="label"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Maison, Travail"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Adresse</Label>
                <Input
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  placeholder="Rue, numéro, résidence..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Papeete"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="98714"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="island">Île</Label>
                <Select value={formData.island} onValueChange={(v) => handleSelectChange('island', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une île" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISLANDS.map((island) => (
                      <SelectItem key={island.value} value={island.value}>
                        {island.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune adresse</h3>
            <p className="text-muted-foreground mb-6">
              Ajoutez une adresse de livraison pour faciliter vos commandes.
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une adresse
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id} className={address.is_default ? 'ring-2 ring-primary' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {address.label}
                  </CardTitle>
                  {address.is_default && (
                    <Badge>Par défaut</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{address.street}</p>
                <p className="text-sm text-muted-foreground">
                  {address.city}, {address.island}
                  {address.postal_code && ` ${address.postal_code}`}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  {!address.is_default && (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(address.id)}>
                      <Check className="mr-1 h-4 w-4" />
                      Définir par défaut
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(address)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
