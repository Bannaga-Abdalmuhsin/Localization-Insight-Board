import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import TeamBreakdown from "@/pages/TeamBreakdown";
import PositionDetail from "@/pages/PositionDetail";
import UploadData from "@/pages/UploadData";
import NotFound from "@/pages/not-found";
import { LanguageProvider } from "@/lib/i18n";

const queryClient = new QueryClient();

const DEFAULT_TARGET_PCT = 50;

function Router() {
  const [targetPct, setTargetPct] = useState(DEFAULT_TARGET_PCT);

  return (
    <AppLayout>
      <Switch>
        <Route path="/">
          <Dashboard targetPct={targetPct} onTargetChange={setTargetPct} />
        </Route>
        <Route path="/teams">
          <TeamBreakdown targetPct={targetPct} />
        </Route>
        <Route path="/positions">
          <PositionDetail targetPct={targetPct} />
        </Route>
        <Route path="/upload">
          <UploadData />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
