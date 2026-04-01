import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { FinanceProvider } from "./context/FinanceContext";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Insights from "./pages/Insights";
const queryClient = new QueryClient();
function Router() {
    return (<Switch>
      <Route path="/">
        <Layout><Dashboard /></Layout>
      </Route>
      <Route path="/transactions">
        <Layout><Transactions /></Layout>
      </Route>
      <Route path="/insights">
        <Layout><Insights /></Layout>
      </Route>
      <Route component={NotFound}/>
    </Switch>);
}
function App() {
    return (<QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <FinanceProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </FinanceProvider>
      </TooltipProvider>
    </QueryClientProvider>);
}
export default App;
