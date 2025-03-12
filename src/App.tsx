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
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import ManufacturerDashboard from "./pages/dashboard/manufacturer";
import DistributorDashboard from "./pages/dashboard/distributor";
import PharmacistDashboard from "./pages/dashboard/pharmacist";
import DoctorDashboard from "./pages/dashboard/doctor";
import { GenerateQR } from "./pages/manufacturer";
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
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />

              {/* Manufacturer Routes */}
              <Route
                path="/dashboard/manufacturer"
                element={
                  <ProtectedRoute allowedRoles={["manufacturer"]}>
                    <ManufacturerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manufacturer/drugs"
                element={
                  <ProtectedRoute allowedRoles={["manufacturer"]}>
                    <ManufacturerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manufacturer/generate-qr"
                element={
                  <ProtectedRoute allowedRoles={["manufacturer"]}>
                    <GenerateQR />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manufacturer/supply-chain"
                element={
                  <ProtectedRoute allowedRoles={["manufacturer"]}>
                    <ManufacturerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manufacturer/reports"
                element={
                  <ProtectedRoute allowedRoles={["manufacturer"]}>
                    <ManufacturerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Distributor Routes */}
              <Route
                path="/dashboard/distributor"
                element={
                  <ProtectedRoute allowedRoles={["distributor"]}>
                    <DistributorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/distributor/shipments"
                element={
                  <ProtectedRoute allowedRoles={["distributor"]}>
                    <DistributorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/distributor/tracking"
                element={
                  <ProtectedRoute allowedRoles={["distributor"]}>
                    <DistributorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/distributor/reports"
                element={
                  <ProtectedRoute allowedRoles={["distributor"]}>
                    <DistributorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Pharmacist Routes */}
              <Route
                path="/dashboard/pharmacist"
                element={
                  <ProtectedRoute allowedRoles={["pharmacist"]}>
                    <PharmacistDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pharmacist/verify"
                element={
                  <ProtectedRoute allowedRoles={["pharmacist"]}>
                    <PharmacistDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pharmacist/inventory"
                element={
                  <ProtectedRoute allowedRoles={["pharmacist"]}>
                    <PharmacistDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pharmacist/shipments"
                element={
                  <ProtectedRoute allowedRoles={["pharmacist"]}>
                    <PharmacistDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pharmacist/reports"
                element={
                  <ProtectedRoute allowedRoles={["pharmacist"]}>
                    <PharmacistDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Doctor Routes */}
              <Route
                path="/dashboard/doctor"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/prescriptions"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/generate-qr"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/patients"
                element={
                  <ProtectedRoute allowedRoles={["doctor"]}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/reports"
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
    </ThemeProvider>
  </AuthProvider>
);

export default App;
