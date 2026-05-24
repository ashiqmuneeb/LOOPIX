import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Camera, Save, User as UserIcon, ShieldCheck, FileText, CreditCard, Lock, Unlock, Star, Trash2, MapPin, Search, AlertCircle, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// --- PUBLIC USER PROFILE VIEW ---
const UserProfile = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [platformsMap, setPlatformsMap] = useState({});
  const [userRating, setUserRating] = useState(() => {
    return parseInt(localStorage.getItem(`rated_profile_${id}`)) || 0;
  });
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [upiModal, setUpiModal] = useState(null);
  const [zoomPic, setZoomPic] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [glassTheme, setGlassTheme] = useState('dark');
  const toastAPI = useToast();
  const [loadingNearby, setLoadingNearby] = useState(null);
  const [nearbyMapData, setNearbyMapData] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [showSaveLocationNoteModal, setShowSaveLocationNoteModal] = useState(false);
  const [tempCoords, setTempCoords] = useState(null);
  const [tempNote, setTempNote] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const showProfileToast = (msg, type = 'info') => {
    if (type === 'error') toastAPI.error(msg);
    else if (type === 'success') toastAPI.success(msg);
    else toastAPI.info(msg);
  };

  const themeStyles = {
    dark: {
      bg: 'rgba(15, 23, 42, 0.75)',
      border: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      textSecondary: '#cbd5e1',
      textBio: '#f1f5f9',
      bioBg: 'rgba(255, 255, 255, 0.08)',
      bioBorder: 'rgba(255, 255, 255, 0.05)',
      boxBg: 'rgba(255, 255, 255, 0.11)',
      boxBorder: 'rgba(255, 255, 255, 0.15)',
      circleBtnBg: 'rgba(255, 255, 255, 0.12)',
      circleBtnBorder: 'rgba(255, 255, 255, 0.08)',
      circleBtnColor: '#ffffff',
      shadow: 'rgba(0, 0, 0, 0.35)'
    },
    light: {
      bg: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(0, 0, 0, 0.08)',
      text: '#1e293b',
      textSecondary: '#475569',
      textBio: '#334155',
      bioBg: 'rgba(0, 0, 0, 0.04)',
      bioBorder: 'rgba(0, 0, 0, 0.03)',
      boxBg: 'rgba(0, 0, 0, 0.06)',
      boxBorder: 'rgba(0, 0, 0, 0.1)',
      circleBtnBg: 'rgba(0, 0, 0, 0.05)',
      circleBtnBorder: 'rgba(0, 0, 0, 0.05)',
      circleBtnColor: '#1e293b',
      shadow: 'rgba(0, 0, 0, 0.08)'
    }
  };
  const theme = themeStyles[glassTheme];

  const getGuestKey = () => {
    let key = localStorage.getItem('guest_session_key');
    if (!key) {
      key = 'guest_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('guest_session_key', key);
    }
    return key;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const viewedProfiles = JSON.parse(localStorage.getItem('viewedProfiles') || '{}');
        const now = new Date().getTime();
        const isNewView = !viewedProfiles[id] || (now - viewedProfiles[id] > 24 * 60 * 60 * 1000);

        const [res, platformsRes] = await Promise.all([
          api.get(`/profiles/${id}?trackView=${isNewView}`),
          api.get('/platforms')
        ]);
        
        const map = {};
        if (platformsRes.data) {
          platformsRes.data.forEach(p => {
            map[p.id] = { icon: p.icon, color: p.color, name: p.name };
          });
        }
        setPlatformsMap(map);
        setProfile(res.data);
        
        if (res.data && res.data.isPublic && isNewView) {
          viewedProfiles[id] = now;
          localStorage.setItem('viewedProfiles', JSON.stringify(viewedProfiles));
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load profile');
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  // Removed 3D tilt effect as requested

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '40px 20px', position: 'relative' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes shimmer {
            0% { background-position: -1000px 0; }
            100% { background-position: 1000px 0; }
          }
          .skeleton {
            background: rgba(255,255,255,0.05);
            background-image: linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.08) 150px, rgba(255,255,255,0.02) 300px);
            background-size: 1000px 100%;
            animation: shimmer 2s infinite linear;
            border-radius: 12px;
          }
          body.dark-mode .skeleton {
            background-image: linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.15) 150px, rgba(255,255,255,0.05) 300px);
          }
        `}} />
        <div style={{ background: theme.bg, backdropFilter: 'blur(16px)', border: `1px solid ${theme.border}`, borderRadius: '28px', padding: '40px', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div className="skeleton" style={{ width: '150px', height: '24px', borderRadius: '12px' }}></div>
          <div style={{ display: 'flex', gap: '15px', width: '100%', justifyContent: 'center', marginTop: '10px' }}>
             <div className="skeleton" style={{ width: '50px', height: '50px', borderRadius: '50%' }}></div>
             <div className="skeleton" style={{ width: '120px', height: '120px', borderRadius: '50%' }}></div>
             <div className="skeleton" style={{ width: '50px', height: '50px', borderRadius: '50%' }}></div>
          </div>
          <div className="skeleton" style={{ width: '100%', height: '80px', marginTop: '20px', borderRadius: '16px' }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', width: '100%', marginTop: '10px' }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ aspectRatio: '1/1', borderRadius: '18px' }}></div>)}
          </div>
          <div className="skeleton" style={{ width: '100%', height: '150px', marginTop: '10px', borderRadius: '16px' }}></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'white', padding: '20px' }}>
        <AlertCircle size={48} style={{ marginBottom: '15px', color: '#ff4757' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Profile Not Found</h2>
        <p style={{ color: '#ccc', marginTop: '10px' }}>{error || 'The requested profile does not exist.'}</p>
      </div>
    );
  }

  // Check if private
  const isOwner = user?.id === profile.id || user?.id === parseInt(id);
  const isAdmin = user?.role === 'superadmin';
  if (!profile.isPublic && !isOwner && !isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: 'white', padding: '20px' }}>
        <Lock size={48} style={{ marginBottom: '15px', color: '#f1c40f' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Profile is Private</h2>
        <p style={{ color: '#ccc', marginTop: '10px' }}>This profile is currently hidden from the public.</p>
      </div>
    );
  }

  // Sort links by saved position
  const sortedLinks = [...(profile.socialLinks || [])].sort((a, b) => a.position - b.position);

  const handleRate = async (rating) => {
    if (isOwner) {
      showProfileToast('You cannot rate your own profile!');
      return;
    }
    if (userRating > 0) {
      showProfileToast('You have already rated this profile!');
      return;
    }
    try {
      const res = await api.post('/social/rate', {
        profileId: profile.id,
        rating,
        sessionKey: getGuestKey()
      });
      setUserRating(rating);
      localStorage.setItem(`rated_profile_${id}`, rating);
      setProfile(prev => ({
        ...prev,
        avgRating: res.data.averageRating,
        ratingCount: (prev.ratingCount || 0) + 1
      }));
      showProfileToast('Thank you for rating!');
    } catch (e) {
      showProfileToast('Failed to submit. You might have already rated this profile.');
      // If it failed because they already rated, let's at least visually lock it
      setUserRating(rating);
      localStorage.setItem(`rated_profile_${id}`, rating);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleOpenNearby = (placeType) => {
    setLoadingNearby(placeType);
    const API_KEY = profile?.GOOGLE_MAPS_API_KEY || 'AIzaSyA1XGaXj7m2FzhQEv5FdWSfaA6qI30IbMA';

    const openEmbeddedMap = (lat, lng, isFallback = false) => {
      setLoadingNearby(null);
      if (isFallback) {
        showProfileToast(`Location access denied. Searching near ${profile?.User?.username || 'user'}'s location instead.`);
      }
      let targetUrl;
      if (lat && lng) {
        targetUrl = `https://www.google.com/maps/search/nearest+${encodeURIComponent(placeType)}/@${lat},${lng},15z`;
      } else {
        targetUrl = `https://www.google.com/maps/search/nearest+${encodeURIComponent(placeType)}`;
      }
      window.open(targetUrl, '_blank');
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          openEmbeddedMap(latitude, longitude, false);
        },
        (error) => {
          console.warn("Geolocation failed", error);
          if (profile?.latitude && profile?.longitude) {
            openEmbeddedMap(profile.latitude, profile.longitude, true);
          } else {
            openEmbeddedMap(null, null, true);
          }
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      if (profile?.latitude && profile?.longitude) {
        openEmbeddedMap(profile.latitude, profile.longitude, true);
      } else {
        openEmbeddedMap(null, null, true);
      }
    }
  };

  const handleStartSaveLocation = () => {
    if (navigator.geolocation) {
      showProfileToast('Fetching precise location...', 'info');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTempCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setTempNote(profile.locationNote || "");
          setIsMapOpen(false); // Close background map modal if open
          setShowSaveLocationNoteModal(true);
        },
        (error) => {
          showProfileToast('Geolocation failed. Please enable location services.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      showProfileToast('Geolocation is not supported by your browser.');
    }
  };

  const submitSaveLocation = async () => {
    try {
      const res = await api.put('/profiles/me', {
        latitude: tempCoords.latitude,
        longitude: tempCoords.longitude,
        locationNote: tempNote
      });
      setProfile(prev => ({ ...prev, latitude: tempCoords.latitude, longitude: tempCoords.longitude, locationNote: tempNote }));
      showProfileToast('📍 Location saved successfully!');
      setShowSaveLocationNoteModal(false);
      setIsMapOpen(true);
    } catch (e) {
      showProfileToast('Failed to save location.');
    }
  };

  const handleResetLocation = async () => {
    setShowResetConfirm(true);
  };

  const confirmResetLocation = async () => {
    try {
      const res = await api.put('/profiles/me', {
        latitude: null,
        longitude: null,
        locationNote: ""
      });
      setProfile(prev => ({ ...prev, latitude: null, longitude: null, locationNote: "" }));
      showProfileToast('Location reset successfully!');
      setShowResetConfirm(false);
      setIsMapOpen(false);
    } catch (e) {
      showProfileToast('Failed to reset location.');
      setShowResetConfirm(false);
    }
  };

  const handleGetDirections = () => {
    showProfileToast('Getting your location for directions...', 'info');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const originLat = position.coords.latitude;
          const originLng = position.coords.longitude;
          const url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${profile.latitude},${profile.longitude}`;
          window.open(url, '_blank');
        },
        (error) => {
          showProfileToast('Could not get your location. Opening directions without origin.');
          const url = `https://www.google.com/maps/dir/?api=1&destination=${profile.latitude},${profile.longitude}`;
          window.open(url, '_blank');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${profile.latitude},${profile.longitude}`;
      window.open(url, '_blank');
    }
  };

  const profileUrl = window.location.href;
  const profileQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(profileUrl)}`;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '40px 20px', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
      {/* Background Glows for Premium Aesthetic */}
      <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(78,115,223,0.2) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(28,200,138,0.18) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(70px)', zIndex: 0, pointerEvents: 'none' }} />
      
      <style key={glassTheme} dangerouslySetInnerHTML={{__html: `
        .profile-container {
          background: ${theme.bg};
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid ${theme.border};
          border-radius: 28px;
          padding: 40px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 20px 50px ${theme.shadow};
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          z-index: 2;
          color: ${theme.text};
          transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
        }
        .profile-title {
          font-weight: 700;
          color: ${theme.text};
          margin-bottom: 25px;
          font-size: clamp(20px, 5vw, 24px);
          letter-spacing: -0.5px;
          transition: color 0.3s ease;
        }
        .profile-title span {
          font-weight: 800;
          background: linear-gradient(135deg, #00bfff 0%, #007bff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .profile-buttons {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 24px;
          margin-bottom: 30px;
          width: 100%;
        }
        .profile-circle-btn {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: ${theme.circleBtnBg};
          border: 1px solid ${theme.circleBtnBorder};
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          color: ${theme.circleBtnColor};
        }
        .profile-circle-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 191, 255, 0.25);
          background: ${theme.circleBtnBg};
          opacity: 0.85;
        }
        .profile-circle-btn i {
          color: ${theme.circleBtnColor} !important;
        }
        .profile-avatar-btn {
          width: 115px;
          height: 115px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid ${theme.border};
          outline: 3px solid #1cc88a;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          background: ${theme.bioBg};
        }
        .profile-avatar-btn:hover {
          transform: scale(1.04);
          outline-color: #17a673;
        }
        .profile-bio-box {
          width: 100%;
          background: ${theme.bioBg};
          border: 1px solid ${theme.bioBorder};
          border-radius: 16px;
          padding: 16px 20px;
          color: ${theme.textBio};
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 30px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
          transition: background 0.3s ease, color 0.3s ease;
        }
        .profile-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          width: 100%;
          margin-bottom: 30px;
        }
        @media (max-width: 480px) {
          .profile-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        @media (max-width: 360px) {
          .profile-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .profile-icon-box {
          aspect-ratio: 1/1;
          border-radius: 18px;
          background: ${theme.boxBg};
          border: 1px solid ${theme.boxBorder};
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px ${glassTheme === 'dark' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.05)'}, 
                      inset 0 1px 1px ${glassTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)'};
          text-decoration: none;
        }
        .profile-icon-box:hover {
          transform: translateY(-5px) scale(1.05);
          background: ${glassTheme === 'dark' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.9)'};
          border-color: var(--hover-border, rgba(0, 191, 255, 0.4));
          box-shadow: var(--hover-shadow, 0 12px 24px rgba(0, 0, 0, 0.2));
        }
        .profile-icon-box i {
          font-size: 28px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .profile-icon-box:hover i {
          transform: scale(1.15);
        }
        .profile-icon-box.upi-box {
          position: relative;
        }
        .profile-icon-box.upi-box span {
          font-size: 10px;
          font-weight: bold;
          margin-top: 4px;
        }
        .profile-docs {
          width: 100%;
          margin-bottom: 30px;
          text-align: left;
        }
        .profile-docs-title {
          font-size: 12px;
          font-weight: 700;
          color: ${theme.textSecondary};
          text-transform: uppercase;
          margin-bottom: 12px;
          letter-spacing: 1px;
          text-align: center;
          transition: color 0.3s ease;
        }
        .profile-doc-item {
          display: flex;
          align-items: center;
          gap: 14px;
          background: ${theme.boxBg};
          border: 1px solid ${theme.boxBorder};
          padding: 12px 16px;
          border-radius: 14px;
          margin-bottom: 10px;
          text-decoration: none;
          color: ${theme.text};
          transition: all 0.2s ease;
        }
        .profile-doc-item:hover {
          background: ${glassTheme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'};
          transform: translateX(4px);
        }
        .profile-rating-section {
          width: 100%;
          padding-top: 25px;
          border-top: 1px solid ${theme.border};
          margin-bottom: 20px;
        }
        .profile-rating-stars {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 12px;
        }
        .profile-rating-stars button {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #94a3b8;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .profile-rating-stars button:hover {
          transform: scale(1.2);
        }
        .profile-rating-stars button.active {
          color: #f6c23e;
          filter: drop-shadow(0 0 8px rgba(246, 194, 62, 0.5));
        }
        .theme-toggle-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${theme.circleBtnBg};
          border: 1px solid ${theme.circleBtnBorder};
          color: ${theme.text};
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.3s;
          z-index: 10;
        }
        .theme-toggle-btn:hover {
          background: ${glassTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
          transform: rotate(15deg);
        }
        .floating-nearby-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          padding: 8px 16px;
          border-radius: 20px;
          background: ${theme.circleBtnBg};
          border: 1px solid ${theme.circleBtnBorder};
          color: ${theme.text};
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s;
          z-index: 10;
          font-size: 13px;
          font-weight: 600;
        }
        .floating-nearby-btn:hover {
          background: ${glassTheme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'};
          transform: translateY(-2px);
        }
        .profile-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        }
        .profile-modal-content {
          background: ${theme.bg};
          border: 1px solid ${theme.border};
          padding: 30px;
          border-radius: 20px;
          width: 90%;
          max-width: 500px;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          color: ${theme.text};
        }
        .profile-modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: ${theme.textSecondary};
          transition: color 0.2s;
        }
        .profile-modal-close:hover {
          color: #dc3545;
        }
      `}} />

      <div className="profile-container">
        <button 
          className="theme-toggle-btn" 
          onClick={() => setGlassTheme(prev => prev === 'dark' ? 'light' : 'dark')}
          title="Toggle Theme"
        >
          {glassTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {isOwner && (
          <button 
            className="floating-nearby-btn" 
            onClick={() => navigate('/dashboard')}
            title="Back to Dashboard"
            style={{ left: '20px', right: 'auto' }}
          >
            <i className="fas fa-arrow-left"></i> Dashboard
          </button>
        )}

        <h1 className="profile-title">
          <span>{profile.User?.username}</span>'s Links
        </h1>

        <div className="profile-buttons">
          <button className="profile-circle-btn" onClick={() => setIsQrOpen(true)}>
            <i className="fas fa-qrcode"></i>
          </button>
          
          <div className="profile-avatar-btn" onClick={() => { if(profile.profilePicture) setZoomPic(true); }}>
            <img 
              src={profile.profilePicture || '/images/default-profile.png'} 
              alt="Profile" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          <button className="profile-circle-btn" onClick={() => setIsMapOpen(true)}>
            <i className="fas fa-map-marker-alt"></i>
          </button>
        </div>

        {profile.bio && (
          <div className="profile-bio-box" style={{ fontWeight: profile.bioStyle === 'bold' ? 'bold' : 'normal' }}>
            {profile.bio}
          </div>
        )}

        <div className="profile-grid">
          {sortedLinks.map(link => {
            const platformInfo = platformsMap[link.platform];
            if (!platformInfo) return null;
            
            const isUpi = ['googlepay', 'phonepay', 'paytm'].includes(link.platform);

            if (isUpi) {
              return (
                <div 
                  key={link.id} 
                  className="profile-icon-box upi-box"
                  onClick={() => setUpiModal({ id: link.url, url: link.url, name: platformInfo.name, color: platformInfo.color })}
                  style={{ '--hover-border': platformInfo.color, '--hover-shadow': `0 12px 24px ${platformInfo.color}40` }}
                >
                  {platformInfo.icon && platformInfo.icon.startsWith('http') ? (
                    <img src={platformInfo.icon} alt={platformInfo.name} style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
                  ) : (
                    <i className={platformInfo.icon} style={{ color: platformInfo.color }}></i>
                  )}
                </div>
              );
            }

            return (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="profile-icon-box"
                style={{ '--hover-border': platformInfo.color, '--hover-shadow': `0 12px 24px ${platformInfo.color}40` }}
              >
                {platformInfo.icon && platformInfo.icon.startsWith('http') ? (
                  <img src={platformInfo.icon} alt={platformInfo.name} style={{ width: '28px', height: '28px', borderRadius: '4px', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                ) : (
                  <i className={platformInfo.icon} style={{ color: platformInfo.color }}></i>
                )}
              </a>
            );
          })}
        </div>

        {/* Documents Section */}
        {((profile.aadhaar && !profile.aadhaarLocked) || 
          (profile.resume && !profile.resumeLocked) || 
          (profile.driversLicense && !profile.driversLicenseLocked)) && (
          <div className="profile-docs">
            <h4 className="profile-docs-title">Public Documents</h4>
            {profile.aadhaar && !profile.aadhaarLocked && (
              <a href={profile.aadhaar} target="_blank" rel="noopener noreferrer" className="profile-doc-item">
                <i className="fas fa-id-card" style={{ color: '#3498db', fontSize: '20px', width: '24px', textAlign: 'center' }}></i>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>ID Document</div>
                  <div style={{ fontSize: '12px', color: theme.textSecondary }}>View Document</div>
                </div>
                <i className="fas fa-external-link-alt" style={{ color: theme.textSecondary, fontSize: '12px' }}></i>
              </a>
            )}
            {profile.resume && !profile.resumeLocked && (
              <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="profile-doc-item">
                <i className="fas fa-file-alt" style={{ color: '#1abc9c', fontSize: '20px', width: '24px', textAlign: 'center' }}></i>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Resume / CV</div>
                  <div style={{ fontSize: '12px', color: theme.textSecondary }}>View Document</div>
                </div>
                <i className="fas fa-external-link-alt" style={{ color: theme.textSecondary, fontSize: '12px' }}></i>
              </a>
            )}
            {profile.driversLicense && !profile.driversLicenseLocked && (
              <a href={profile.driversLicense} target="_blank" rel="noopener noreferrer" className="profile-doc-item">
                <i className="fas fa-car" style={{ color: '#fd7e14', fontSize: '20px', width: '24px', textAlign: 'center' }}></i>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold' }}>Driver's License</div>
                  <div style={{ fontSize: '12px', color: theme.textSecondary }}>View Document</div>
                </div>
                <i className="fas fa-external-link-alt" style={{ color: theme.textSecondary, fontSize: '12px' }}></i>
              </a>
            )}
          </div>
        )}

        <div className="profile-rating-section">
          <div style={{ fontSize: '14px', color: theme.textSecondary, fontWeight: '600' }}>
            Average Rating: <span style={{ color: '#f6c23e', fontWeight: 'bold', fontSize: '16px' }}>{parseFloat(profile.avgRating || 0).toFixed(1)}</span> ({profile.ratingCount || 0} reviews)
          </div>
          <div className="profile-rating-stars" onMouseLeave={() => setHoverRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                onClick={() => handleRate(star)}
                onMouseEnter={() => !isOwner && setHoverRating(star)}
                className={(hoverRating || userRating) >= star ? 'active' : ''}
                style={{ cursor: isOwner ? 'not-allowed' : 'pointer', opacity: isOwner ? 0.6 : 1 }}
                title={isOwner ? "You cannot rate your own profile" : `Rate ${star} stars`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Nearby Places Section */}
        <div style={{ width: '100%', marginBottom: '20px' }}>
          <h4 className="profile-docs-title">Find Nearby</h4>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => handleOpenNearby('Restaurants')} style={{ padding: '8px 12px', background: theme.boxBg, border: `1px solid ${theme.boxBorder}`, borderRadius: '10px', color: theme.text, cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-utensils" style={{ color: '#e74a3b' }}></i> Restaurants
            </button>
            <button onClick={() => handleOpenNearby('Hotels')} style={{ padding: '8px 12px', background: theme.boxBg, border: `1px solid ${theme.boxBorder}`, borderRadius: '10px', color: theme.text, cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-hotel" style={{ color: '#f6c23e' }}></i> Hotels
            </button>
            <button onClick={() => handleOpenNearby('Hospitals')} style={{ padding: '8px 12px', background: theme.boxBg, border: `1px solid ${theme.boxBorder}`, borderRadius: '10px', color: theme.text, cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-hospital" style={{ color: '#1cc88a' }}></i> Hospitals
            </button>
            <button onClick={() => handleOpenNearby('ATMs')} style={{ padding: '8px 12px', background: theme.boxBg, border: `1px solid ${theme.boxBorder}`, borderRadius: '10px', color: theme.text, cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-money-bill" style={{ color: '#36b9cc' }}></i> ATMs
            </button>
          </div>
        </div>

        {/* Footer Section (Matching Django App) */}
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: `1px solid ${theme.border}`, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: theme.text, marginBottom: '15px' }}>Connect With Us</h4>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <a href="https://www.facebook.com/profile.php?id=61571148917172" target="_blank" rel="noopener noreferrer" className="footer-social-icon" style={{ background: 'white', color: '#333', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none', transition: 'transform 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://x.com/DolmaLeaves" target="_blank" rel="noopener noreferrer" className="footer-social-icon" style={{ background: 'white', color: '#333', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none', transition: 'transform 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
              <i className="fab fa-twitter"></i>
            </a>
            <a href="https://www.instagram.com/dolma_labz?igsh=MTY2aDM2MTFyem1tdw==" target="_blank" rel="noopener noreferrer" className="footer-social-icon" style={{ background: 'white', color: '#333', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none', transition: 'transform 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://youtube.com/@cybertechcreation?si=jbHW9_Vx2MxCmfN5" target="_blank" rel="noopener noreferrer" className="footer-social-icon" style={{ background: 'white', color: '#333', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', textDecoration: 'none', transition: 'transform 0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
              <i className="fab fa-youtube"></i>
            </a>
          </div>

          <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: theme.textSecondary, textDecoration: 'underline', fontSize: '12px', marginBottom: '8px' }}>
            Terms & Conditions
          </a>
          <div style={{ fontSize: '11px', color: theme.textSecondary, opacity: 0.8 }}>
            © 2026 DOLMA Labz
          </div>
        </div>
      </div>

      {/* Picture Zoom Modal */}
      {zoomPic && profile.profilePicture && (
        <div className="profile-modal-overlay" onClick={() => setZoomPic(false)}>
          <button className="profile-modal-close" onClick={() => setZoomPic(false)} style={{ top: '20px', right: '20px', color: 'white' }}>×</button>
          <img src={profile.profilePicture} alt="Profile Zoom" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* QR Code Modal */}
      {isQrOpen && (
        <div className="profile-modal-overlay" onClick={() => setIsQrOpen(false)}>
          <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={() => setIsQrOpen(false)}>×</button>
            <h3 style={{ marginBottom: '15px', color: '#1e293b', fontWeight: 'bold', fontSize: '18px' }}>Profile QR Code</h3>
            <img 
              src={profileQrUrl} 
              style={{ width: '200px', height: '200px', display: 'block', margin: '0 auto 15px', borderRadius: '10px' }} 
              alt="Profile QR" 
            />
            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '15px' }}>Scan to view this profile</p>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = profileQrUrl;
                  link.download = `${profile.User?.username}_qr.png`;
                  link.click();
                }}
                style={{ flex: 1, padding: '10px', background: '#4e73df', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Download
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(profileUrl);
                  showProfileToast('Profile URL copied!');
                }}
                style={{ flex: 1, padding: '10px', background: '#1cc88a', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPI QR Modal */}
      {upiModal && (
        <div className="profile-modal-overlay" onClick={() => setUpiModal(null)}>
          <div className="profile-modal-content" onClick={e => e.stopPropagation()}>
            <button className="profile-modal-close" onClick={() => setUpiModal(null)}>×</button>
            <h3 style={{ marginBottom: '15px', color: upiModal.color, fontWeight: 'bold', fontSize: '18px' }}>Pay with {upiModal.name}</h3>
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiModal.url)}`} 
              style={{ width: '200px', height: '200px', display: 'block', margin: '0 auto 15px', borderRadius: '10px' }} 
              alt="UPI QR" 
            />
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '8px 12px', fontSize: '13px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', wordBreak: 'break-all', gap: '10px' }}>
              <span style={{ color: '#475569', fontWeight: '600' }}>{upiModal.id.replace('upi://pay?pa=', '')}</span>
              <button 
                onClick={() => copyToClipboard(upiModal.id.replace('upi://pay?pa=', ''))}
                style={{ background: copiedUpi ? '#1cc88a' : '#4e73df', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold', flexShrink: 0 }}
              >
                {copiedUpi ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Location Modal */}
      {isMapOpen && (
        <div className="profile-modal-overlay" onClick={() => setIsMapOpen(false)}>
          <div className="profile-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <button className="profile-modal-close" onClick={() => setIsMapOpen(false)}>×</button>
            <h3 style={{ marginBottom: '15px', color: '#1e293b', fontWeight: 'bold', fontSize: '18px' }}>User Location</h3>
            {profile.latitude && profile.longitude ? (
              <>
                <iframe 
                  title="User Map"
                  width="100%" 
                  height="200" 
                  style={{ border: 0, borderRadius: '12px', marginBottom: '15px' }} 
                  loading="lazy" 
                  allowFullScreen 
                  src={`https://maps.google.com/maps?q=${profile.latitude},${profile.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
                {profile.locationNote && (
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 15px', fontSize: '13px', color: theme.textSecondary, width: '100%', marginBottom: '15px', textAlign: 'left', lineHeight: 1.5 }}>
                    <strong style={{ color: theme.text }}>Note:</strong> {profile.locationNote}
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center', color: theme.textSecondary, marginBottom: '15px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                <i className="fas fa-map-marked-alt fa-2x" style={{ marginBottom: '10px', opacity: 0.7 }}></i>
                <div>No location saved yet.</div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              {profile.latitude && profile.longitude && (
                <button 
                  onClick={handleGetDirections}
                  style={{ padding: '10px 20px', background: '#4e73df', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px', textAlign: 'center', width: '100%', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                >
                  <i className="fas fa-directions"></i> Get Directions
                </button>
              )}

              {isOwner && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={handleStartSaveLocation}
                    style={{ flex: 1, padding: '10px', background: '#28a745', color: 'white', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="fas fa-map-pin"></i> Save Location
                  </button>
                  {profile.latitude && profile.longitude && (
                    <button 
                      onClick={handleResetLocation}
                      style={{ flex: 1, padding: '10px', background: '#dc3545', color: 'white', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                    >
                      <i className="fas fa-trash"></i> Reset
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reset Location Confirm Modal */}
      {showResetConfirm && (
        <div className="profile-modal-overlay" onClick={() => setShowResetConfirm(false)} style={{ zIndex: 10002 }}>
          <div className="profile-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
            <div style={{ background: 'rgba(220, 53, 69, 0.2)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }}>
              <Trash2 size={30} color="#dc3545" />
            </div>
            <h3 style={{ marginBottom: '15px', color: theme.text, fontWeight: 'bold', fontSize: '20px' }}>Remove Location?</h3>
            <p style={{ color: theme.textSecondary, marginBottom: '25px', fontSize: '15px', lineHeight: '1.5' }}>Are you sure you want to completely remove your saved location data? Visitors will no longer see your map or get directions to you.</p>
            <div style={{ display: 'flex', gap: '15px', width: '100%' }}>
              <button 
                onClick={() => setShowResetConfirm(false)}
                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', color: theme.text, borderRadius: '10px', fontWeight: 'bold', border: `1px solid ${theme.border}`, cursor: 'pointer', transition: 'all 0.2s' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmResetLocation}
                style={{ flex: 1, padding: '12px', background: '#dc3545', color: 'white', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(220,53,69,0.3)' }}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Location Note Modal */}
      {showSaveLocationNoteModal && tempCoords && (
        <div className="profile-modal-overlay" onClick={() => setShowSaveLocationNoteModal(false)} style={{ zIndex: 10001 }}>
          <div className="profile-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <h3 style={{ marginBottom: '15px', color: theme.text, fontWeight: 'bold', fontSize: '18px' }}>Save Your Location</h3>
            
            <iframe 
              title="Live Preview Map"
              width="100%" 
              height="200" 
              style={{ border: 0, borderRadius: '12px', marginBottom: '15px' }} 
              loading="lazy" 
              allowFullScreen 
              src={`https://maps.google.com/maps?q=${tempCoords.latitude},${tempCoords.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            />

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.textSecondary, fontSize: '14px', fontWeight: 'bold' }}>Location Note (e.g. Parking B1)</label>
              <input 
                type="text" 
                value={tempNote}
                onChange={e => setTempNote(e.target.value)}
                placeholder="Optional: Add a short note..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: 'rgba(255,255,255,0.05)', color: theme.text, outline: 'none' }}
                autoFocus
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={submitSaveLocation}
                style={{ flex: 1, padding: '12px', background: '#28a745', color: 'white', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={e => e.target.style.background = '#218838'}
                onMouseOut={e => e.target.style.background = '#28a745'}
              >
                Save Location
              </button>
              <button 
                onClick={() => {
                  setShowSaveLocationNoteModal(false);
                  setIsMapOpen(true);
                }}
                style={{ flex: 1, padding: '12px', background: '#dc3545', color: 'white', borderRadius: '10px', fontWeight: 'bold', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={e => e.target.style.background = '#c82333'}
                onMouseOut={e => e.target.style.background = '#dc3545'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default UserProfile;
