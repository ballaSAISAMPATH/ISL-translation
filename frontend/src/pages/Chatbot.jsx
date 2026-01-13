import React, { useState, useEffect, useRef } from "react";
import {
  RiRobot3Fill,
  RiCloseLine,
  RiSendPlane2Fill,
  RiUserLine,
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);
  const scrollRef = useRef(null);
    // const [input,setInput]=useState("");
  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Auto-scroll to bottom when window opens
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen]);

  function chatbotFromSubmitted(e) {
    e.preventDefault();
    var query = e.target[0].value;
    console.log(query);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-95 h-130 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-indigo-600 to-violet-600 p-4 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                    <RiRobot3Fill size={24} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-600 rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] leading-none">
                    Support AI
                  </h3>
                  <p className="text-[11px] text-indigo-100 mt-1">
                    Typically replies instantly
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              >
                <RiCloseLine size={22} />
              </button>
            </div>

            {/* Message Area */}
            <div
              ref={scrollRef}
              className="flex-1 p-4 overflow-y-auto bg-[#F8F9FD] space-y-4 custom-scrollbar"
            >
              {/* Bot Bubble */}
              <div className="flex gap-2 items-end">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <RiRobot3Fill size={18} />
                </div>
                <div className="bg-white border border-gray-100 text-gray-700 p-3 rounded-2xl rounded-bl-none max-w-[75%] shadow-sm text-sm leading-relaxed">
                  Hi there! I'm your AI assistant. How can I help you improve
                  your project today?
                </div>
              </div>

              {/* User Bubble */}
              <div className="flex gap-2 items-end justify-end">
                <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-br-none max-w-[75%] shadow-md text-sm leading-relaxed">
                  Can you show me a clean UI design?
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                  <RiUserLine size={18} />
                </div>
              </div>
            </div>

            {/* Footer Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form
                onSubmit={(event) => chatbotFromSubmitted(event)}
                className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-all"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-gray-700"
                />
                <button
                  disabled={!input.trim()}
                  className="text-indigo-600 hover:text-indigo-800 disabled:text-gray-300 transition-colors"
                >
                  <RiSendPlane2Fill size={22} />
                </button>
              </form>
              <p className="text-[10px] text-center text-gray-400 mt-2">
                Powered by Gemini AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 flex justify-center items-center rounded-2xl shadow-xl transition-colors duration-300 ${
          isOpen ? "bg-gray-800 text-white" : "bg-indigo-600 text-white"
        }`}
      >
        {isOpen ? <RiCloseLine size={32} /> : <RiRobot3Fill size={32} />}
      </motion.button>
    </div>
  );
}
