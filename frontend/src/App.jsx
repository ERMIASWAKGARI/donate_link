import { Route, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute
import ScrollToTop from "./components/common/ScrollToTop";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmail from "./pages/VerifyEmailPage";
import VerifyOtp from "./pages/VerifyOtpPage";

import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import NotFoundPage from "./pages/NotFound";

import AdminDashboard from "./pages/admin/Dashboard";

import IndividualDashboard from "./pages/Donor/IndividualDonor/DashboardIndividual";

import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";

import NgoDashboard from "./components/NGO/NgoDashboard";
import DonationForm from "./pages/Donor/OrganizationalDonor/DonationForm";

function App() {
  return (
    <div className="pb-16">
      <UserProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route element={<PrivateRoute />}>
            <Route path="/donor/dashboard" element={<IndividualDashboard />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/ngo/dashboard" element={<NgoDashboard />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route
              path="/volunteer/dashboard"
              element={<VolunteerDashboard />}
            />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/post-donation" element={<DonationForm />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </UserProvider>
    </div>
  );
}

export default App;
