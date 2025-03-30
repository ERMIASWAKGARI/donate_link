import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute

import ScrollToTop from "./components/common/ScrollToTop";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmail from "./pages/VerifyEmailPage";
import VerifyOtp from "./pages/VerifyOtpPage";
import NgoDashboard from "./components/NGO/NgoDashboard";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

function App() {
  return (
    <div className="pb-16">
      <UserProvider>
        <Router>
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
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<PrivateRoute />}>
              <Route path="/ngo-dashboard" element={<NgoDashboard />} />
            </Route>
          </Routes>
        </Router>{" "}
      </UserProvider>
    </div>
  );
}

export default App;
