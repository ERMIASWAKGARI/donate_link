import React from "react";
import { Route, Router, Routes } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import VerifyOtpPage from "../pages/VerifyOtpPage";
import PrivateRoute from "../components/PrivateRoute";
import RegisterPage from "../pages/RegisterPage";
import DashboardIndividual from "../pages/Donor/IndividualDonor/DashboardIndividual";
import { UserProvider } from "../context/UserContext";
import NgoDashboard from "../components/NGO/NgoDashboard";
const AllRoutes = () => {
  return (
    <>
      <UserProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/ngo-dashboard" element={<NgoDashboard />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardIndividual />} />
          </Route>
        </Routes>{" "}
      </UserProvider>
    </>
  );
};

export default AllRoutes;
