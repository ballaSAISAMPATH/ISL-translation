import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaHistory, FaTrash, FaClock, FaArrowRight } from 'react-icons/fa';
import './History.css';

function History() {
  const [translations, setTranslations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, isl-to-text, text-to-isl
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, [filter]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const queryParam = filter !== 'all' ? `?type=${filter}` : '';
      const response = await axios.get(`/api/history${queryParam}`);
      setTranslations(response.data.translations);
    } catch (err) {
      setError('Failed to load history');
      console.error('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/history/stats/summary');
      setStats(response.data.stats);
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const deleteTranslation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this translation?')) {
      return;
    }

    try {
      await axios.delete(`/api/history/${id}`);
      setTranslations(translations.filter(t => t._id !== id));
      fetchStats(); // Refresh stats
    } catch (err) {
      setError('Failed to delete translation');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="history-container">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1><FaHistory /> Translation History</h1>
        <p>View and manage your past translations</p>
      </motion.div>

      {stats && (
        <motion.div
          className="stats-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#667eea' }}>
              <FaHistory />
            </div>
            <div className="stat-content">
              <h3>{stats.totalTranslations}</h3>
              <p>Total Translations</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10b981' }}>
              <FaArrowRight />
            </div>
            <div className="stat-content">
              <h3>{stats.islToText}</h3>
              <p>ISL to Text</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#764ba2' }}>
              <FaArrowRight style={{ transform: 'rotate(180deg)' }} />
            </div>
            <div className="stat-content">
              <h3>{stats.textToIsl}</h3>
              <p>Text to ISL</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f59e0b' }}>
              <FaClock />
            </div>
            <div className="stat-content">
              <h3>{stats.recentActivity}</h3>
              <p>Last 7 Days</p>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="card">
        <div className="history-header">
          <h2>Your Translations</h2>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'isl-to-text' ? 'active' : ''}`}
              onClick={() => setFilter('isl-to-text')}
            >
              ISL → Text
            </button>
            <button
              className={`filter-btn ${filter === 'text-to-isl' ? 'active' : ''}`}
              onClick={() => setFilter('text-to-isl')}
            >
              Text → ISL
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading translations...</p>
          </div>
        ) : translations.length === 0 ? (
          <div className="empty-state">
            <FaHistory />
            <p>No translations found</p>
            <span>Start translating to see your history here</span>
          </div>
        ) : (
          <div className="translations-list">
            {translations.map((translation, index) => (
              <motion.div
                key={translation._id}
                className="translation-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="translation-type-badge">
                  {translation.type === 'isl-to-text' ? (
                    <span className="badge badge-green">ISL → Text</span>
                  ) : (
                    <span className="badge badge-purple">Text → ISL</span>
                  )}
                </div>

                <div className="translation-content">
                  <div className="translation-io">
                    <div className="translation-input">
                      <label>Input:</label>
                      <p>{translation.type === 'isl-to-text' 
                        ? `${translation.gestures?.length || 0} gestures` 
                        : translation.input}
                      </p>
                    </div>
                    <FaArrowRight className="arrow-icon" />
                    <div className="translation-output">
                      <label>Output:</label>
                      <p>{translation.output.length > 50 
                        ? translation.output.substring(0, 50) + '...' 
                        : translation.output}
                      </p>
                    </div>
                  </div>

                  <div className="translation-meta">
                    <span className="translation-date">
                      <FaClock /> {formatDate(translation.createdAt)}
                    </span>
                    {translation.confidence && (
                      <span className="translation-confidence">
                        Confidence: {(translation.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="translation-actions">
                  <button 
                    className="btn-icon btn-danger"
                    onClick={() => deleteTranslation(translation._id)}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;

