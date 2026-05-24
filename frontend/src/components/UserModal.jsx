import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import api from '../utils/api';

const UserModal = ({ isOpen, onClose, onUserCreated, editingUser = null, showToast }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', phone: '', address: '', bio: '', profilePicture: '' });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        username: editingUser.username,
        email: editingUser.email,
        password: '', // Don't show password for edit
        phone: editingUser.Profile?.phoneNumber || '',
        address: editingUser.Profile?.address || '',
        bio: editingUser.Profile?.bio || '',
        profilePicture: editingUser.Profile?.profilePicture || ''
      });
      setPreviewUrl(editingUser.Profile?.profilePicture || null);
    } else {
      setFormData({ username: '', email: '', password: '', phone: '', address: '', bio: '', profilePicture: '' });
      setPreviewUrl(null);
    }
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) return setStep(2);
    setLoading(true);
    try {
      let finalPicUrl = formData.profilePicture;

      if (imageFile) {
        const data = new FormData();
        data.append('file', imageFile);
        const uploadRes = await api.post('/uploads/file', data);
        finalPicUrl = uploadRes.data.url;
      }

      if (editingUser) {
        await api.put(`/admin/users/${editingUser.id}`, { ...formData, profilePicture: finalPicUrl });
      } else {
        await api.post('/admin/users', { ...formData, profilePicture: finalPicUrl });
      }

      onUserCreated();
      onClose();
      setStep(1);
    } catch (err) {
      setLoading(false);
      showToast(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'rgba(255,255,255,0.95)', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <h2 className="brand-font" style={{ marginBottom: '10px', textAlign: 'center' }}>{editingUser ? 'Edit Customer' : (step === 1 ? 'Step 1: Account' : 'Step 2: Profile')}</h2>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: '#4e73df' }} />
          <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: step === 2 ? '#4e73df' : '#ddd' }} />
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Username" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }} value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
              <input type="email" placeholder="Email Address" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
              {!editingUser && (
                <input type="password" placeholder="Password" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid #4e73df' }}>
                  {previewUrl ? <img src={previewUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={30} color="#999" />}
                </div>
                <label style={{ background: '#f8f9fc', padding: '8px 15px', borderRadius: '8px', border: '1px dashed #4e73df', cursor: 'pointer', fontSize: '14px', color: '#4e73df' }}>
                  {editingUser ? 'Change Photo' : 'Choose Profile Pic'}
                  <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                </label>
              </div>
              <input type="text" placeholder="Phone Number" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              <input type="text" placeholder="Address" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              <textarea placeholder="Bio" style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none', minHeight: '80px' }} value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button type="button" onClick={() => step === 2 ? setStep(1) : onClose()} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>{step === 2 ? 'Back' : 'Cancel'}</button>
            <button type="submit" style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: '#4e73df', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Processing...' : (step === 1 ? 'Next Step' : (editingUser ? 'Update User' : 'Create User'))}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserModal;
