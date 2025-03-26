import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext";

import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute

import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmail from "./pages/VerifyEmailPage";
import VerifyOtp from "./pages/VerifyOtpPage";

function App() {
  return (
    <div className="pb-16">
      <ScrollToTop />
      <AllRoutes />
    </div>
  );
}

export default App;
