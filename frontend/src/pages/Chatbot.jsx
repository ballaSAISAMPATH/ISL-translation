import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import {
  RiRobot3Fill,
  RiCloseLine,
  RiSendPlane2Fill,
  RiUserLine,
} from "react-icons/ri";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);
  const scrollRef = useRef(null);

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

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen]);

  async function chatbotFormSubmitted(e) {
    e.preventDefault();
    console.log(e.target[0].value);
    
    const reply = await axios.post("",{query:input})
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      <div
        ref={chatRef}
        className={`mb-4 w-96 sm:w-200 h-145 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-300 origin-bottom-right ${
          isOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 translate-y-10 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-violet-600 p-1 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <RiRobot3Fill size={24} />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-600 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-[15px] leading-none">Support AI</h3>
              <p className="text-[11px] text-indigo-100 mt-1.5 flex items-center gap-1">
                Online Now
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 p-1.5 rounded-full transition-colors outline-none"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        {/* Message Area */}
        <div
          ref={scrollRef}
          className="flex-1 p-4 overflow-y-auto bg-[#F8F9FD] space-y-4"
        >
          {/* Bot Bubble */}
          <div className="flex gap-2 items-end">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <RiRobot3Fill size={18} />
            </div>
            <div className="bg-white border border-gray-100 text-gray-700 p-3 rounded-2xl rounded-bl-none max-w-[80%] shadow-sm text-sm leading-relaxed">
              Hi! I'm your AI assistant. I'm now running on pure Tailwind CSS.
            </div>
          </div>

          {/* User Bubble Example */}
          <div className="flex gap-2 items-end justify-end">
            <div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-br-none max-w-[80%] shadow-md text-sm leading-relaxed">
              Looks great without the extra libraries!
            </div>
            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
              <RiUserLine size={18} />
            </div>
          </div>
        </div>

        {/* Footer Input */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form
            onSubmit={(event) => chatbotFormSubmitted(event)}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-all"
          >
            <input
              type="text"
              value={input}
              placeholder="Ask a question..."
              className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-gray-700 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="text-indigo-600 hover:text-indigo-800 disabled:text-gray-300 transition-all active:scale-90"
            >
              <RiSendPlane2Fill size={22} />
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-2 tracking-wide uppercase font-semibold">
            Powered by <span className="text-indigo-600 font-bold">Groq</span>
          </p>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 flex justify-center items-center rounded-2xl shadow-2xl transition-all duration-300 border-none outline-none group hover:scale-105 active:scale-95 ${
            isOpen ? "bg-gray-900" : "bg-indigo-600"
          }`}
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            {!isOpen ? 
            <RiRobot3Fill 
            size={32} 
            className={`absolute text-white transition-all duration-300 `}
            />
            :
            <RiCloseLine 
            size={32} 
            className={`absolute text-white transition-all duration-300 `}
            />
            }
          </div>
        </button>
      </div>
    </div>
  );
}