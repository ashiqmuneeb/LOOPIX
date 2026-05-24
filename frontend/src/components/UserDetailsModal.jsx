import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Camera, ShieldCheck, BarChart, Lock, Eye, EyeOff, Star, Save } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import api from '../utils/api';

const UserDetailsModal = ({ user, isOpen, onClose, onAction, onResetPass, showToast }) => {
  const [viewMode, setViewMode] = useState('info'); // 'info', 'qr', 'bio'
  const [confirmAction, setConfirmAction] = useState({ open: false, title: '', message: '', endpoint: '', actionName: '', confirmLabel: '', confirmColor: '' });

  if (!isOpen || !user) return null;

  const openConfirm = (endpoint, actionName, title, message, confirmLabel, confirmColor) => {
    setConfirmAction({ open: true, endpoint, actionName, title, message, confirmLabel, confirmColor });
  };

  const handleConfirm = async () => {
    try {
      await api.patch(`/admin/users/${user.id}/${confirmAction.endpoint}`);
      onAction();
      setConfirmAction({ open: false, title: '', message: '', endpoint: '', actionName: '', confirmLabel: '', confirmColor: '' });
      onClose();
    } catch (err) { 
      const msg = err.response?.data?.message || err.message || 'Action failed';
      showToast(`Failed to ${confirmAction.actionName}: ${msg}`, 'error'); 
    }
  };

  const profileUrl = `${window.location.origin}/user_profile/${user.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(profileUrl)}`;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2500, padding: '10px' }}>
      <ConfirmModal
        isOpen={confirmAction.open}
        title={confirmAction.title}
        message={confirmAction.message}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction({ ...confirmAction, open: false })}
      />

      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#f4f7f6', width: '100%', maxWidth: '800px', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', position: 'relative', maxHeight: '95vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'white', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', zIndex: 10, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }}>✕</button>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #4e73df 0%, #224abe 100%)', padding: '40px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '15px', left: '15px', background: '#e74a3b', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={12} /> Admin View
          </div>
          <h2 className="brand-font" style={{ color: 'white', fontSize: 'clamp(20px, 5vw, 32px)', marginBottom: '20px', marginTop: '10px' }}>{user.username}'s Profile</h2>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            {/* QR Toggle */}
            <button onClick={() => setViewMode(viewMode === 'qr' ? 'info' : 'qr')} style={{ width: '60px', height: '60px', borderRadius: '50%', background: viewMode === 'qr' ? 'white' : 'rgba(255,255,255,0.2)', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: viewMode === 'qr' ? '#4e73df' : 'white', cursor: 'pointer', transition: '0.3s' }}>
              <Save size={18} />
              <span style={{ fontSize: '9px', marginTop: '4px', fontWeight: 'bold' }}>QR Code</span>
            </button>

            {/* Profile Pic */}
            <div style={{ width: 'clamp(100px, 20vw, 150px)', height: 'clamp(100px, 20vw, 150px)', borderRadius: '50%', background: 'white', padding: '5px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#eee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(24px, 6vw, 40px)', color: '#4e73df', fontWeight: 'bold' }}>
                {viewMode === 'qr' ? (
                  <img src={qrCodeUrl} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                ) : (
                  user.Profile?.profilePicture ? <img src={user.Profile.profilePicture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.username.substring(0, 2).toUpperCase()
                )}
              </div>
            </div>

            {/* Bio Toggle */}
            <button onClick={() => setViewMode(viewMode === 'bio' ? 'info' : 'bio')} style={{ width: '60px', height: '60px', borderRadius: '50%', background: viewMode === 'bio' ? 'white' : 'rgba(255,255,255,0.2)', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: viewMode === 'bio' ? '#e74a3b' : 'white', cursor: 'pointer', transition: '0.3s' }}>
              <FileText size={18} />
              <span style={{ fontSize: '9px', marginTop: '4px', fontWeight: 'bold' }}>User Bio</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 'clamp(20px, 4vw, 40px)' }}>
          <AnimatePresence mode="wait">
            {viewMode === 'bio' ? (
              <motion.div key="bio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} style={{ background: 'white', padding: '25px', borderRadius: '25px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', minHeight: '200px' }}>
                <h4 style={{ color: '#e74a3b', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={20} /> User Biography</h4>
                <p style={{ color: '#555', lineHeight: '1.8', fontSize: '15px' }}>{user.Profile?.bio || 'This user has not added a bio yet.'}</p>
              </motion.div>
            ) : viewMode === 'analytics' ? (
              <motion.div key="analytics" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ background: 'white', padding: '30px 25px', borderRadius: '25px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', textAlign: 'center', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4 style={{ color: '#8e44ad', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><BarChart size={24} /> Profile Analytics</h4>
                <div style={{ background: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)', padding: '20px', borderRadius: '20px', display: 'inline-block', minWidth: '200px', margin: '0 auto 20px', color: 'white', boxShadow: '0 10px 20px rgba(142, 68, 173, 0.2)' }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', opacity: 0.9 }}>Total Views</div>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{user.Profile?.views || 0}</div>
                </div>
                
                {/* Simulated Bar Graph */}
                <div style={{ marginTop: '10px' }}>
                  <h5 style={{ color: '#555', marginBottom: '15px', fontSize: '14px' }}>Estimated 7-Day Trend</h5>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '10px', height: '120px', padding: '10px 0', borderBottom: '2px solid #eee' }}>
                    {[0.2, 0.5, 0.3, 0.8, 0.6, 0.9, 1.0].map((multiplier, idx) => {
                      const total = user.Profile?.views || 0;
                      const height = total === 0 ? 0 : Math.max(10, Math.floor(multiplier * 100));
                      const value = Math.floor(total > 0 ? (total / 4.3) * multiplier : 0);
                      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                          <div style={{ fontSize: '10px', color: '#888' }}>{value}</div>
                          <div style={{ width: '25px', height: `${height}px`, background: '#8e44ad', borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease', opacity: 0.8 }} />
                          <div style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>{days[idx]}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="info" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  {/* Basic Info */}
                  <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#4e73df', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={18} /> Basic Information</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}><span style={{ color: '#888' }}>Username:</span> <strong>{user.username}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}><span style={{ color: '#888' }}>Email:</span> <strong style={{ wordBreak: 'break-all', textAlign: 'right' }}>{user.email}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}><span style={{ color: '#888' }}>Status:</span> <strong style={{ color: user.isActive ? '#1cc88a' : '#e74a3b' }}>{user.isActive ? 'Active' : 'Inactive'}</strong></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}><span style={{ color: '#888' }}>Joined:</span> <strong>{new Date(user.createdAt).toLocaleDateString()}</strong></div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: '#4e73df', display: 'flex', alignItems: 'center', gap: '10px' }}><Camera size={18} /> Contact Information</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '5px' }}><span style={{ color: '#888' }}>Phone:</span> <strong>{user.Profile?.phoneNumber || 'N/A'}</strong></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <span style={{ color: '#888' }}>Address:</span>
                        <p style={{ fontWeight: 'bold', textAlign: 'right' }}>{user.Profile?.address || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Actions Section */}
                <div style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                  <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#4e73df', display: 'flex', alignItems: 'center', gap: '10px' }}><ShieldCheck size={18} /> Admin Actions</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => setViewMode(viewMode === 'analytics' ? 'info' : 'analytics')} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: viewMode === 'analytics' ? '#6c3483' : '#8e44ad', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <BarChart size={16} /> {viewMode === 'analytics' ? 'Hide Analytics' : 'View Analytics'}
                    </button>
                    <button onClick={onResetPass} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#3498db', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <Lock size={16} /> Reset Password
                    </button>
                    <button onClick={() => openConfirm('toggle-active', user.Profile?.isPublic ? 'hide profile' : 'show profile', user.Profile?.isPublic ? 'Hide Public Profile?' : 'Show Public Profile?', `Are you sure?`, user.Profile?.isPublic ? 'Hide Profile' : 'Show Profile', user.Profile?.isPublic ? '#e67e22' : '#2ecc71')} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: user.Profile?.isPublic ? '#e67e22' : '#2ecc71', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      {user.Profile?.isPublic ? <EyeOff size={16} /> : <Eye size={16} />} {user.Profile?.isPublic ? 'Hide Profile' : 'Show Profile'}
                    </button>
                  </div>
                </div>

                {/* Rating Section */}
                <div style={{ background: 'white', padding: '25px', borderRadius: '25px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#333' }}><Star size={20} fill="#f6c23e" color="#f6c23e" /> User Rating</h4>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{user.Profile?.avgRating || '0.0'} <span style={{ fontSize: '16px', color: '#888' }}>/ 5.0</span></div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginBottom: '8px' }}>
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={20} color={s <= Math.round(user.Profile?.avgRating || 0) ? '#f6c23e' : '#ddd'} fill={s <= Math.round(user.Profile?.avgRating || 0) ? '#f6c23e' : 'none'} />)}
                  </div>
                  <div style={{ color: '#888', fontSize: '12px' }}>{user.Profile?.ratings?.length || 0} ratings</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default UserDetailsModal;
