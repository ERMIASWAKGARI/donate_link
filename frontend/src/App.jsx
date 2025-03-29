import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute

import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmail from "./pages/VerifyEmailPage";
import VerifyOtp from "./pages/VerifyOtpPage";
import ScrollToTop from "./components/common/ScrollToTop";
import DonationForm from "./pages/organization_donor/DonationForm";

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
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route path="/donation-form" element={<DonationForm />} />
          </Routes>
        </Router>{" "}
      </UserProvider>
    </div>
  );
}

export default App;
