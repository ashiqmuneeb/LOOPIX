import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import api from '../utils/api';

const ChangePasswordModal = ({ isOpen, onClose, showToast }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      showToast('Password updated successfully!', 'success');
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update password', 'error');
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(16px)', width: '100%', maxWidth: '400px', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '20px' }}>Change Password</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <input type={showCurrent ? "text" : "password"} placeholder="Current Password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
            <div onClick={() => setShowCurrent(!showCurrent)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <input type={showNew ? "text" : "password"} placeholder="New Password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
            <div onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}>
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: '#007bff', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Processing...' : 'Update Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePasswordModal;
