import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaHistory, FaTrash, FaClock } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import './History.css';

function History() {

  const user_id = useSelector((state)=>state.counter.user_id);

  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    try {

      setLoading(true);

      const response = await axios.post(
        "http://localhost:4000/database/get-history",
        { user_id }
      );

      if(response.data.success){

        let data = response.data.history;

        if(filter !== 'all'){
          data = data.filter(item => item.type === filter);
        }

        setTranslations(data);

      }

    } catch (err) {
      console.error(err);
      setError("Failed to load history");
    }
    finally{
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);

    return date.toLocaleString('en-US',{
      month:'short',
      day:'numeric',
      year:'numeric',
      hour:'2-digit',
      minute:'2-digit'
    })
  };


  return (
    <div className="history-container">

      <motion.div
        className="page-header"
        initial={{opacity:0,y:-20}}
        animate={{opacity:1,y:0}}
      >
        <h1><FaHistory/> Translation History</h1>
        <p>View your past translations</p>
      </motion.div>


      {error && <div className="error-message">{error}</div>}


      <div className="card">

        <div className="history-header">
          <h2>Your Translations</h2>

          <div className="filter-buttons">

            <button
              className={`filter-btn ${filter==='all'?'active':''}`}
              onClick={()=>setFilter('all')}
            >
              All
            </button>

            <button
              className={`filter-btn ${filter==='isl-to-text'?'active':''}`}
              onClick={()=>setFilter('isl-to-text')}
            >
              ISL → Text
            </button>

            <button
              className={`filter-btn ${filter==='text-to-isl'?'active':''}`}
              onClick={()=>setFilter('text-to-isl')}
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
            <FaHistory/>
            <p>No translations found</p>
          </div>

        ) : (

          <div className="translations-list">

            {translations.map((item,index)=>(
              <motion.div
                key={item._id}
                className="translation-item"
                initial={{opacity:0,y:20}}
                animate={{opacity:1,y:0}}
                transition={{delay:index*0.05}}
              >

                <div className="translation-type-badge">
                  {item.type === 'isl-to-text'
                    ? <span className="badge badge-green">ISL → Text</span>
                    : <span className="badge badge-purple">Text → ISL</span>
                  }
                </div>


                <div className="translation-content">

                  <p className="translation-phrase">
                    {item.phrase}
                  </p>

                  <div className="translation-meta">
                    <span className="translation-date">
                      <FaClock/> {formatDate(item.time)}
                    </span>
                  </div>

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