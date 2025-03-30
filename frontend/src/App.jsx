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

import Footer from "./components/common/Footer";
import Header from "./components/common/Header";
import AllRoutes from "./routes/AllRoutes";
import Header_for_indDonor from "../src/pages/Donor/IndividualDonor/Header_for_indDonor";
import Header_for_Organizationdonor from "./pages/Donor/OrganizationalDonor/Header_for_Organizationdonor";

function App() {
  return (
    <div>
      <ScrollToTop />
      <AllRoutes />
      <Footer />
    </div>
  );
}

export default App;
