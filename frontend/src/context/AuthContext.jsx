import React, { createContext, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const register = async (email, password, first_name, last_name) => {
    try {
      console.log('🔄 Starting registration for:', email);
      setLoading(true);
      setError(null);
      
      console.log('📤 Sending registration request to backend...');
      const response = await api.post('/users/register', {
        email,
        password,
        first_name,
        last_name
      });
      
      console.log('✅ Registration successful:', response.data);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      console.error('❌ Registration error caught:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: err.response?.data?.message,
        code: err.response?.data?.code,
        data: err.response?.data,
        fullError: err.message
      });

      // Extract detailed error message from response
      let errorMsg = 'Registration failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.statusText) {
        errorMsg = `Registration failed: ${err.response.statusText}`;
      } else if (err.message === 'Network Error') {
        errorMsg = 'Network error. Please check if the server is running on http://localhost:5000';
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Cannot connect to server. Please ensure backend is running.';
      }
      
      console.log('📝 Setting error state with:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔄 Starting login for:', email);
      setLoading(true);
      setError(null);
      
      console.log('📤 Sending login request to backend...');
      const response = await api.post('/users/login', { email, password });
      
      console.log('✅ Login successful:', response.data);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      console.error('❌ Login error caught:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        message: err.response?.data?.message,
        code: err.response?.data?.code,
        data: err.response?.data,
        fullError: err.message
      });

      // Extract detailed error message from response
      let errorMsg = 'Login failed. Please try again.';
      
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.statusText) {
        errorMsg = `Login failed: ${err.response.statusText}`;
      } else if (err.message === 'Network Error') {
        errorMsg = 'Network error. Please check if the server is running on http://localhost:5000';
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Cannot connect to server. Please ensure backend is running.';
      }
      
      console.log('📝 Setting error state with:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
