import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load – if token exists, try to fetch /auth/me
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (enrollment_no, password) => {
    const res = await api.post('/auth/login', { enrollment_no, password });
    const { accessToken, user } = res.data;

    localStorage.setItem('accessToken', accessToken);
    setUser(user);
    return user;
  };

  const signup = async ({ enrollment_no, name, email, password }) => {
    const res = await api.post('/auth/signup', {
      enrollment_no,
      name,
      email,
      password,
    });
    const { accessToken, user } = res.data;

    localStorage.setItem('accessToken', accessToken);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup, // 👈 new
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
