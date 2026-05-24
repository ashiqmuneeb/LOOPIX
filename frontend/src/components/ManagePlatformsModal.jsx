import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, X, Edit2, Trash2, PlusCircle, List } from 'lucide-react';
import api from '../utils/api';
import ConfirmModal from './ConfirmModal';

const ManagePlatformsModal = ({ isOpen, onClose, showToast }) => {
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' or 'add'
  const [platforms, setPlatforms] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    websiteUrl: '',
    label: '',
    isEditing: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'manage') {
      fetchPlatforms();
    }
  }, [isOpen, activeTab]);

  const fetchPlatforms = async () => {
    setLoadingList(true);
    try {
      const res = await api.get('/platforms');
      setPlatforms(res.data);
    } catch (e) {
      showToast('Failed to fetch platforms', 'error');
    } finally {
      setLoadingList(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let domain = formData.websiteUrl.replace('https://', '').replace('http://', '').split('/')[0];
      const payload = {
        id: formData.id,
        name: formData.name,
        label: formData.label,
        icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
        color: '#4e73df' // Default color
      };

      if (formData.isEditing) {
        await api.put(`/platforms/${formData.id}`, payload);
        showToast('Platform updated successfully!', 'success');
      } else {
        await api.post('/platforms', payload);
        showToast('Platform added successfully!', 'success');
      }
      
      setFormData({ id: '', name: '', websiteUrl: '', label: '', isEditing: false });
      setActiveTab('manage');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save platform', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (platform) => {
    // Try to reverse engineer the domain from the icon if it's a favicon url
    let websiteUrl = '';
    if (platform.icon && platform.icon.includes('domain=')) {
      websiteUrl = new URL(platform.icon).searchParams.get('domain') || '';
    }
    
    setFormData({
      id: platform.id,
      name: platform.name,
      websiteUrl: websiteUrl,
      label: platform.label,
      isEditing: true
    });
    setActiveTab('add');
  };

  const handleDeleteRequest = (id) => {
    setConfirmDelete({ open: true, id });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete.id) return;
    try {
      await api.delete(`/platforms/${confirmDelete.id}`);
      showToast('Platform deleted', 'success');
      setConfirmDelete({ open: false, id: null });
      fetchPlatforms();
    } catch (err) {
      showToast('Failed to delete platform', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ background: 'white', borderRadius: '20px', padding: '30px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '20px', color: '#333', fontSize: '22px', fontWeight: 'bold' }}>Manage Platforms</h2>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setActiveTab('manage')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', background: activeTab === 'manage' ? '#4e73df' : '#f8f9fa', color: activeTab === 'manage' ? 'white' : '#666', border: 'none' }}>
                <List size={18} /> Existing
              </button>
              <button onClick={() => { setFormData({ id: '', name: '', websiteUrl: '', label: '', isEditing: false }); setActiveTab('add'); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', background: activeTab === 'add' ? '#1cc88a' : '#f8f9fa', color: activeTab === 'add' ? 'white' : '#666', border: 'none' }}>
                <PlusCircle size={18} /> {formData.isEditing ? 'Edit Platform' : 'Add New'}
              </button>
            </div>

            {activeTab === 'add' ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Platform ID (lowercase, no spaces)</label>
                  <input required disabled={formData.isEditing} type="text" name="id" value={formData.id} onChange={handleChange} placeholder="e.g. discord" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none', background: formData.isEditing ? '#f1f2f6' : 'white' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Display Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Discord" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Website URL (For Icon Extraction)</label>
                  <input required type="text" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} placeholder="e.g. discord.com" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>Input Placeholder Label</label>
                  <input required type="text" name="label" value={formData.label} onChange={handleChange} placeholder="e.g. Discord username" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none' }} />
                </div>

                {formData.websiteUrl && (
                  <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '10px', marginTop: '10px', textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '10px' }}>Icon Preview</span>
                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: 'white', border: '1px solid #eee', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                      <img src={`https://www.google.com/s2/favicons?domain=${formData.websiteUrl.replace('https://', '').replace('http://', '').split('/')[0]}&sz=128`} alt="Preview" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                    </div>
                  </div>
                )}

                <button type="submit" disabled={isLoading} style={{ marginTop: '10px', width: '100%', padding: '14px', background: formData.isEditing ? '#f6c23e' : '#1cc88a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}>
                  {isLoading ? 'Saving...' : formData.isEditing ? 'Update Platform' : 'Add Platform'}
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {loadingList ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Loading platforms...</div>
                ) : (
                  platforms.map(platform => (
                    <div key={platform.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 15px', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {platform.icon && platform.icon.startsWith('http') ? (
                           <img src={platform.icon} alt={platform.name} style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                        ) : (
                           <i className={platform.icon} style={{ color: platform.color, fontSize: '20px' }}></i>
                        )}
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>{platform.name}</div>
                          <div style={{ fontSize: '11px', color: '#888' }}>{platform.id}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleEdit(platform)} style={{ background: 'white', border: '1px solid #ddd', padding: '6px', borderRadius: '6px', color: '#4e73df', cursor: 'pointer' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDeleteRequest(platform.id)} style={{ background: 'white', border: '1px solid #ddd', padding: '6px', borderRadius: '6px', color: '#e74a3b', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    <ConfirmModal 
      isOpen={confirmDelete.open}
      title="Delete Platform"
      message="Are you sure you want to delete this platform? This will remove the platform for all users. This action cannot be undone."
      onConfirm={handleDeleteConfirm}
      onCancel={() => setConfirmDelete({ open: false, id: null })}
      confirmLabel="Delete Platform"
      confirmColor="#e74a3b"
    />
    </>
  );
};

export default ManagePlatformsModal;
