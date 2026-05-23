'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Users, User, Mail, Phone, Shield } from 'lucide-react';

interface Customer {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
  order_count: number;
  total_spent: number;
}

function formatPrice(xpf: number) {
  return new Intl.NumberFormat('fr-FR').format(xpf / 100);
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);

    // Fetch all users with customer role
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'customer');

    if (!rolesData || rolesData.length === 0) {
      setCustomers([]);
      setLoading(false);
      return;
    }

    const userIds = rolesData.map(r => r.user_id);

    // Fetch profiles
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    // Fetch order counts and totals for each user
    const customersWithStats: Customer[] = [];

    for (const profile of profilesData || []) {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_xpf')
        .eq('user_id', profile.id);

      const orderCount = ordersData?.length || 0;
      const totalSpent = ordersData?.reduce((sum, o) => sum + (o.total_xpf || 0), 0) || 0;

      customersWithStats.push({
        ...profile,
        role: 'customer',
        order_count: orderCount,
        total_spent: totalSpent,
      });
    }

    // Sort by creation date
    customersWithStats.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setCustomers(customersWithStats);
    setLoading(false);
  };

  const filteredCustomers = customers.filter(c =>
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Clients</h1>
        <p className="text-muted-foreground">
          Gérez les comptes clients ({customers.length} clients)
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un client..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Customers Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun client</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Aucun client ne correspond à votre recherche'
                : 'Les clients apparaîtront ici une fois inscrits'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {customer.full_name || 'Sans nom'}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{customer.email || 'Pas d\'email'}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Commandes</p>
                    <p className="font-semibold">{customer.order_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total dépensé</p>
                    <p className="font-semibold">{formatPrice(customer.total_spent)} XPF</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Inscrit le {new Date(customer.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Client
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
