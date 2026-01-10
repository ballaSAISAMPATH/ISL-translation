import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaHandPaper, FaKeyboard, FaHistory, FaBook, FaUser, FaSignOutAlt, FaBars, FaTimes, FaLanguage, FaLightbulb, FaCommentDots, FaImages } from 'react-icons/fa';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FaHandPaper className="logo-icon" />
          <span>ISL Translator</span>
        </Link>

        <div className="mobile-menu-icon" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={mobileMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              <FaHome /> <span>Home</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/translation" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              <FaLanguage /> <span>Translation</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/learning" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              <FaLightbulb /> <span>Learning</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/history" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              <FaHistory /> <span>History</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/profile" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              <FaUser /> <span>{user?.name || 'Profile'}</span>
            </Link>
          </li>
          <li className="nav-item">
            <button className="nav-link logout-btn" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
              <FaSignOutAlt /> <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;

