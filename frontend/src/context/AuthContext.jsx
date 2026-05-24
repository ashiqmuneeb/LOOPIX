import React, { useState, useEffect, useContext } from 'react';

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (savedUser && savedUser !== 'undefined') {
      try { 
        setUser(JSON.parse(savedUser)); 
      } catch (e) { 
        localStorage.removeItem('user'); 
        sessionStorage.removeItem('user'); 
      }
    }
    setLoading(false);
  }, []);

  const login = (u, t, remember = false) => { 
    setUser(u); 
    setToken(t); 
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(u)); 
    storage.setItem('token', t); 
  };

  const logout = () => { 
    setUser(null); 
    setToken(null); 
    localStorage.clear(); 
    sessionStorage.clear(); 
  };

  // Background Rotation Logic
  useEffect(() => {
    let isDark = false;
    const interval = setInterval(() => {
      isDark = !isDark;
      if (isDark) document.body.classList.add('dark-mode');
      else document.body.classList.remove('dark-mode');
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
