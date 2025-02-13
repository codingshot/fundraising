
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ApiDocs from "./pages/Docs";
import DataPage from "./pages/Data";
import FundraiseDetails from "./pages/FundraiseDetails";
import Footer from "./components/Footer";
import { NavigationMenu } from "./components/NavigationMenu";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NavigationMenu />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/docs" element={<ApiDocs />} />
              <Route path="/data" element={<DataPage />} />
              <Route path="/fundraise/id/:id" element={<FundraiseDetails />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
