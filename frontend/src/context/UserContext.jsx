import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('accessToken')
  );
  const [loading, setLoading] = useState(!!accessToken);
  const [isAuthenticating, setIsAuthenticating] = useState(false); // New state

  useEffect(() => {
    if (accessToken && !user) {
      fetchUserDetails(accessToken);
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchUserDetails = async (token) => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.status === 'success') {
        setUser(data.data[0]);
      } else {
        console.error('User fetch failed:', data.message);
        logout(); // Clear invalid token
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      logout(); // Clear invalid token
    } finally {
      setLoading(false);
      setIsAuthenticating(false);
    }
  };

  const login = (token) => {
    setIsAuthenticating(true); // Mark authentication start
    setAccessToken(token);
    localStorage.setItem('accessToken', token);
    fetchUserDetails(token);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    setIsAuthenticating(false);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        loading,
        isAuthenticating,
      }}
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
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
