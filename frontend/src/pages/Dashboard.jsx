import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogOut, Camera, Save, User as UserIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ChangePasswordModal from '../components/ChangePasswordModal';

// --- PLATFORM ROW (DRAGGABLE) ---
const PlatformRow = ({ platform, socialValues, handleLinkChange, handleReset }) => {
  const dragControls = useDragControls();
  
  return (
    <Reorder.Item 
      value={platform}
      dragListener={false}
      dragControls={dragControls}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px', 
        marginBottom: '15px',
        listStyle: 'none'
      }}
    >
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        style={{ 
          width: '36px', 
          height: '36px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'white', 
          borderRadius: '50%', 
          flexShrink: 0, 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          cursor: 'grab',
          userSelect: 'none',
          touchAction: 'none'
        }}
        title="Drag to reorder"
      >
        {platform.icon && platform.icon.startsWith('http') ? (
          <img src={platform.icon} alt={platform.id} draggable={false} style={{ width: '20px', height: '20px', borderRadius: '4px', pointerEvents: 'none' }} />
        ) : (
          <i className={platform.icon} style={{ color: platform.color, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></i>
        )}
      </div>
      <input 
        type="text" 
        placeholder={platform.label} 
        value={socialValues[platform.id] || ''} 
        onChange={e => handleLinkChange(platform.id, e.target.value)} 
        className="glass-input"
      />
      <button 
        onClick={() => handleReset(platform.id)} 
        style={{ background: '#dc3545', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
      >
        Reset
      </button>
    </Reorder.Item>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [activeStatus, setActiveStatus] = useState(true);
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  const [platformList, setPlatformList] = useState([]);

  const [expandedPlatform, setExpandedPlatform] = useState(null);
  const toastAPI = useToast();
  const showToast = (message, type = 'success') => {
    if (type === 'error') toastAPI.error(message);
    else if (type === 'info') toastAPI.info(message);
    else toastAPI.success(message);
  };
  
  const [isEditingBio, setIsEditingBio] = useState(false);
  
  const handleBioEditToggle = async () => {
    if (isEditingBio) {
      try {
        await api.put('/profiles/me', { bio, bioStyle: isBold ? 'bold' : 'normal', isPublic: activeStatus });
        showToast('Bio saved successfully!', 'success');
        setIsEditingBio(false);
      } catch (e) {
        showToast('Failed to save bio', 'error');
      }
    } else {
      setIsEditingBio(true);
    }
  };

  const [socialValues, setSocialValues] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [docNames, setDocNames] = useState({ aadhaar: 'No file chosen', resume: 'No file chosen', driversLicense: 'No file chosen' });
  const [docLocks, setDocLocks] = useState({ aadhaar: false, resume: false, driversLicense: false });

  const getRawValue = (platform, url) => {
    if (!url) return '';
    const name = platform.toLowerCase();
    
    if (['googlepay', 'phonepay', 'paytm'].includes(name)) {
      return url.replace("upi://pay?pa=", "");
    } else if (name === 'instagram' || name === 'insta2') {
      return url.replace("https://instagram.com/", "").replace(/^@/, "");
    } else if (name === 'facebook') {
      return url.replace("https://facebook.com/", "");
    } else if (name === 'gmail') {
      return url.replace("mailto:", "");
    } else if (name === 'phone') {
      return url.replace("tel:", "");
    } else if (name === 'whatsapp' || name === 'whatsappb') {
      return url.replace("https://wa.me/", "").replace("+", "").replace(/\s+/g, "");
    } else if (name === 'telegram') {
      return url.replace("https://t.me/", "").replace(/^@/, "");
    } else if (name === 'linkedin') {
      return url.replace("https://linkedin.com/in/", "").replace("https://linkedin.com/", "");
    } else if (name === 'twitter') {
      return url.replace("https://twitter.com/", "").replace("https://x.com/", "").replace(/^@/, "");
    } else if (name === 'sharechat') {
      return url.replace("https://sharechat.com/profile/", "").replace("https://sharechat.com/", "");
    } else if (name === 'snapchat') {
      return url.replace("https://snapchat.com/add/", "").replace("https://snapchat.com/", "");
    } else if (name === 'pinterest') {
      return url.replace("https://pinterest.com/", "");
    } else if (name === 'messenger') {
      return url.replace("https://m.me/", "");
    } else if (name === 'threads') {
      return url.replace("https://threads.net/@", "").replace("https://threads.net/", "");
    } else if (name === 'youtube') {
      return url.replace("https://youtube.com/@", "").replace("https://youtube.com/", "");
    } else if (name === 'github') {
      return url.replace("https://github.com/", "");
    } else if (name === 'behance') {
      return url.replace("https://behance.net/", "").replace("https://www.behance.net/", "");
    }
    return url;
  };

  const getFormattedValue = (platform, value) => {
    const val = (value || '').trim();
    if (!val) return '';
    const name = platform.toLowerCase();
    
    if (['googlepay', 'phonepay', 'paytm'].includes(name)) {
      return val.startsWith('upi://pay?pa=') ? val : `upi://pay?pa=${val}`;
    } else if (name === 'instagram' || name === 'insta2') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://instagram.com/${val.replace(/^@/, '')}`;
    } else if (name === 'facebook') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://facebook.com/${val}`;
    } else if (name === 'gmail') {
      return val.startsWith('mailto:') ? val : `mailto:${val}`;
    } else if (name === 'phone') {
      return val.startsWith('tel:') ? val : `tel:${val}`;
    } else if (name === 'whatsapp' || name === 'whatsappb') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://wa.me/${val.replace('+', '').replace(/\s+/g, '')}`;
    } else if (name === 'telegram') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://t.me/${val.replace(/^@/, '')}`;
    } else if (name === 'linkedin') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://linkedin.com/in/${val}`;
    } else if (name === 'twitter') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://x.com/${val.replace(/^@/, '')}`;
    } else if (name === 'sharechat') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://sharechat.com/profile/${val}`;
    } else if (name === 'snapchat') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://snapchat.com/add/${val}`;
    } else if (name === 'pinterest') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://pinterest.com/${val}`;
    } else if (name === 'messenger') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://m.me/${val}`;
    } else if (name === 'threads') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://threads.net/@${val.replace(/^@/, '')}`;
    } else if (name === 'youtube') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://youtube.com/@${val.replace(/^@/, '')}`;
    } else if (name === 'github') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://github.com/${val.replace(/^@/, '')}`;
    } else if (name === 'behance') {
      return (val.startsWith('http://') || val.startsWith('https://')) ? val : `https://behance.net/${val.replace(/^@/, '')}`;
    }
    return val;
  };

  useEffect(() => {
    Promise.all([
      api.get('/profiles/me'),
      api.get('/platforms')
    ]).then(([profileRes, platformsRes]) => {
      let currentPlatforms = platformsRes.data || [];
      
      setProfile(profileRes.data); 
      setBio(profileRes.data.bio || ''); 
      setIsBold(profileRes.data.bioStyle === 'bold'); 
      setActiveStatus(profileRes.data.isPublic);
      setDocLocks({
        aadhaar: profileRes.data.aadhaarLocked || false,
        resume: profileRes.data.resumeLocked || false,
        driversLicense: profileRes.data.driversLicenseLocked || false
      });
      
      const values = {};
      if (profileRes.data.socialLinks) {
        const sortedLinks = [...profileRes.data.socialLinks].sort((a, b) => (a.position || 0) - (b.position || 0));
        
        const orderedList = [];
        const existingPlatforms = new Set();
        sortedLinks.forEach(link => {
          const found = currentPlatforms.find(p => p.id === link.platform);
          if (found) {
            orderedList.push(found);
            existingPlatforms.add(link.platform);
          }
        });
        currentPlatforms.forEach(p => {
          if (!existingPlatforms.has(p.id)) {
            orderedList.push(p);
          }
        });
        setPlatformList(orderedList);

        profileRes.data.socialLinks.forEach(link => {
          values[link.platform] = getRawValue(link.platform, link.url);
        });
      }
      setSocialValues(values);
      
      // Also update docNames with existing filenames from database if present
      const getFilename = (url) => {
        if (!url) return 'No file chosen';
        const parts = url.split('/');
        return parts[parts.length - 1];
      };
      setDocNames({
        aadhaar: getFilename(profileRes.data.aadhaar),
        resume: getFilename(profileRes.data.resume),
        driversLicense: getFilename(profileRes.data.driversLicense)
      });
      setIsLoaded(true);
    }).catch(e => console.log(e));
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const timer = setTimeout(async () => {
      try {
        for (let index = 0; index < platformList.length; index++) {
          const platform = platformList[index];
          const val = socialValues[platform.id] || '';
          const formattedVal = getFormattedValue(platform.id, val);
          await api.post('/social/social', { platform: platform.id, url: formattedVal, position: index });
        }
        console.log("Positions auto-saved successfully!");
      } catch (err) {
        console.error("Auto-save ordering failed:", err);
      }
    }, 1000); // 1-second debounce to allow drag action to finish cleanly

    return () => clearTimeout(timer);
  }, [platformList, isLoaded]);

  const toggleDocLock = async (docId) => {
    const newLockStatus = !docLocks[docId];
    setDocLocks(prev => ({ ...prev, [docId]: newLockStatus }));
    try {
      await api.put('/profiles/me', { [`${docId}Locked`]: newLockStatus });
      showToast(`${docId === 'driversLicense' ? "Driver's License" : docId.charAt(0).toUpperCase() + docId.slice(1)} ${newLockStatus ? 'locked (hidden from profile)' : 'unlocked (shown on profile)'} successfully!`, 'success');
    } catch (e) {
      showToast('Failed to update privacy status', 'error');
      setDocLocks(prev => ({ ...prev, [docId]: !newLockStatus }));
    }
  };

  const handleSaveLinks = async () => {
    try { 
      await api.put('/profiles/me', { bio, bioStyle: isBold ? 'bold' : 'normal', isPublic: activeStatus }); 
      
      for (let index = 0; index < platformList.length; index++) {
        const platform = platformList[index];
        const val = socialValues[platform.id] || '';
        const formattedVal = getFormattedValue(platform.id, val);
        await api.post('/social/social', { platform: platform.id, url: formattedVal, position: index });
      }
      
      showToast('Saved Successfully!', 'success'); 
    } catch (e) { showToast('Failed to save', 'error'); }
  };

  const handleToggleActive = async () => {
    const newStatus = !activeStatus;
    setActiveStatus(newStatus);
    try {
      await api.put('/profiles/me', { isPublic: newStatus });
      showToast(`Profile is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}!`, 'success');
    } catch (e) {
      setActiveStatus(!newStatus);
      showToast('Failed to update active status', 'error');
    }
  };

  const handleLinkChange = (id, value) => {
    setSocialValues(prev => ({ ...prev, [id]: value }));
  };

  const handleReset = (id) => {
    setSocialValues(prev => ({ ...prev, [id]: '' }));
  };

  const handleFileUpload = async (fieldType, file) => {
    if (!file) return;
    
    // File size validation rule: max 2MB
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      showToast('File size must be under 2MB!', 'error');
      return;
    }

    setDocNames(prev => ({ ...prev, [fieldType]: file.name }));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldType', fieldType);
    try {
      const res = await api.post('/uploads/file', formData);
      if (fieldType === 'profilePicture') {
        setProfile(prev => ({ ...prev, profilePicture: res.data.url }));
      }
      showToast('Uploaded ' + fieldType + ' successfully!', 'success');
    } catch (e) {
      showToast('Upload failed', 'error');
    }
  };

  const filteredPlatforms = platformList.filter(p => 
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass-wrapper" style={{ display: 'block', padding: '20px', minHeight: '100vh', color: '#333' }}>
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} showToast={showToast} />
      
      <div className="glass-login-form" style={{ maxWidth: '600px', margin: '0 auto', display: 'block', position: 'relative' }}>
        
        {/* Top Header Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => setPasswordModalOpen(true)} style={{ background: '#3498db', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <Lock size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: activeStatus ? '#2ecc71' : '#e74a3b', padding: '5px 15px', borderRadius: '20px' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>{activeStatus ? 'ACTIVE' : 'INACTIVE'}</span>
            <div onClick={handleToggleActive} style={{ width: '36px', height: '20px', borderRadius: '10px', background: 'white', position: 'relative', cursor: 'pointer' }}>
               <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: activeStatus ? '#2ecc71' : '#e74a3b', position: 'absolute', top: '2px', left: activeStatus ? '18px' : '2px', transition: '0.2s' }} />
            </div>
          </div>
          
          <button onClick={() => { logout(); navigate('/login'); }} style={{ background: '#e74a3b', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
            <LogOut size={20} />
          </button>
        </div>

        <h2 className="brand-font" style={{ textAlign: 'center', marginBottom: '20px', color: '#fff', textShadow: '0 0 15px rgba(255,255,255,0.2)' }}>Manage Your Links</h2>
        
        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
          <label style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%', position: 'relative' }}>
            <img 
              src={profile?.profilePicture || '/images/default-profile.png'} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)', transition: 'transform 0.3s ease' }} 
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
            <div style={{ position: 'absolute', bottom: '5px', right: '5px', background: '#3498db', borderRadius: '50%', padding: '8px', display: 'flex', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
              <Camera size={16} color="white" />
            </div>
            <input type="file" hidden onChange={e => handleFileUpload('profilePicture', e.target.files[0])} />
          </label>
        </div>
                <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <button 
              onClick={handleBioEditToggle}
              style={{ 
                background: isEditingBio ? '#2ecc71' : '#3498db', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                padding: '5px 15px', 
                fontSize: '13px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '5px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'background 0.3s'
              }}
            >
              {isEditingBio ? (
                <>
                  <i className="fas fa-save"></i> Save Bio
                </>
              ) : (
                <>
                  <i className="fas fa-edit"></i> Edit Bio
                </>
              )}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#fff' }}>
               <div onClick={() => setIsBold(!isBold)} style={{ width: '40px', height: '20px', borderRadius: '10px', background: isBold ? '#3498db' : 'rgba(255,255,255,0.3)', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: isBold ? '22px' : '2px', transition: '0.2s' }} />
               </div>
               Bold
            </div>
          </div>
          <textarea 
            value={bio} 
            onChange={(e) => setBio(e.target.value)} 
            readOnly={!isEditingBio}
            placeholder="Click 'Edit Bio' to type your profile bio here..."
            style={{ 
              width: '100%', 
              minHeight: '100px', 
              background: isEditingBio ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)', 
              border: isEditingBio ? '1px solid #3498db' : '1px solid rgba(255,255,255,0.15)', 
              borderRadius: '10px', 
              color: isEditingBio ? '#fff' : '#ccc', 
              padding: '15px', 
              fontWeight: isBold ? 'bold' : 'normal', 
              outline: 'none',
              cursor: isEditingBio ? 'text' : 'default',
              transition: 'all 0.3s ease'
            }} 
          />
        </div>
        
        <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
          <button onClick={handleSaveLinks} style={{ flex: 1, padding: '12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', cursor: 'pointer' }}><Save size={18} /> Save Links</button>
          <button onClick={() => navigate(`/user_profile/${user?.id}`)} style={{ flex: 1, padding: '12px', background: '#e67e22', color: 'white', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', cursor: 'pointer' }}><UserIcon size={18} /> View Profile</button>
        </div>

        {/* Sleek Search Input */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}></i>
          <input
            type="text"
            placeholder="Search platforms (e.g. GitHub, Instagram...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 15px 12px 42px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}
            onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Social Links & Upload Documents (Unified Scrollable Container) */}
        <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px', marginBottom: '30px' }} className="custom-scrollbar">
          {searchQuery ? (
            <Reorder.Group 
              axis="y" 
              values={filteredPlatforms} 
              onReorder={() => {}} 
              style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0px' }}
            >
              {filteredPlatforms.map((platform) => (
                <PlatformRow 
                  key={platform.id} 
                  platform={platform} 
                  socialValues={socialValues} 
                  handleLinkChange={handleLinkChange} 
                  handleReset={handleReset} 
                />
              ))}
              {filteredPlatforms.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                  <i className="fas fa-search" style={{ fontSize: '28px', marginBottom: '12px', display: 'block', color: 'rgba(255,255,255,0.3)' }}></i>
                  No matching platforms found.
                </div>
              )}
            </Reorder.Group>
          ) : (
            <Reorder.Group 
              axis="y" 
              values={platformList} 
              onReorder={setPlatformList} 
              style={{ listStyleType: 'none', padding: 0, margin: 0 }}
            >
              {platformList.map((platform) => (
                <PlatformRow 
                  key={platform.id} 
                  platform={platform} 
                  socialValues={socialValues} 
                  handleLinkChange={handleLinkChange} 
                  handleReset={handleReset} 
                />
              ))}
            </Reorder.Group>
          )}

          {/* Upload Documents Section */}
          <div style={{ marginTop: '25px', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '20px', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>Upload Documents</h3>
            {[
              { id: 'aadhaar', icon: 'fas fa-id-card', color: '#3498db' },
              { id: 'resume', icon: 'fas fa-file-alt', color: '#1abc9c' },
              { id: 'driversLicense', icon: 'fas fa-car', color: '#fd7e14' }
            ].map((doc, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', background: 'rgba(255,255,255,0.08)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                
                <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
                  {/* Circular White Container for Icon */}
                  <div 
                    onClick={() => toggleDocLock(doc.id)}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      background: 'white', 
                      borderRadius: '50%', 
                      cursor: 'pointer', 
                      boxShadow: docLocks[doc.id] ? '0 4px 6px rgba(0,0,0,0.1), 0 0 0 2px #dc3545' : '0 4px 6px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                    title={docLocks[doc.id] ? "Locked (Hidden from public profile). Click to unlock." : "Unlocked (Shown on public profile). Click to lock."}
                  >
                    <i className={doc.icon} style={{ color: doc.color, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}></i>
                  </div>
                  
                  {/* Absolute Centered Lock Overlay */}
                  {docLocks[doc.id] && (
                    <div 
                      onClick={() => toggleDocLock(doc.id)}
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        background: 'rgba(220, 53, 69, 0.15)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: 'inset 0 0 6px rgba(220, 53, 69, 0.3)',
                        cursor: 'pointer'
                      }}
                      title="Locked (Hidden from public profile). Click to unlock."
                    >
                      <Lock size={16} color="#dc3545" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))' }} />
                    </div>
                  )}
                </div>

                <label style={{ background: 'rgba(0, 123, 255, 0.3)', border: '1px solid rgba(0, 123, 255, 0.5)', color: 'white', padding: '8px 15px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  Choose File
                  <input type="file" hidden onChange={e => handleFileUpload(doc.id, e.target.files[0])} />
                </label>
                <span style={{ flex: 1, fontSize: '13px', color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{docNames[doc.id]}</span>
                <button onClick={() => setDocNames(prev => ({ ...prev, [doc.id]: 'No file chosen' }))} style={{ background: '#e74a3b', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}>Reset</button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
