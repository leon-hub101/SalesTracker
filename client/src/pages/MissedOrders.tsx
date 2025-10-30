import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, AlertCircle, Trash2 } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface MissedOrder {
  _id: string;
  client?: {
    _id: string;
    name: string;
  };
  product: string;
  reason: string;
  date: string;
}

interface Client {
  _id: string;
  name: string;
}

export default function MissedOrders() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    product: '',
    reason: '',
    date: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  const { data: missedOrdersData, isLoading } = useQuery<{ missedOrders: MissedOrder[] }>({
    queryKey: ['/api/missed-orders'],
  });

  const { data: clientsData } = useQuery<{ clients: Client[] }>({
    queryKey: ['/api/clients'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        clientId: data.clientId || undefined,
        product: data.product,
        reason: data.reason,
        date: new Date(data.date).toISOString(),
      };
      const res = await apiRequest('POST', '/api/missed-orders', payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/missed-orders'] });
      setIsCreateOpen(false);
      setFormData({
        clientId: '',
        product: '',
        reason: '',
        date: new Date().toISOString().split('T')[0],
      });
      toast({ title: 'Success', description: 'Missed order logged successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/missed-orders/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/missed-orders'] });
      toast({ title: 'Success', description: 'Missed order deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this missed order?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading missed orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl lg:text-5xl font-light font-serif tracking-wide">Missed Orders</h1>
          <p className="text-foreground/60 mt-3 text-sm uppercase tracking-widest font-medium">Track missed sales opportunities</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-missed-order">
              <Plus className="w-4 h-4 mr-2" />
              Log Missed Order
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Missed Order</DialogTitle>
              <DialogDescription>Record a missed sales opportunity</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client" className="text-xs uppercase tracking-widest font-medium text-foreground/70">Client (Optional)</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Client</SelectItem>
                    {clientsData?.clients?.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product" className="text-xs uppercase tracking-widest font-medium text-foreground/70">Product</Label>
                <Input
                  id="product"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  data-testid="input-product"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-xs uppercase tracking-widest font-medium text-foreground/70">Reason</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  data-testid="input-reason"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-xs uppercase tracking-widest font-medium text-foreground/70">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  data-testid="input-date"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-submit-missed-order">
                {createMutation.isPending ? 'Logging...' : 'Log Missed Order'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {missedOrdersData?.missedOrders?.map((order) => (
          <Card key={order._id}>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <span className="text-lg font-serif font-light">{order.product}</span>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(order._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-3">
              {order.client && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Client:</span> {order.client.name}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Reason:</span> {order.reason}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.date)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {missedOrdersData?.missedOrders?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">No missed orders logged</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Log Your First Missed Order
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
