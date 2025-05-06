import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import GlobalErrorHandler from "@/components/GlobalErrorHandler";
import GlobalLoadingIndicator from "@/components/GlobalLoadingIndicator";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CatalogPage from "./pages/CatalogPage";
import CarDetail from "./pages/CarDetail";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCarsPage from "./pages/AdminCarsPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminRolesPage from "./pages/AdminRolesPage";
import AdminAuditLogPage from "./pages/AdminAuditLogPage";
import AdminBackupPage from "./pages/AdminBackupPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <GlobalErrorHandler />
        <GlobalLoadingIndicator />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/car/:id" element={<CarDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Маршруты администратора */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/cars" element={
              <ProtectedRoute adminOnly>
                <AdminCarsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute adminOnly>
                <AdminSettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/roles" element={
              <ProtectedRoute adminOnly>
                <AdminRolesPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/audit" element={
              <ProtectedRoute adminOnly>
                <AdminAuditLogPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/backup" element={
              <ProtectedRoute adminOnly>
                <AdminBackupPage />
              </ProtectedRoute>
            } />
            
            {/* Запасной маршрут для необработанных путей */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;