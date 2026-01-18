import React, { useState, useMemo } from "react";
import { FaSearch, FaVideo } from "react-icons/fa";

function TextToISL() {
  const [inputText, setInputText] = useState("");
  const [selectedPhrase, setSelectedPhrase] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
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

  const normalize = (str) =>
    str.toLowerCase().replace(/\s+/g, " ").trim();

  const lettersFromSentence = (sentence) =>
    sentence.toUpperCase().replace(/[^A-Z]/g, "").split("");

  const suggestions = useMemo(() => {
    if (!inputText.trim()) return [];
    const q = normalize(inputText);
    return phraseVideos.filter((p) =>
      normalize(p.text).includes(q)
    );
  }, [inputText]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* LEFT BOX – SEARCH + LETTERS */}
        <div className="bg-white/90 rounded-3xl shadow-xl p-8 relative">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Search Phrase
          </h2>

          {/* SEARCH */}
          <div className="relative">
            <div className="flex gap-3">
              <input
                value={inputText}
                onChange={(e) =>{ setInputText(e.target.value);setSearching(true)}}
                placeholder="e.g. I am hungry"
                className="w-full px-5 py-4 rounded-xl border
                           focus:outline-none focus:ring-2
                           focus:ring-indigo-400 text-lg"
              />
              <button className="px-5 py-4 rounded-xl bg-indigo-600 text-white">
                <FaSearch />
              </button>
            </div>

            {/* SUGGESTIONS */}
            {searching&&suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-3 bg-white rounded-xl
                              shadow-2xl border z-50 max-h-60 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => {
                      setSearching(false)
                      setInputText(s.text);
                      setSelectedPhrase(s);
                      setShowVideo(false);
                      setNotFound(false);
                    }}
                    className="w-full text-left px-5 py-3 hover:bg-indigo-50"
                  >
                    <div className="font-medium">{s.text}</div>
                    <div className="text-sm text-gray-400">{s.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LETTER BREAKDOWN (BOTTOM OF SEARCH BOX) */}
          {selectedPhrase && (
            <div className="mt-10">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Sentence Breakdown
              </h3>

              <div className="flex flex-wrap items-center gap-4">
                {lettersFromSentence(selectedPhrase.text).map(
                  (letter, idx, arr) => (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col items-center">
                        <img
                          src={`/assets/Alphabet/${letter}.jpg`}
                          alt={letter}
                          className="w-20 h-20 rounded-xl shadow-lg"
                        />
                        <span className="mt-1 font-semibold text-gray-700">
                          {letter}
                        </span>
                      </div>

                      {idx !== arr.length - 1 && (
                        <span className="text-2xl font-bold text-gray-400">
                          +
                        </span>
                      )}
                    </React.Fragment>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT BOX – VIDEO ONLY */}
        <div className="bg-white/90 rounded-3xl shadow-xl p-8 flex items-center justify-center">
          {!selectedPhrase && (
            <p className="text-gray-500 text-lg text-center">
              Select a phrase to play ISL video
            </p>
          )}

          {selectedPhrase && (
            <div className="w-full space-y-4">
            
              <span className="inline-block px-3 py-1 rounded-full
                               bg-indigo-100 text-indigo-700 text-sm">
                {selectedPhrase.category}
              </span>

              {!showVideo && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="w-full py-4 rounded-2xl bg-indigo-600
                             text-white text-lg hover:bg-indigo-700"
                >
                  <FaVideo className="inline mr-2" />
                  Play ISL Video
                </button>
              )}

              {showVideo && (
                <video
                  src={`/assets/Phrases/${selectedPhrase.category}/${selectedPhrase.text}.mp4`}
                  controls
                  autoPlay
                  loop={true}
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
  );
}

export default TextToISL;
