import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);
      if (token && userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          await AsyncStorage.multiRemove(['token', 'user']);
        }
      }
    } catch {}
    setLoading(false);
  };

  const login = async (mobile, password) => {
    const { data } = await authAPI.login({ mobile, password });
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (formData) => {
    const { data } = await authAPI.register(formData);
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
