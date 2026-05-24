import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmColor = "#e74a3b" }) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'white', width: '380px', borderRadius: '20px', padding: '30px', textAlign: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }}>
        <div style={{ color: confirmColor, marginBottom: '15px' }}><AlertCircle size={48} /></div>
        <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>{title}</h3>
        <p style={{ color: '#666', fontSize: '15px', marginBottom: '25px', lineHeight: '1.5' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #ddd', background: 'white', color: '#666', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: confirmColor, color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>{confirmLabel}</button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmModal;
