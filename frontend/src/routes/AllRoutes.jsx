import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "../components/LandingPage";
import RegisterPage from "../components/RegisterPage";
import LoginPage from "../components/LoginPage";

const AllRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </>
  );
};

export default AllRoutes;
