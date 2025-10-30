import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, BookOpen, Trash2 } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/contexts/AuthContext';

interface TrainingLog {
  _id: string;
  agent: {
    _id: string;
    name: string;
  };
  description: string;
  date: string;
}

export default function TrainingLogs() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: trainingLogsData, isLoading } = useQuery<{ trainingLogs: TrainingLog[] }>({
    queryKey: ['/api/training-logs'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        agentId: user?._id,
        description: data.description,
        date: new Date(data.date).toISOString(),
      };
      const res = await apiRequest('POST', '/api/training-logs', payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-logs'] });
      setIsCreateOpen(false);
      setFormData({
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      toast({ title: 'Success', description: 'Training log created successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/training-logs/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/training-logs'] });
      toast({ title: 'Success', description: 'Training log deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this training log?')) {
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
          <p className="text-muted-foreground">Loading training logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Training Logs</h1>
          <p className="text-muted-foreground">Track your training activities</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-training-log">
              <Plus className="w-4 h-4 mr-2" />
              Add Training Log
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Training Log</DialogTitle>
              <DialogDescription>Record a training activity</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the training activity..."
                  data-testid="input-description"
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
              <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-submit-training-log">
                {createMutation.isPending ? 'Creating...' : 'Create Log'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {trainingLogsData?.trainingLogs?.map((log) => (
          <Card key={log._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-base">{log.agent.name}</span>
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(log._id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{log.description}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(log.date)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {trainingLogsData?.trainingLogs?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">No training logs found</p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Training Log
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
