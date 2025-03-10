import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/home/Index";
import NotFound from "./pages/home/NotFound";
import SignUp from "./pages/auth/SignUp";
import SignIn from "./pages/auth/SignIn";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import ManufacturerDashboard from "./pages/dashboard/manufacturer";
import DistributorDashboard from "./pages/dashboard/distributor";
import PharmacistDashboard from "./pages/dashboard/pharmacist";
import DoctorDashboard from "./pages/dashboard/doctor";
import { UserRole } from "@/utils/types";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/manufacturer/dashboard"
              element={
                <ProtectedRoute allowedRoles={["manufacturer"]}>
                  <ManufacturerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/distributor/dashboard"
              element={
                <ProtectedRoute allowedRoles={["distributor"]}>
                  <DistributorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pharmacist/dashboard"
              element={
                <ProtectedRoute allowedRoles={["pharmacist"]}>
                  <PharmacistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
