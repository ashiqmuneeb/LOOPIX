import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Zap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--glass-border)', padding: '1rem 2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'var(--primary)', padding: '5px', borderRadius: '8px' }}>
            <Zap size={20} color="white" fill="white" />
          </div>
          <span className="brand-font" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>Onepio</span>
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {user ? (
            <>
              <Link to="/dashboard" className="btn" style={{ color: 'var(--text-main)', padding: '0.5rem' }}>
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              <button onClick={handleLogout} className="btn" style={{ color: 'var(--danger)', padding: '0.5rem' }}>
                <LogOut size={20} /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
