import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, AlertCircle, FileText, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Here's what's happening with your sales today.</p>
      </div>

      {activeVisit && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Active Visit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{activeVisit.client.name}</p>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-clients">{totalClients}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-visits">{totalVisits}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complaints</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-complaints">{totalComplaints}</div>
            <p className="text-xs text-muted-foreground">Total logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missed Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-missed-orders">{totalMissedOrders}</div>
            <p className="text-xs text-muted-foreground">Opportunities</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentVisits.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent visits</p>
          ) : (
            <div className="space-y-4">
              {recentVisits.map((visit) => (
                <div key={visit._id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{visit.client.name}</p>
                    <p className="text-sm text-muted-foreground">{formatDateTime(visit.checkInTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
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
