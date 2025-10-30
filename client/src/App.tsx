import { Switch, Route } from "wouter";
import { queryClient } from "../../api/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/app-sidebar";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Visits from "@/pages/Visits";
import Depots from "@/pages/Depots";
import MissedOrders from "@/pages/MissedOrders";
import TrainingLogs from "@/pages/TrainingLogs";
import Complaints from "@/pages/Complaints";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center gap-2 p-4 border-b bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h1 className="text-lg font-semibold">SalesTrackr</h1>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/clients">
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        </Route>
        <Route path="/visits">
          <ProtectedRoute>
            <Visits />
          </ProtectedRoute>
        </Route>
        <Route path="/depots">
          <ProtectedRoute>
            <Depots />
          </ProtectedRoute>
        </Route>
        <Route path="/missed-orders">
          <ProtectedRoute>
            <MissedOrders />
          </ProtectedRoute>
        </Route>
        <Route path="/training-logs">
          <ProtectedRoute>
            <TrainingLogs />
          </ProtectedRoute>
        </Route>
        <Route path="/complaints">
          <ProtectedRoute>
            <Complaints />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
