import { GoogleOAuthProvider } from "@react-oauth/google";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { UserProvider } from "./context/UserContext"; // Import the provider

import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Router>
      <UserProvider>
      <GoogleOAuthProvider clientId="1021431617656-ngngp6r2q4q2b53f12vio2pjq85hjsgj.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>{" "}
    </UserProvider>
    </Router>
  </StrictMode>
);
