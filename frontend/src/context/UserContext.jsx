import { createContext, useEffect, useState } from 'react';

export const UserContext = createContext();

// eslint-disable-next-line react/prop-types
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('accessToken')
  );

  useEffect(() => {
    if (accessToken) {
      fetchUserDetails(accessToken);
    }
  }, [accessToken]);

  const fetchUserDetails = async (token) => {
    if (!token) return; // Prevent fetch if no token

    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      // console.log(data);

      if (data.status === 'success') {
        // console.log(data.data[0]);
        setUser(data.data[0]);
      } else {
        console.error('User fetch failed:', data.message);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const login = (token) => {
    setAccessToken(token);
    localStorage.setItem('accessToken', token);
    fetchUserDetails(token); // Fetch user after login
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  return (
    <UserContext.Provider
      value={{ user, accessToken, login, logout, fetchUserDetails }}
    >
      {children}
    </UserContext.Provider>
  );
};
