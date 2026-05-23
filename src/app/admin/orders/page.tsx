'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Eye, Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  status: string;
  subtotal_xpf: number;
  shipping_xpf: number;
  total_xpf: number;
  created_at: string;
  updated_at: string;
  shipping_address: any;
  notes: string | null;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_xpf: number;
  total_price_xpf: number;
}

interface Product {
  id: string;
  name: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
}

function formatPrice(xpf: number) {
  return new Intl.NumberFormat('fr-FR').format(xpf / 100);
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'En attente', color: 'bg-amber-500/10 text-amber-600', icon: Clock },
  confirmed: { label: 'Confirmée', color: 'bg-blue-500/10 text-blue-600', icon: CheckCircle },
  processing: { label: 'En préparation', color: 'bg-purple-500/10 text-purple-600', icon: Package },
  shipped: { label: 'Expédiée', color: 'bg-indigo-500/10 text-indigo-600', icon: Truck },
  delivered: { label: 'Livrée', color: 'bg-green-500/10 text-green-600', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: 'bg-red-500/10 text-red-600', icon: XCircle },
};

const statusOptions = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderProducts, setOrderProducts] = useState<Record<string, Product>>({});
  const [orderProfile, setOrderProfile] = useState<Profile | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const fetchOrderDetails = async (order: Order) => {
    setSelectedOrder(order);

    // Fetch order items
    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    if (itemsData) {
      setOrderItems(itemsData);

      // Fetch product names
      const productIds = itemsData.map(item => item.product_id);
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds);

      if (productsData) {
        const productsMap: Record<string, Product> = {};
        productsData.forEach(p => {
          productsMap[p.id] = p;
        });
        setOrderProducts(productsMap);
      }
    }

    // Fetch customer profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', order.user_id)
      .maybeSingle();

    setOrderProfile(profileData);
    setDetailDialogOpen(true);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Erreur lors de la mise à jour du statut');
    } else {
      toast.success('Statut mis à jour');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderProfile?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Commandes</h1>
        <p className="text-muted-foreground">
          Gérez les commandes de vos clients ({orders.length} commandes)
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse h-20 bg-muted rounded" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Aucune commande ne correspond aux filtres'
                : 'Les commandes apparaîtront ici une fois passées'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {order.shipping_address && (
                          <p className="text-sm text-muted-foreground">
                            Livraison: {order.shipping_address.city}, {order.shipping_address.island}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-bold text-lg">{formatPrice(order.total_xpf)} XPF</p>
                      <Select
                        value={order.status}
                        onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                      >
                        <SelectTrigger className="w-40">
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => fetchOrderDetails(order)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Commande #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Customer Info */}
                {orderProfile && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Client</h3>
                    <p className="text-sm">{orderProfile.full_name || 'Non renseigné'}</p>
                    <p className="text-sm text-muted-foreground">{orderProfile.email}</p>
                    <p className="text-sm text-muted-foreground">{orderProfile.phone || ''}</p>
                  </div>
                )}

                {/* Shipping Address */}
                {selectedOrder.shipping_address && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Adresse de livraison</h3>
                    <p className="text-sm">{selectedOrder.shipping_address.fullName}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.shipping_address.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.island}
                    </p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.shipping_address.phone}</p>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-3">Articles</h3>
                  <div className="space-y-2">
                    {orderItems.map((item) => {
                      const product = orderProducts[item.product_id];
                      return (
                        <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{product?.name || 'Produit inconnu'}</p>
                            <p className="text-sm text-muted-foreground">
                              Qté: {item.quantity} × {formatPrice(item.unit_price_xpf)} XPF
                            </p>
                          </div>
                          <p className="font-semibold">{formatPrice(item.total_price_xpf)} XPF</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span>{formatPrice(selectedOrder.subtotal_xpf)} XPF</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Livraison</span>
                    <span>{formatPrice(selectedOrder.shipping_xpf)} XPF</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(selectedOrder.total_xpf)} XPF</span>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
