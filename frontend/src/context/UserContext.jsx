import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken")
  );

  useEffect(() => {
    if (accessToken) {
      fetchUserDetails(accessToken);
    }
  }, [accessToken]);

  const fetchUserDetails = async (token) => {
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5000/api/users/me", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.status === "success") {
        setUser(data.data[0]);
      } else {
        console.error("User fetch failed:", data.message);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const login = (token) => {
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
    fetchUserDetails(token);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
  };

  return (
    <UserContext.Provider
      value={{ user, accessToken, login, logout, fetchUserDetails }}
    >
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Add this custom hook for consuming the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
