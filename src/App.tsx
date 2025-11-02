import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Fields from "./pages/Fields";
import CropHealth from "./pages/CropHealth";
import CropRecommendation from "./pages/CropRecommendation";
import FieldEfficiency from "./pages/FieldEfficiency";
import HarvestPlanning from "./pages/HarvestPlanning";
import Auth from "./pages/Auth";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes - accessible without authentication */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/fields" element={
              <ProtectedRoute>
                <Fields />
              </ProtectedRoute>
            } />
            <Route path="/crop-health" element={
              <ProtectedRoute>
                <CropHealth />
              </ProtectedRoute>
            } />
            <Route path="/crop-recommendation" element={
              <ProtectedRoute>
                <CropRecommendation />
              </ProtectedRoute>
            } />
            <Route path="/field-efficiency" element={
              <ProtectedRoute>
                <FieldEfficiency />
              </ProtectedRoute>
            } />
            <Route path="/harvest-planning" element={
              <ProtectedRoute>
                <HarvestPlanning />
              </ProtectedRoute>
            } />
            <Route path="/about" element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
