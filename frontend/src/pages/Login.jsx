import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('rememberedEmail') ? true : false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('rememberedEmail');
    if (saved) setEmail(saved);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (rememberMe) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');

      setIsSuccess(true);
      setTimeout(() => {
        login(res.data.user, res.data.token, rememberMe);
        if (res.data.user.role === 'superadmin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-wrapper">
      <AnimatePresence>
        {!isSuccess ? (
          <motion.div key="form" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }} className="glass-login-form">
            <div className="meta-logo-wrapper"><img src="/images/loopix_logo.png" alt="Logo" className="meta-logo" /></div>
            <div className="loopix-text">LOOPIX</div>
            {error && <div style={{ color: '#ff4d4d', fontSize: '13px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}><AlertCircle size={14} /> {error}</div>}
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <div className="glass-field"><input type="text" placeholder="Email or Username" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
              <div className="password-container">
                <div className="glass-field"><input type={showPassword ? "text" : "password"} placeholder="Password" className={password.length > 0 && password.length < 6 ? 'error' : (password.length >= 6 ? 'success' : '')} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                <div className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</div>
              </div>
              <div className="login-extras"><label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember me</label></div>
              <div className="glass-btn"><button type="submit" disabled={isLoading}>{isLoading ? <><span className="loader"></span> Verifying...</> : 'Login'}</button></div>
            </form>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#eee', opacity: 0.8 }}>Connect with friends around you</p>
              <p style={{ margin: '5px 0 0', fontSize: '11px', color: '#ddd', opacity: 0.6 }}>© DOLMA Labz</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', color: 'white' }}>
            <CheckCircle size={80} color="#10b981" style={{ marginBottom: '1rem' }} />
            <h2 className="brand-font" style={{ fontSize: '2rem' }}>Welcome Back!</h2>
            <p style={{ color: '#ccc' }}>Redirecting to your dashboard...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
