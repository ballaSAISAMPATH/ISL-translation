import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaCog, FaSave } from 'react-icons/fa';
import './Profile.css';

function Profile() {
  const { user, updatePreferences } = useAuth();
  const [preferences, setPreferences] = useState(user?.preferences || {
    theme: 'light',
    speechEnabled: true,
    speechRate: 1.0
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const savePreferences = async () => {
    setSaving(true);
    setMessage('');
    setError('');

    const result = await updatePreferences(preferences);

    if (result.success) {
      setMessage('Preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } else {
      setError(result.error || 'Failed to save preferences');
    }

    setSaving(false);
  };

  return (
    <div className="profile-container">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1><FaUser /> User Profile</h1>
        <p>Manage your account settings and preferences</p>
      </motion.div>

      {message && (
        <motion.div
          className="success-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {message}
        </motion.div>
      )}

      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.div>
      )}

      <div className="profile-grid">
        <div className="card profile-info-card">
          <h2>Account Information</h2>
          
          <div className="profile-field">
            <label><FaUser /> Name</label>
            <div className="profile-value">{user?.name}</div>
          </div>

          <div className="profile-field">
            <label><FaEnvelope /> Email</label>
            <div className="profile-value">{user?.email}</div>
          </div>

          <div className="profile-field">
            <label>Account Type</label>
            <div className="profile-value">
              <span className="role-badge">{user?.role || 'User'}</span>
            </div>
          </div>

          <div className="profile-field">
            <label>Member Since</label>
            <div className="profile-value">
              {user?.createdAt 
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'N/A'}
            </div>
          </div>
        </div>

        <div className="card preferences-card">
          <h2><FaCog /> Preferences</h2>

          <div className="preference-group">
            <label>Theme</label>
            <div className="theme-options">
              <button
                className={`theme-btn ${preferences.theme === 'light' ? 'active' : ''}`}
                onClick={() => handlePreferenceChange('theme', 'light')}
              >
                ☀️ Light
              </button>
              <button
                className={`theme-btn ${preferences.theme === 'dark' ? 'active' : ''}`}
                onClick={() => handlePreferenceChange('theme', 'dark')}
              >
                🌙 Dark
              </button>
            </div>
          </div>

          <div className="preference-group">
            <label>
              <input
                type="checkbox"
                checked={preferences.speechEnabled}
                onChange={(e) => handlePreferenceChange('speechEnabled', e.target.checked)}
              />
              Enable Speech Output
            </label>
            <p className="preference-help">
              Automatically speak translated text
            </p>
          </div>

          <div className="preference-group">
            <label>
              Speech Rate: {preferences.speechRate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={preferences.speechRate}
              onChange={(e) => handlePreferenceChange('speechRate', parseFloat(e.target.value))}
              disabled={!preferences.speechEnabled}
              className="speech-rate-slider"
            />
            <div className="slider-labels">
              <span>Slower</span>
              <span>Normal</span>
              <span>Faster</span>
            </div>
          </div>

          <button
            className="btn btn-primary btn-block"
            onClick={savePreferences}
            disabled={saving}
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      <div className="card stats-card">
        <h2>Your Activity</h2>
        <div className="activity-stats">
          <div className="activity-stat">
            <div className="stat-value">-</div>
            <div className="stat-label">Translations Today</div>
          </div>
          <div className="activity-stat">
            <div className="stat-value">-</div>
            <div className="stat-label">Translations This Week</div>
          </div>
          <div className="activity-stat">
            <div className="stat-value">-</div>
            <div className="stat-label">Gestures Learned</div>
          </div>
          <div className="activity-stat">
            <div className="stat-value">-</div>
            <div className="stat-label">Total Time Spent</div>
          </div>
        </div>
        <p className="text-muted text-center mt-3">
          Keep practicing to improve your ISL skills!
        </p>
      </div>
    </div>
  );
}

export default Profile;



