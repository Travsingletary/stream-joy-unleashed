import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EPGPage from "./pages/EPGPage";
import LoginPage from "./pages/LoginPage";
import ProfilesPage from "./pages/ProfilesPage";
import ChannelsPage from "./pages/ChannelsPage";
import PlayerPage from "./pages/PlayerPage";
import AdminNotifyPage from "./pages/AdminNotifyPage";
import VerifyPurchasePage from "./pages/VerifyPurchasePage";
import { ProfileProvider } from "./hooks/useProfiles";
import { NotificationPrompt } from "./components/notification/NotificationPrompt";
import PurchaseProtectedRoute from "./components/auth/PurchaseProtectedRoute";
import ImportPage from './pages/ImportPage';

const queryClient = new QueryClient();

// Wrapper component to add ProfileProvider with router access
const AppWithProviders = () => {
  return (
    <ProfileProvider>
      <NotificationPrompt />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/verify-purchase" element={<VerifyPurchasePage />} />
        
        {/* Protected Routes */}
        <Route element={<PurchaseProtectedRoute />}>
          <Route path="/channels" element={<ChannelsPage />} />
          <Route path="/player/:channelId" element={<PlayerPage />} />
          <Route path="/epg" element={<EPGPage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/admin/notify" element={<AdminNotifyPage />} />
        </Route>
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ProfileProvider>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppWithProviders />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
