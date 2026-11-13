import { createContext, useEffect, useState } from 'react';
import { getCsrfCookie, getCurrentUser, loginUser, logoutUser, registerUser } from '../api/auth';

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed the CSRF cookie, then check if a session is already active (e.g. after a page refresh).
    getCsrfCookie()
      .then(() => getCurrentUser())
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const loggedInUser = await loginUser(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (data) => {
    const newUser = await registerUser(data); // backend auto-logs-in on register
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
