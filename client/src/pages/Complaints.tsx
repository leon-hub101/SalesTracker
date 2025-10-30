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
import { Plus, FileText, Pencil, Trash2 } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface Complaint {
  _id: string;
  client?: {
    _id: string;
    name: string;
  };
  product: string;
  comment: string;
  date: string;
}

interface Client {
  _id: string;
  name: string;
}

export default function Complaints() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    product: '',
    comment: '',
    date: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();

  const { data: complaintsData, isLoading } = useQuery<{ complaints: Complaint[] }>({
    queryKey: ['/api/product-complaints'],
  });

  const { data: clientsData } = useQuery<{ clients: Client[] }>({
    queryKey: ['/api/clients'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        clientId: data.clientId || undefined,
        product: data.product,
        comment: data.comment,
        date: new Date(data.date).toISOString(),
      };
      const res = await apiRequest('POST', '/api/product-complaints', payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-complaints'] });
      setIsCreateOpen(false);
      setFormData({
        clientId: '',
        product: '',
        comment: '',
        date: new Date().toISOString().split('T')[0],
      });
      toast({ title: 'Success', description: 'Complaint submitted successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Complaint> }) => {
      const res = await apiRequest('PATCH', `/api/product-complaints/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-complaints'] });
      setEditingComplaint(null);
      toast({ title: 'Success', description: 'Complaint updated successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/product-complaints/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/product-complaints'] });
      toast({ title: 'Success', description: 'Complaint deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (editingComplaint) {
      const payload: any = {
        product: formData.product,
        comment: formData.comment,
        date: new Date(formData.date).toISOString(),
      };
      if (formData.clientId) {
        payload.clientId = formData.clientId;
      }
      updateMutation.mutate({
        id: editingComplaint._id,
        data: payload,
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this complaint?')) {
      deleteMutation.mutate(id);
    }
  };

  const openEditDialog = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setFormData({
      clientId: complaint.client?._id || '',
      product: complaint.product,
      comment: complaint.comment,
      date: new Date(complaint.date).toISOString().split('T')[0],
    });
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
          <p className="text-muted-foreground">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Product Complaints</h1>
          <p className="text-muted-foreground">Track and manage product issues</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-complaint">
              <Plus className="w-4 h-4 mr-2" />
              Submit Complaint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Product Complaint</DialogTitle>
              <DialogDescription>Report a product quality issue</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client (Optional)</Label>
                <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Client</SelectItem>
                    {clientsData?.clients?.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Input
                  id="product"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  data-testid="input-product"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  placeholder="Describe the issue..."
                  data-testid="input-comment"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
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
              <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-submit-complaint">
                {createMutation.isPending ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingComplaint} onOpenChange={() => setEditingComplaint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Complaint</DialogTitle>
            <DialogDescription>Update complaint information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-client">Client (Optional)</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No Client</SelectItem>
                  {clientsData?.clients?.map((client) => (
                    <SelectItem key={client._id} value={client._id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-product">Product</Label>
              <Input
                id="edit-product"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-comment">Comment</Label>
              <Textarea
                id="edit-comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingComplaint(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Complaint'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {complaintsData?.complaints?.map((complaint) => (
          <Card key={complaint._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-destructive" />
                  <span>{complaint.product}</span>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEditDialog(complaint)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(complaint._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {complaint.client && (
                <p className="text-sm">
                  <span className="font-medium">Client:</span> {complaint.client.name}
                </p>
              )}
              <p className="text-sm">{complaint.comment}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(complaint.date)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {complaintsData?.complaints?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">No complaints found</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Submit Your First Complaint
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
