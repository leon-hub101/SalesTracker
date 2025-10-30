import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, AlertCircle, FileText, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Visit {
  _id: string;
  clientId: {
    _id: string;
    name: string;
    address: string;
  };
  agentId: {
    _id: string;
    name: string;
    email: string;
  };
  checkInTime: string;
  checkOutTime?: string;
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: clientsData } = useQuery<{ clients: any[] }>({
    queryKey: ['/api/clients'],
  });

  const { data: visitsData } = useQuery<{ visits: Visit[] }>({
    queryKey: ['/api/visits'],
  });

  const { data: complaintsData } = useQuery<{ complaints: any[] }>({
    queryKey: ['/api/product-complaints'],
  });

  const { data: missedOrdersData } = useQuery<{ missedOrders: any[] }>({
    queryKey: ['/api/missed-orders'],
  });

  const { data: activeVisitData } = useQuery<{ visit: Visit | null }>({
    queryKey: ['/api/visits/active'],
  });

  const totalClients = clientsData?.clients?.length || 0;
  const totalVisits = visitsData?.visits?.length || 0;
  const totalComplaints = complaintsData?.complaints?.length || 0;
  const totalMissedOrders = missedOrdersData?.missedOrders?.length || 0;
  const activeVisit = activeVisitData?.visit;

  const recentVisits = visitsData?.visits
    ?.slice(0, 5)
    .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()) || [];

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

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl lg:text-5xl font-light font-serif tracking-wide" data-testid="text-dashboard-title">Welcome back, {user?.name}</h1>
        <p className="text-foreground/60 mt-3 text-sm uppercase tracking-widest font-medium">Today's Performance Overview</p>
      </div>

      {activeVisit && (
        <Card className="border-primary bg-primary/5">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="flex items-center gap-3 text-sm uppercase tracking-widest font-medium text-foreground/70">
              <Clock className="w-4 h-4 text-primary" />
              Active Visit
            </CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-3">
              <p className="text-2xl font-serif font-light">{activeVisit.clientId?.name || 'Unknown Client'}</p>
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

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4">
            <CardTitle className="text-sm uppercase tracking-widest font-medium text-foreground/70">Total Clients</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="text-4xl lg:text-5xl font-light font-serif" data-testid="text-total-clients">{totalClients}</div>
            <p className="text-xs text-foreground/60 mt-2 uppercase tracking-wider font-medium">Active customers</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4">
            <CardTitle className="text-sm uppercase tracking-widest font-medium text-foreground/70">Total Visits</CardTitle>
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="text-4xl lg:text-5xl font-light font-serif" data-testid="text-total-visits">{totalVisits}</div>
            <p className="text-xs text-foreground/60 mt-2 uppercase tracking-wider font-medium">All time</p>
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4">
            <CardTitle className="text-sm uppercase tracking-widest font-medium text-foreground/70">Complaints</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="text-4xl lg:text-5xl font-light font-serif" data-testid="text-total-complaints">{totalComplaints}</div>
            <p className="text-xs text-foreground/60 mt-2 uppercase tracking-wider font-medium">Total logged</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border col-span-full lg:col-span-2">
        <CardHeader className="p-8 pb-6">
          <CardTitle className="flex items-center gap-3 text-sm uppercase tracking-widest font-medium text-foreground/70">
            <TrendingUp className="w-4 h-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {recentVisits.length === 0 ? (
            <p className="text-muted-foreground text-center py-12 text-sm uppercase tracking-wider">No recent visits</p>
          ) : (
            <div className="space-y-6">
              {recentVisits.map((visit) => (
                <div key={visit._id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-serif text-lg">{visit.clientId?.name || 'Unknown Client'}</p>
                    <p className="text-sm text-muted-foreground mt-1">{formatDateTime(visit.checkInTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium uppercase tracking-wider text-foreground/60">
                      {visit.checkOutTime ? 'Completed' : 'In Progress'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {calculateDuration(visit.checkInTime, visit.checkOutTime)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
