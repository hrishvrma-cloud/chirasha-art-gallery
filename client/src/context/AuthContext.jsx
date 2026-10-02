import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Default to admin for instant demonstration ease, but can switch anytime
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('art_token') || null);
  const [linkedChildren, setLinkedChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If token exists, load profile
    if (token) {
      fetchProfile(token);
    } else {
      // Default auto-login as Madam (Admin) for immediate seamless demo
      quickLoginAs('admin');
    }
  }, [token]);

  const fetchProfile = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setLinkedChildren(data.children || []);
      } else {
        localStorage.removeItem('art_token');
        setToken(null);
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('art_token', data.token);
    setToken(data.token);
    setCurrentUser(data.user);
    if (data.user.role === 'parent') {
      fetchProfile(data.token);
    }
    return data.user;
  };

  const registerParent = async (formData) => {
    const res = await fetch('/api/auth/register-parent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    localStorage.setItem('art_token', data.token);
    setToken(data.token);
    setCurrentUser(data.user);
    fetchProfile(data.token);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('art_token');
    setToken(null);
    setCurrentUser(null);
    setLinkedChildren([]);
  };

  // 1-Click quick role switcher for testing convenience
  const quickLoginAs = async (role) => {
    setLoading(true);
    try {
      const email = role === 'admin' ? 'admin@artclasses.com' : 'priya@gmail.com';
      const password = role === 'admin' ? 'admin123' : 'parent123';
      await login(email, password);
    } catch (err) {
      console.error('Quick login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      token,
      linkedChildren,
      loading,
      login,
      registerParent,
      logout,
      quickLoginAs
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
