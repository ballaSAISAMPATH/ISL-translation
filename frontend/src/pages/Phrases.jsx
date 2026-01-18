import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBook,
  FaSearch,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";

function Phrases() {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [category, setCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedVideo, setSelectedVideo] = useState(null);


  const loadPhraseVideos = () => {
    const phraseData = {
      "Daily Life": [
        "Hungry",
        "I am hungry",
        "I am sad",
        "I am thirsty",
        "I understand",
      ],
      "Emergency": ["Do not hurt me"],
      "Emotions": ["I Love you"],
      "Greetings": [
        "Good afternoon",
        "Good evening",
        "Good morning",
        "Good night",
        "Hello",
        "How are you",
        "Nice to meet you",
      ],
      "Polite Expressions": [
        "Congratulations",
        "Don_t worry",
        "Excuse me",
        "Please",
      ],
      "Questions": ["Are you free today", "Are you okay"],
    };

    const list = Object.entries(phraseData).flatMap(
      ([folder, files]) =>
        files.map((name) => ({
          _id: `${folder}-${name}`,
          title: name,
          category: folder,
          videoUrl: `/assets/Phrases/${folder}/${name}.mp4`,
        }))
    );

    setVideos(list);
  };

  /* =========================
     FILTER + SORT
  ========================= */
  const filterAndSort = () => {
    let data = [...videos];

    if (category !== "all") {
      data = data.filter((v) => v.category === category);
    }

    if (searchTerm) {
      data = data.filter((v) =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    data.sort((a, b) =>
      sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title)
    );

    setFilteredVideos(data);
  };
  useEffect(() => {
    loadPhraseVideos();
  }, []);

  useEffect(() => {
    filterAndSort();
  }, [videos, category, searchTerm, sortOrder]);

  return (
    <div className="learn-container">
      {/* HEADER */}
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>
          <FaBook /> ISL Phrase Videos
        </h1>
        <p>Learn phrases using sign language videos</p>
      </motion.div>

      <div className="card">
        {/* CONTROLS */}
        <div className="learn-controls">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search phrases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-filters">
            {[
              "all",
              "Daily Life",
              "Emergency",
              "Emotions",
              "Greetings",
              "Polite Expressions",
              "Questions",
            ].map((c) => (
              <button
                key={c}
                className={`category-btn ${
                  category === c ? "active" : ""
                }`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}

            <button
              className="category-btn sort-btn"
              onClick={() =>
                setSortOrder(sortOrder === "asc" ? "desc" : "asc")
              }
            >
              {sortOrder === "asc" ? (
                <FaSortAmountUp />
              ) : (
                <FaSortAmountDown />
              )}
            </button>
          </div>
        </div>

        {/* GRID */}
        {filteredVideos.length === 0 ? (
          <p className="empty-state">
            No results found for "{searchTerm}"
          </p>
        ) : (
          <div className="gestures-grid">
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video._id}
                className="gesture-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => setSelectedVideo(video)}
              >
                <video
                  src={video.videoUrl}
                  muted
                  loop
                  className="gesture-video"
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => e.target.pause()}
                />

                <div className="gesture-card-info">
                  <h3>{video.title}</h3>
                  <span className="category-badge">{video.category}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="gesture-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              className="gesture-modal"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setSelectedVideo(null)}
              >
                ×
              </button>

              <video
                src={selectedVideo.videoUrl}
                controls
                autoPlay
                className="modal-video"
              />

              <h2>{selectedVideo.title}</h2>
              <span className="category-badge">
                {selectedVideo.category}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Phrases;
