import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import api from '../utils/api';

const ResetPasswordModal = ({ user, isOpen, onClose, showToast }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleReset = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      showToast("Passwords do not match!", 'error');
      return;
    }
    setLoading(true);
    try {
      await api.patch(`/admin/users/${user.id}/reset-password`, { newPassword });
      showToast('Password updated successfully!', 'success');
      onClose();
    } catch (err) { showToast('Failed to update password', 'error'); }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', width: '100%', maxWidth: '450px', borderRadius: '20px', padding: '35px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2c3e50' }}>Reset Password for {user.username}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }}>✕</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>New Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }} placeholder="Enter new password" />
            <div onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#999' }}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }} placeholder="Confirm new password" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#e74a3b', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleReset} disabled={loading} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: '#1cc88a', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <div className="loader"></div> : <Lock size={18} />} Reset Password
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordModal;
