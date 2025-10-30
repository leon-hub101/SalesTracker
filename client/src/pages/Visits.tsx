import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Clock, CheckCircle } from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface Visit {
  _id: string;
  client: {
    _id: string;
    name: string;
  };
  agent: {
    _id: string;
    name: string;
  };
  checkInTime: string;
  checkOutTime?: string;
}

interface Client {
  _id: string;
  name: string;
}

export default function Visits() {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const { toast } = useToast();

  const { data: visitsData, isLoading } = useQuery<{ visits: Visit[] }>({
    queryKey: ['/api/visits'],
  });

  const { data: clientsData } = useQuery<{ clients: Client[] }>({
    queryKey: ['/api/clients'],
  });

  const { data: activeVisitData } = useQuery<{ visit: Visit | null }>({
    queryKey: ['/api/visits/active'],
  });

  const checkInMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const res = await apiRequest('POST', '/api/visits/check-in', { clientId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/visits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/visits/active'] });
      setIsCheckInOpen(false);
      setSelectedClientId('');
      toast({ title: 'Success', description: 'Checked in successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (visitId: string) => {
      const res = await apiRequest('POST', '/api/visits/check-out', { visitId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/visits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/visits/active'] });
      toast({ title: 'Success', description: 'Checked out successfully' });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleCheckIn = () => {
    if (selectedClientId) {
      checkInMutation.mutate(selectedClientId);
    }
  };

  const handleCheckOut = (visitId: string) => {
    checkOutMutation.mutate(visitId);
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (checkIn: string, checkOut?: string) => {
    const start = new Date(checkIn);
    const end = checkOut ? new Date(checkOut) : new Date();
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const activeVisit = activeVisitData?.visit;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading visits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Visits</h1>
          <p className="text-muted-foreground">Track your client visits</p>
        </div>
        <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
          <DialogTrigger asChild>
            <Button disabled={!!activeVisit} data-testid="button-check-in">
              <MapPin className="w-4 h-4 mr-2" />
              Check In
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Check In to Visit</DialogTitle>
              <DialogDescription>Select a client to start your visit</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger data-testid="select-client">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsData?.clients?.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCheckInOpen(false)}>Cancel</Button>
              <Button
                onClick={handleCheckIn}
                disabled={!selectedClientId || checkInMutation.isPending}
                data-testid="button-submit-check-in"
              >
                {checkInMutation.isPending ? 'Checking in...' : 'Check In'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {activeVisit && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Active Visit
              </span>
              <Button
                onClick={() => handleCheckOut(activeVisit._id)}
                disabled={checkOutMutation.isPending}
                data-testid="button-check-out"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Check Out
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium text-lg">{activeVisit.clientId?.name || 'Unknown Client'}</p>
              <p className="text-sm text-muted-foreground">
                Started: {formatDateTime(activeVisit.checkInTime)}
              </p>
              <p className="text-sm text-muted-foreground">
                Duration: {calculateDuration(activeVisit.checkInTime)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {visitsData?.visits?.map((visit) => (
          <Card key={visit._id} data-testid={`card-visit-${visit._id}`}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{visit.clientId?.name || 'Unknown Client'}</h3>
                <p className="text-sm text-muted-foreground">Agent: {visit.agentId?.name || 'Unknown Agent'}</p>
                <div className="flex gap-4 mt-2">
                  <p className="text-sm">
                    <span className="font-medium">Check-in:</span> {formatDateTime(visit.checkInTime)}
                  </p>
                  {visit.checkOutTime && (
                    <p className="text-sm">
                      <span className="font-medium">Check-out:</span> {formatDateTime(visit.checkOutTime)}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                {visit.checkOutTime ? (
                  <>
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-sm font-medium text-green-800 dark:text-green-300">
                      Completed
                    </span>
                    <p className="text-sm text-muted-foreground mt-2">
                      Duration: {calculateDuration(visit.checkInTime, visit.checkOutTime)}
                    </p>
                  </>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    In Progress
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {visitsData?.visits?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">No visits recorded</p>
            <Button onClick={() => setIsCheckInOpen(true)} disabled={!!activeVisit}>
              <MapPin className="w-4 h-4 mr-2" />
              Start Your First Visit
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
