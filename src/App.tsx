
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
import { ProfileProvider } from "./hooks/useProfiles";

const queryClient = new QueryClient();

// Wrapper component to add ProfileProvider with router access
const AppWithProviders = () => {
  return (
    <ProfileProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profiles" element={<ProfilesPage />} />
        <Route path="/channels" element={<ChannelsPage />} />
        <Route path="/player/:channelId" element={<PlayerPage />} />
        <Route path="/epg" element={<EPGPage />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ProfileProvider>
  );
};

const App = () => (
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

export default App;
