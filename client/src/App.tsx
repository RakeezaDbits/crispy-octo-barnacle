import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import ErrorBoundary from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";

import Home from "@/pages/home";
import Auth from "@/pages/auth";
import CustomerDashboard from "@/pages/customer-dashboard";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Router>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/auth" component={Auth} />
                <Route path="/dashboard" component={CustomerDashboard} />
                <Route path="/admin" component={Admin} />
                <Route path="/admin/login" component={AdminLogin} />
                <Route component={NotFound} />
              </Switch>
            </Router>
            <Toaster />
          </ErrorBoundary>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}