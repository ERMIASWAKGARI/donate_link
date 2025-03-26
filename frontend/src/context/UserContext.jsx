import { createContext, useEffect, useState } from 'react';

// Create the context
export const UserContext = createContext();

// eslint-disable-next-line react/prop-types
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // For user data
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('accessToken')
  ); // Access token from localStorage

  // Check if the token is available and get user details
  useEffect(() => {
    if (accessToken) {
      // You can make an API call here to fetch the user data if you have an endpoint for that
      fetchUserDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUser(data.data.user);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const login = (token, userData) => {
    setAccessToken(token);
    setUser(userData);
    console.log(userData);
    localStorage.setItem('accessToken', token);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  return (
    <UserContext.Provider value={{ user, accessToken, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
