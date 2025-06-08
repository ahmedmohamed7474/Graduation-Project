import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:3002/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const { user: userData } = await response.json();
        // Set roleId from role.id
        const userWithRole = {
          ...userData,
          roleId: userData.role?.id
        };
        setUser(userWithRole);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3002/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        const userData = {
          ...data.user,
          roleId: data.user.role?.id // Use the actual role ID from the database
        };
        setUser(userData);
        console.log('User data after login:', userData);
        return { success: true, user: userData };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Error connecting to server' };
    }
  };
  const signup = async (userData) => {
    try {
      console.log('Attempting to register with:', { ...userData, password: '****' });
      
      const response = await fetch('http://localhost:3002/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      console.log('Registration response:', data);
      
      if (response.ok) {
        return { success: true, user: data.user };
      } else {
        console.error('Registration failed:', data);
        return { success: false, error: data.message || 'Failed to create account' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Error connecting to server' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
