import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import CreateVideoPage from "@/pages/CreateVideoPage";
import EditVideosPage from "@/pages/EditVideosPage";
import MyPromptsPage from "@/pages/MyPromptsPage";
import SettingsPage from "@/pages/SettingsPage";
import ViralSyncPage from "@/pages/ViralSyncPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/produtos" element={<ProductsPage />} />
            <Route path="/criar-video" element={<CreateVideoPage />} />
            <Route path="/editar-videos" element={<EditVideosPage />} />
            <Route path="/meus-prompts" element={<MyPromptsPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
            <Route path="/viral-sync" element={<ViralSyncPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
