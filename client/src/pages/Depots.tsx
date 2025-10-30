import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, Pencil, Trash2 } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface Depot {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  inspection: {
    done: boolean;
    hsFile: boolean;
    housekeeping: number;
    hazLicense: boolean;
    stockCounted: boolean;
    notes: string;
  };
}

export default function Depots() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDepot, setEditingDepot] = useState<Depot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    lat: 0,
    lng: 0,
    inspection: {
      done: false,
      hsFile: false,
      housekeeping: 3,
      hazLicense: false,
      stockCounted: false,
      notes: '',
    },
  });
  const { toast } = useToast();

  const { data: depotsData, isLoading } = useQuery<{ depots: Depot[] }>({
    queryKey: ['/api/depots'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest('POST', '/api/depots', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/depots'] });
      setIsCreateOpen(false);
      setFormData({
        name: '',
        lat: 0,
        lng: 0,
        inspection: { done: false, hsFile: false, housekeeping: 3, hazLicense: false, stockCounted: false, notes: '' },
      });
      toast({ title: 'Success', description: 'Depot created successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Depot> }) => {
      const res = await apiRequest('PATCH', `/api/depots/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/depots'] });
      setEditingDepot(null);
      toast({ title: 'Success', description: 'Depot updated successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/depots/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/depots'] });
      toast({ title: 'Success', description: 'Depot deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (editingDepot) {
      updateMutation.mutate({ id: editingDepot._id, data: formData });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this depot?')) {
      deleteMutation.mutate(id);
    }
  };

  const openEditDialog = (depot: Depot) => {
    setEditingDepot(depot);
    setFormData({
      name: depot.name,
      lat: depot.lat,
      lng: depot.lng,
      inspection: depot.inspection,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading depots...</p>
        </div>
      </div>
    );
  }

  const InspectionForm = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="done"
          checked={formData.inspection.done}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, inspection: { ...formData.inspection, done: checked as boolean } })
          }
        />
        <Label htmlFor="done">Inspection Done</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hsFile"
          checked={formData.inspection.hsFile}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, inspection: { ...formData.inspection, hsFile: checked as boolean } })
          }
        />
        <Label htmlFor="hsFile">H&S File Present</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="housekeeping">Housekeeping (1-5)</Label>
        <Input
          id="housekeeping"
          type="number"
          min="1"
          max="5"
          value={formData.inspection.housekeeping}
          onChange={(e) =>
            setFormData({ ...formData, inspection: { ...formData.inspection, housekeeping: parseInt(e.target.value) } })
          }
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hazLicense"
          checked={formData.inspection.hazLicense}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, inspection: { ...formData.inspection, hazLicense: checked as boolean } })
          }
        />
        <Label htmlFor="hazLicense">Hazmat License</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="stockCounted"
          checked={formData.inspection.stockCounted}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, inspection: { ...formData.inspection, stockCounted: checked as boolean } })
          }
        />
        <Label htmlFor="stockCounted">Stock Counted</Label>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.inspection.notes}
          onChange={(e) =>
            setFormData({ ...formData, inspection: { ...formData.inspection, notes: e.target.value } })
          }
        />
      </div>
    </div>
  );

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl lg:text-5xl font-light font-serif tracking-wide">Depots</h1>
          <p className="text-foreground/60 mt-3 text-sm uppercase tracking-widest font-medium">Manage depot locations and inspections</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-depot">
              <Plus className="w-4 h-4 mr-2" />
              Add Depot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Depot</DialogTitle>
              <DialogDescription>Add a new depot with inspection details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-depot-name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-4">Inspection Details</h4>
                <InspectionForm />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-submit-depot">
                {createMutation.isPending ? 'Creating...' : 'Create Depot'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={!!editingDepot} onOpenChange={() => setEditingDepot(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Depot</DialogTitle>
            <DialogDescription>Update depot information and inspection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-lat">Latitude</Label>
                <Input
                  id="edit-lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lng">Longitude</Label>
                <Input
                  id="edit-lng"
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Inspection Details</h4>
              <InspectionForm />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDepot(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Depot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-2">
        {depotsData?.depots?.map((depot) => (
          <Card key={depot._id}>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="flex justify-between items-start">
                <span className="flex items-center gap-3 text-lg font-serif font-light">
                  <Building2 className="w-5 h-5" />
                  {depot.name}
                </span>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEditDialog(depot)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(depot._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Coordinates:</span> {depot.lat.toFixed(4)}, {depot.lng.toFixed(4)}
              </p>
              <div className="border-t pt-3 mt-4">
                <p className="font-medium mb-3 text-sm uppercase tracking-widest text-foreground/70">Inspection Status</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>✓ Inspection: {depot.inspection.done ? 'Done' : 'Pending'}</div>
                  <div>✓ H&S File: {depot.inspection.hsFile ? 'Yes' : 'No'}</div>
                  <div>✓ Housekeeping: {depot.inspection.housekeeping}/5</div>
                  <div>✓ Hazmat: {depot.inspection.hazLicense ? 'Yes' : 'No'}</div>
                  <div>✓ Stock Count: {depot.inspection.stockCounted ? 'Yes' : 'No'}</div>
                </div>
                {depot.inspection.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{depot.inspection.notes}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {depotsData?.depots?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">No depots found</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Depot
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
