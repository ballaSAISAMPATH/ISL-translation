import React, { useState, useMemo } from "react";
import { FaSearch, FaVideo } from "react-icons/fa";

function TextToISL() {
  const [inputText, setInputText] = useState("");
  const [selectedPhrase, setSelectedPhrase] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [notFound, setNotFound] = useState(false);

  /* =========================
     PHRASE DATA (EXACT)
  ========================= */
  const phraseVideos = [
    { text: "Hungry", category: "Daily Life" },
    { text: "I am hungry", category: "Daily Life" },
    { text: "I am sad", category: "Daily Life" },
    { text: "I am thirsty", category: "Daily Life" },
    { text: "I understand", category: "Daily Life" },

    { text: "Do not hurt me", category: "Emergency" },
    { text: "I Love you", category: "Emotions" },

    { text: "Good afternoon", category: "Greetings" },
    { text: "Good evening", category: "Greetings" },
    { text: "Good morning", category: "Greetings" },
    { text: "Good night", category: "Greetings" },
    { text: "Hello", category: "Greetings" },
    { text: "How are you", category: "Greetings" },
    { text: "Nice to meet you", category: "Greetings" },

    { text: "Congratulations", category: "Polite Expressions" },
    { text: "Don_t worry", category: "Polite Expressions" },
    { text: "Excuse me", category: "Polite Expressions" },
    { text: "Please", category: "Polite Expressions" },

    { text: "Are you free today", category: "Questions" },
    { text: "Are you okay", category: "Questions" },
  ];

  /* =========================
     HELPERS
  ========================= */
  const normalize = (str) =>
    str.toLowerCase().replace(/\s+/g, " ").trim();

  const lettersFromSentence = (sentence) =>
    sentence
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .split("");

  /* =========================
     SEARCH
  ========================= */
  const handleSearch = () => {
    const cleaned = normalize(inputText);
    const match = phraseVideos.find(
      (p) => normalize(p.text) === cleaned
    );

    if (match) {
      setSelectedPhrase(match);
      setShowVideo(false);
      setNotFound(false);
    } else {
      setSelectedPhrase(null);
      setNotFound(true);
    }
  };

  /* =========================
     SUGGESTIONS
  ========================= */
  const suggestions = useMemo(() => {
    if (!inputText.trim()) return [];
    const q = normalize(inputText);
    return phraseVideos.filter((p) =>
      normalize(p.text).includes(q)
    );
  }, [inputText]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
            <FaVideo className="text-indigo-600" />
            Text to ISL Converter
          </h1>
          <p className="text-gray-500 mt-1">
            Type a sentence → see letters → play ISL video
          </p>
        </div>

        {/* TWO BOXES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* LEFT BOX */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8 relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Search Phrase
            </h2>

            <div className="relative">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. Good morning"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full px-5 py-4 rounded-xl border
                             focus:outline-none focus:ring-2
                             focus:ring-indigo-400 text-lg"
                />
                <button
                  onClick={handleSearch}
                  className="px-5 py-4 rounded-xl bg-indigo-600
                             text-white hover:bg-indigo-700 transition"
                >
                  <FaSearch />
                </button>
              </div>

              {/* SUGGESTIONS */}
              {suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-3 bg-white
                                rounded-xl shadow-2xl border z-50
                                max-h-72 overflow-y-auto">
                  {suggestions.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => {
                        setSelectedPhrase(s);
                        setShowVideo(false);
                        setNotFound(false);
                      }}
                      className="w-full text-left px-5 py-3 hover:bg-indigo-50"
                    >
                      <div className="font-medium">{s.text}</div>
                      <div className="text-sm text-gray-400">
                        {s.category}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT BOX */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8">

            {!selectedPhrase && !notFound && (
              <p className="text-gray-500 text-center text-lg">
                Select a phrase to see details
              </p>
            )}

            {notFound && (
              <p className="text-red-600 font-semibold text-center">
                ❌ No ISL video available
              </p>
            )}

            {selectedPhrase && (
              <div className="space-y-6">

                {/* PHRASE */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedPhrase.text}
                  </h2>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full
                                   bg-indigo-100 text-indigo-700 text-sm">
                    {selectedPhrase.category}
                  </span>
                </div>

                {/* LETTER BREAKDOWN */}
                <div>
                  <h3 className="font-semibold mb-2 text-gray-700">
                    Letter Breakdown
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {lettersFromSentence(selectedPhrase.text).map(
                      (letter, idx) => (
                        <img
                          key={idx}
                          src={`/assets/Alphabet/${letter}.jpg`}
                          alt={letter}
                          className="w-14 h-14 rounded-lg shadow"
                        />
                      )
                    )}
                  </div>
                </div>

                {/* VIDEO CARD */}
                {!showVideo && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="w-full flex items-center justify-center gap-3
                               py-4 rounded-2xl bg-indigo-600 text-white
                               hover:bg-indigo-700 transition text-lg"
                  >
                    <FaVideo />
                    Play ISL Video
                  </button>
                )}

                {/* VIDEO */}
                {showVideo && (
                  <video
                    src={`/assets/Phrases/${selectedPhrase.category}/${selectedPhrase.text}.mp4`}
                    controls
                    autoPlay
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full rounded-2xl shadow-xl"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextToISL;
