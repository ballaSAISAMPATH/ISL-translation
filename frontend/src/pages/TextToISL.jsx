import React, { useState, useMemo } from "react";
import { FaSearch, FaVideo } from "react-icons/fa";

function TextToISL() {
  const [inputText, setInputText] = useState("");
  const [matchedVideo, setMatchedVideo] = useState(null);
  const [notFound, setNotFound] = useState(false);

  /* =========================
     PHRASE DATA (EXACT AS GIVEN)
  ========================= */
  const phraseVideos = [
    // Daily Life
    { text: "Hungry", category: "Daily Life" },
    { text: "I am hungry", category: "Daily Life" },
    { text: "I am sad", category: "Daily Life" },
    { text: "I am thirsty", category: "Daily Life" },
    { text: "I understand", category: "Daily Life" },

    // Emergency
    { text: "Do not hurt me", category: "Emergency" },

    // Emotions
    { text: "I Love you", category: "Emotions" },

    // Greetings
    { text: "Good afternoon", category: "Greetings" },
    { text: "Good evening", category: "Greetings" },
    { text: "Good morning", category: "Greetings" },
    { text: "Good night", category: "Greetings" },
    { text: "Hello", category: "Greetings" },
    { text: "How are you", category: "Greetings" },
    { text: "Nice to meet you", category: "Greetings" },

    // Polite Expressions
    { text: "Congratulations", category: "Polite Expressions" },
    { text: "Don_t worry", category: "Polite Expressions" },
    { text: "Excuse me", category: "Polite Expressions" },
    { text: "Please", category: "Polite Expressions" },

    // Questions
    { text: "Are you free today", category: "Questions" },
    { text: "Are you okay", category: "Questions" },
  ];

  /* =========================
     NORMALIZATION (IMPORTANT)
  ========================= */
  const normalize = (str) =>
    str.toLowerCase().replace(/\s+/g, " ").trim();

  /* =========================
     SEARCH HANDLER
  ========================= */
  const handleSearch = () => {
    const cleanedInput = normalize(inputText);

    const match = phraseVideos.find(
      (p) => normalize(p.text) === cleanedInput
    );

    if (match) {
      setMatchedVideo({
        title: match.text,
        category: match.category,
        videoUrl: `/assets/Phrases/${match.category}/${match.text}.mp4`,
      });
      setNotFound(false);
    } else {
      setMatchedVideo(null);
      setNotFound(true);
    }
  };

  /* =========================
     LIVE SUGGESTIONS (UX BOOST)
  ========================= */
  const suggestions = useMemo(() => {
    if (!inputText) return [];
    const q = normalize(inputText);

    return phraseVideos.filter((p) =>
      normalize(p.text).includes(q)
    );
  }, [inputText]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8">

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-indigo-100 text-indigo-600">
              <FaVideo size={28} />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            Text to ISL Converter
          </h1>
          <p className="text-gray-500 mt-2">
            Type a sentence to instantly see its ISL sign video
          </p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Type e.g. Good morning"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full px-5 py-4 rounded-xl border border-gray-200
                         focus:outline-none focus:ring-2 focus:ring-indigo-400
                         text-lg"
            />
            <button
              onClick={handleSearch}
              className="px-5 py-4 rounded-xl bg-indigo-600
                         text-white hover:bg-indigo-700 transition-all"
            >
              <FaSearch />
            </button>
          </div>

          {/* SUGGESTIONS */}
          {suggestions.length > 0 && !matchedVideo && (
            <div className="absolute z-10 mt-2 w-full bg-white rounded-xl shadow-lg border">
              {suggestions.map((s) => (
                <button
                  key={s.text}
                  onClick={() => {
                    setInputText(s.text);
                    setMatchedVideo({
                      title: s.text,
                      category: s.category,
                      videoUrl: `/assets/Phrases/${s.category}/${s.text}.mp4`,
                    });
                    setNotFound(false);
                  }}
                  className="w-full text-left px-5 py-3 hover:bg-indigo-50 transition"
                >
                  {s.text}
                  <span className="ml-2 text-sm text-gray-400">
                    ({s.category})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RESULT */}
        {matchedVideo && (
          <div className="mt-10 animate-fade-up">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              {matchedVideo.title}
            </h2>
            <span className="inline-block mb-4 px-3 py-1 text-sm rounded-full
                             bg-indigo-100 text-indigo-700">
              {matchedVideo.category}
            </span>

            <video
              src={matchedVideo.videoUrl}
              controls
              autoPlay
              className="w-full rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* NOT FOUND */}
        {notFound && (
          <p className="mt-8 text-center text-red-600 font-semibold">
            ❌ No ISL video available for this sentence
          </p>
        )}
      </div>
    </div>
  );
}

export default TextToISL;
