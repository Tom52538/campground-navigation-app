import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Navigation from "@/pages/Navigation";
import NotFound from "@/pages/not-found";
import { MemoryMonitor } from '@/utils/memoryMonitor';
import { useEffect } from 'react';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Navigation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Start memory monitoring to prevent crashes
    const memoryMonitor = MemoryMonitor.getInstance();
    memoryMonitor.startMonitoring();

    return () => {
      memoryMonitor.stopMonitoring();
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;