import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      setAuthState({
        token,
        user: JSON.parse(user),
        isAuthenticated: true,
      });
    }
  }, []);

  const login = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({
      token,
      user,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  };

  const isAdmin = authState.user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ ...authState, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
