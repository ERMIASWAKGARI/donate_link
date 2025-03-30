import React from "react";
import { Route, Router, Routes } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import LoginPage from "../../src/pages/LoginPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import VerifyOtpPage from "../pages/VerifyOtpPage";
import PrivateRoute from "../components/PrivateRoute";
import RegisterPage from '../pages/RegisterPage'
import ForgotPassword from '../../src/components/ForgotPassword'
import ResetPassword from '../../src/components/ResetPassword'

import DashboardIndividual from '../pages/Donor/IndividualDonor/DashboardIndividual';
import { UserProvider } from "../context/UserContext";

const AllRoutes = () => {
  return (
    <>
      <UserProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/register" element={<RegisterPage/>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<DashboardIndividual />} />
            </Route>
          </Routes>
       {" "}
      </UserProvider>
    </>
  );
};

export default AllRoutes;
