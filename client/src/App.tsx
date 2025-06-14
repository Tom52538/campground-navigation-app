import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "@/pages/Navigation";
import NotFound from "@/pages/not-found";
import { LanguageDebug } from "@/components/UI/LanguageDebug";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Navigation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <LanguageDebug />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
