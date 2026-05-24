import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Save, UserPlus, LogOut, Trash2, Star, CheckCircle, AlertCircle, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import UserModal from '../components/UserModal';
import UserDetailsModal from '../components/UserDetailsModal';
import ResetPasswordModal from '../components/ResetPasswordModal';
import ConfirmModal from '../components/ConfirmModal';
import ManagePlatformsModal from '../components/ManagePlatformsModal';

// --- RECENT ACTIVITY TOAST ---
const RecentActivityToast = ({ users }) => {
  const [visible, setVisible] = useState(true);
  
  const today = new Date().toISOString().split('T')[0];
  const todayUsers = users.filter(u => u.createdAt.startsWith(today));
  const userNames = todayUsers.map(u => u.username).join(', ');

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (todayUsers.length === 0) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 10 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'absolute',
            top: '70px',
            right: '20px',
            zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            padding: '15px 25px',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            border: '1px solid rgba(78, 115, 223, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            minWidth: '300px'
          }}
        >
          <div style={{ background: '#1cc88a', color: 'white', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserPlus size={20} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', color: '#333', fontWeight: 'bold' }}>New Registrations Today</h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
              <strong>{userNames}</strong> joined the platform today.
            </p>
          </div>
          <button onClick={() => setVisible(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '16px', marginLeft: '10px' }}>✕</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, loginsToday: 0, newThisWeek: 0 });
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [isManagePlatformsOpen, setIsManagePlatformsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  const [fetchError, setFetchError] = useState(null);
  const toastAPI = useToast();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const showToast = (message, type = 'success') => {
    if (type === 'error') toastAPI.error(message);
    else if (type === 'info') toastAPI.info(message);
    else toastAPI.success(message);
  };

  const fetchData = async () => {
    try {
      setFetchError(null);
      const [sRes, uRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(sRes.data);
      setUsers(uRes.data);
      if (selectedUser) {
        const updated = uRes.data.find(u => u.id === selectedUser.id);
        if (updated) setSelectedUser(updated);
      }
    } catch (e) { 
      console.log(e);
      setFetchError(e.response?.data?.message || e.message || 'Failed to connect to server');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/users/${confirmDelete.id}`);
      setConfirmDelete({ open: false, id: null });
      fetchData();
    } catch (err) { showToast('Failed to delete user', 'error'); }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleToggleVerify = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/verify`);
      fetchData();
    } catch (err) { showToast('Failed to toggle verification', 'error'); }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Card = ({ title, value, gradient }) => (
    <div style={{
      background: gradient,
      padding: '40px 20px',
      borderRadius: '20px',
      color: 'white',
      textAlign: 'center',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      flex: 1,
      minWidth: '250px'
    }}>
      <h3 style={{ fontSize: '18px', marginBottom: '10px', opacity: 0.9 }}>{title}</h3>
      <div style={{ fontSize: '48px', fontWeight: 'bold' }}>{value}</div>
    </div>
  );

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/users/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Failed to export CSV: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', padding: '0', position: 'relative', color: '#333' }}>
      <UserModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingUser(null); }}
        onUserCreated={fetchData}
        editingUser={editingUser}
        showToast={showToast}
      />
      <UserDetailsModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onAction={fetchData}
        onResetPass={() => setIsResetPassOpen(true)}
        showToast={showToast}
      />
      <ResetPasswordModal
        user={selectedUser}
        isOpen={isResetPassOpen}
        onClose={() => setIsResetPassOpen(false)}
        showToast={showToast}
      />
      <ConfirmModal
        isOpen={confirmDelete.open}
        title="Delete Customer?"
        message="This will permanently remove the user and all their profile data. Are you sure?"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        confirmLabel="Delete User"
        confirmColor="#e74a3b"
      />
      <ManagePlatformsModal
        isOpen={isManagePlatformsOpen}
        onClose={() => setIsManagePlatformsOpen(false)}
        showToast={showToast}
      />
      {/* Header */}
      <div style={{ background: '#4e73df', padding: '15px clamp(15px, 4vw, 30px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', flexWrap: 'wrap', gap: '15px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={24} />
          <h2 style={{ fontSize: 'clamp(18px, 4vw, 20px)', fontWeight: 'bold' }}>Admin Dashboard</h2>
        </div>
        <div style={{ display: 'flex', gap: 'clamp(10px, 2vw, 20px)', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleExport} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}>
            <Save size={16} /> <span className="hide-mobile">Export</span>
          </button>
          <button onClick={() => setIsManagePlatformsOpen(true)} style={{ background: '#1cc88a', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px' }}>
            <PlusSquare size={18} /> <span className="hide-mobile">Manage Platforms</span>
          </button>
          <button onClick={() => { setEditingUser(null); setIsModalOpen(true); }} style={{ background: 'white', border: 'none', color: '#4e73df', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px' }}>
            <UserPlus size={18} /> <span className="hide-mobile">Add User</span>
          </button>
          <button onClick={() => { logout(); navigate('/login'); }} style={{ background: 'transparent', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', opacity: 0.9, fontSize: '13px' }}>
            <LogOut size={18} /> <span className="hide-mobile">Logout</span>
          </button>
        </div>
        <RecentActivityToast users={users} />
      </div>

      {fetchError && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '15px 30px', borderBottom: '1px solid #f5c6cb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span><strong>Error:</strong> {fetchError}</span>
          <button onClick={fetchData} style={{ background: '#721c24', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Try Again</button>
        </div>
      )}

      {/* Content Area */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(20px, 4vw, 40px) 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Stats Section */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Card title="Total Customers" value={stats.totalUsers} gradient="linear-gradient(135deg, #4e73df 0%, #224abe 100%)" />
          <Card title="Logins Today" value={stats.loginsToday} gradient="linear-gradient(135deg, #1cc88a 0%, #13855c 100%)" />
          <Card title="New This Week" value={stats.newThisWeek} gradient="linear-gradient(135deg, #f6c23e 0%, #dda20a 100%)" />
          <Card title="Total Profile Views" value={stats.totalViews || 0} gradient="linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)" />
        </div>

        {/* User Listing Section */}
        <div style={{ width: '100%' }}>
          {/* User Listing Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
            <h3 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 'bold', color: '#4e73df' }}>Customer Directory</h3>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search customers..."
                style={{ padding: '10px 15px 10px 40px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none', width: '250px' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#999' }}>
                <Save size={16} />
              </div>
            </div>
          </div>

          {/* User Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredUsers.map(user => (
              <motion.div key={user.id} onClick={() => setSelectedUser(user)} whileHover={{ y: -5 }} style={{ background: 'white', border: '1px solid #e3e6f0', borderRadius: '20px', padding: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', position: 'relative', cursor: 'pointer' }}>
                {user.Profile?.avgRating && (
                  <div style={{ position: 'absolute', top: '20px', right: '20px', background: '#f8f9fc', padding: '5px 10px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 'bold', color: '#f6c23e' }}>
                    <Star size={14} fill="#f6c23e" /> {user.Profile.avgRating}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#4e73df', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
                    {user.Profile?.profilePicture ? (
                      <img src={user.Profile.profilePicture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      user.username.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#2c3e50' }}>{user.username}</div>
                      {user.Profile?.isVerified && <ShieldCheck size={16} color="#4e73df" />}
                    </div>
                    <div style={{ fontSize: '12px', color: '#95a5a6' }}>Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                    <Save size={14} /> {user.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* UserIcon needs to be imported, replacing with Save for now to avoid error, wait I imported User from lucide-react */}
                    <UserPlus size={14} /> {user.Profile?.phoneNumber || 'No Phone'}
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ color: user.Profile?.isPublic ? '#1cc88a' : '#e74a3b', fontWeight: 'bold', fontSize: '12px' }}>
                      {user.Profile?.isPublic ? '● Profile Public' : '● Profile Hidden'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleEdit(user)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #4e73df', background: 'white', color: '#4e73df', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Edit Profile</button>
                  <button onClick={() => handleToggleVerify(user.id)} style={{ padding: '10px', borderRadius: '10px', border: 'none', background: user.Profile?.isVerified ? '#f1f2f6' : '#ebf3ff', color: user.Profile?.isVerified ? '#7f8c8d' : '#4e73df', cursor: 'pointer' }}>
                    <ShieldCheck size={18} />
                  </button>
                  <button onClick={() => setConfirmDelete({ open: true, id: user.id })} style={{ padding: '10px', borderRadius: '10px', border: 'none', background: '#fff5f5', color: '#ff4757', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
