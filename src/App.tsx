import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import { ParentLayout } from "./components/parent/ParentLayout";
import ParentDashboard from "./pages/parent/ParentDashboard";
import FamilyMembers from "./pages/parent/FamilyMembers";
import Activities from "./pages/parent/Activities";
import Communication from "./pages/parent/Communication";
import Documents from "./pages/parent/Documents";
import Delegation from "./pages/parent/Delegation";
import { YouthLayout } from "./components/youth/YouthLayout";
import YouthDashboard from "./pages/youth/YouthDashboard";
import YouthCalendar from "./pages/youth/YouthCalendar";
import YouthAnnouncements from "./pages/youth/YouthAnnouncements";
import YouthFeedback from "./pages/youth/YouthFeedback";
import YouthDocuments from "./pages/youth/YouthDocuments";
import YouthFamilies from "./pages/youth/YouthFamilies";
import { ChurchLayout } from "./components/church/ChurchLayout";
import ChurchDashboard from "./pages/church/ChurchDashboard";
import ChurchRecommendations from "./pages/church/ChurchRecommendations";
import ChurchFamilies from "./pages/church/ChurchFamilies";
import ChurchReports from "./pages/church/ChurchReports";
import ChurchCalendar from "./pages/church/ChurchCalendar";
import ChurchPerformance from "./pages/church/ChurchPerformance";
import ChurchEndorsements from "./pages/church/ChurchEndorsements";
import PrayerChain from "./pages/church/PrayerChain";
import ChangePassword from "./pages/ChangePassword";
import ActivationSuccess from "./pages/ActivationSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/activation-success" element={<ActivationSuccess />} />
            <Route
              path="/parent/*"
              element={
                <ProtectedRoute allowedRoles={["Père", "Mère"]}>
                  <ParentLayout>
                    <Routes>
                      <Route index element={<ParentDashboard />} />
                      <Route path="members" element={<FamilyMembers />} />
                      <Route path="activities" element={<Activities />} />
                      <Route path="communication" element={<Communication />} />
                      <Route path="documents" element={<Documents />} />
                      <Route path="delegation" element={<Delegation />} />
                    </Routes>
                  </ParentLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/youth/*"
              element={
                <ProtectedRoute allowedRoles={["Other"]}>
                  <YouthLayout>
                    <Routes>
                      <Route index element={<YouthDashboard />} />
                      <Route path="calendar" element={<YouthCalendar />} />
                      <Route
                        path="announcements"
                        element={<YouthAnnouncements />}
                      />
                      <Route path="feedback" element={<YouthFeedback />} />
                      <Route path="documents" element={<YouthDocuments />} />
                      <Route path="families" element={<YouthFamilies />} />
                    </Routes>
                  </YouthLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/church/*"
              element={
                <ProtectedRoute allowedRoles={["Pastor"]}>
                  <ChurchLayout>
                    <Routes>
                      <Route index element={<ChurchDashboard />} />
                      <Route path="families" element={<ChurchFamilies />} />
                      <Route path="prayer-chain" element={<PrayerChain />} />
                      <Route path="reports" element={<ChurchReports />} />
                      <Route path="calendar" element={<ChurchCalendar />} />
                      <Route
                        path="recommendations"
                        element={<ChurchRecommendations />}
                      />
                      <Route
                        path="performance"
                        element={<ChurchPerformance />}
                      />
                      <Route
                        path="endorsements"
                        element={<ChurchEndorsements />}
                      />
                    </Routes>
                  </ChurchLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout>
                    <UserManagement />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/access-codes"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout>
                    <div className="p-6">Access Codes (Coming Soon)</div>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout>
                    <div className="p-6">Reports (Coming Soon)</div>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
