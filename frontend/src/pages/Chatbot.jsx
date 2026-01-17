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
  const [messages, setMessages] = useState([
    { role: "bot", content: "Hi! I'm your AI assistant. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
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

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  async function chatbotFormSubmitted(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input;
    setInput(""); // Clear input immediately
    
    // 1. Add User message to UI
    setMessages((prev) => [...prev, { role: "user", content: userQuery }]);
    
    // 2. Start loading state
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5001/chatbot", { query: userQuery });
      
      // 3. Add Bot reply to UI
      setMessages((prev) => [...prev, { role: "bot", content: response.data.reply }]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages((prev) => [...prev, { role: "bot", content: "Sorry, I'm having trouble connecting to the server." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      {isOpen?(
        <div className="fixed bottom-17 right-6 z-50 font-sans text-gray-800">
      {/* Chat Window */}
      <div
        ref={chatRef}
        className={`mb-4 w-[90vw] sm:w-125 h-125 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 transition-all duration-300 origin-bottom-right ${
          isOpen 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 translate-y-10 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-violet-600 p-2 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <RiRobot3Fill size={20} />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-600 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-[15px] leading-none">Support AI</h3>
              <p className="text-[11px] text-indigo-100 mt-1">Online Now</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
            <RiCloseLine size={22} />
          </button>
        </div>

        {/* Message Area */}
        <div ref={scrollRef} className="flex-1 p-1 overflow-y-auto bg-[#F8F9FD] space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-2 items-end ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "bot" && (
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mb-1">
                  <RiRobot3Fill size={18} />
                </div>
              )}
              
              <div className={`py-2 px-4 rounded-2xl text-sm leading-relaxed max-w-[80%] shadow-sm ${
                msg.role === "user" 
                ? "bg-indigo-600 text-white rounded-br-none" 
                : "bg-white border border-gray-100 text-gray-700 rounded-bl-none"
              }`}>
                {msg.content}
              </div>

              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 shrink-0 mb-1">
                  <RiUserLine size={18} />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-2 items-center text-gray-400 ml-10">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-2 bg-white border-t border-gray-100">
          <form onSubmit={chatbotFormSubmitted} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-gray-700 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="text-indigo-600 hover:text-indigo-800 disabled:text-gray-300 transition-all active:scale-90"
            >
              <RiSendPlane2Fill size={22} />
            </button>
          </form>
          <p className="text-[10px] text-center text-gray-400 mt-2 tracking-wide uppercase font-semibold">
            Powered by <span className="text-indigo-600">Groq</span>
          </p>
        </div>
      </div>

      {/* Floating Toggle Button */}
      
    </div>
      ):(
        ""
      )}
      <div className="fixed right-6 animate-bounce bottom-6 flex justify-end">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={` w-14 h-14 flex justify-center items-center rounded-2xl shadow-2xl transition-all duration-300 border-none outline-none group hover:scale-105 active:scale-95 ${
            isOpen ? "bg-gray-900" : "bg-indigo-600"
          }`}
        >
          <div className="relative w-8 h-8 flex items-center justify-center text-white">
            {isOpen ? <RiCloseLine size={32} /> : <RiRobot3Fill size={32} />}
          </div>
        </button>
      </div>
    </div>
  );
}