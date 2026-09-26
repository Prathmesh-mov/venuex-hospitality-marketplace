'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, ShieldCheck, User } from 'lucide-react';

const KNOWLEDGE_BASE = [
  {
    keywords: ['escrow', 'deposit', 'safety', 'money', 'secure', 'razorpay'],
    answer: "Hey there! With escrow, all payments and security deposits are safely held through Razorpay. The supplier doesn't get the money until you check everything and confirm the delivery is safe."
  },
  {
    keywords: ['fee', 'commission', 'revenue', 'charge', 'pricing', '8%'],
    answer: "We keep things transparent! venueX charges a simple 8% platform fee on rentals. Suppliers also have an optional Pro plan available for ₹2,999 if they want extra perks."
  },
  {
    keywords: ['damage', 'dispute', 'issue', 'broken', 'defect', 'report'],
    answer: "Sorry to hear that! Just hit the 'Report Issue' button within your 2-hour inspection window. That automatically freezes the security deposit while we sort it out for you."
  },
  {
    keywords: ['geofence', 'radius', 'location', 'gps', 'distance', 'km'],
    answer: "Our geofencing feature automatically calculates the distance using supplier GPS coordinates saved in their settings, showing you inventory within 10km, 50km, or 100km."
  },
  {
    keywords: ['bulk', 'verification', 'chairs', 'photos', 'stack', 'video'],
    answer: "No need to upload 100 individual photos! Suppliers can just upload a wide-angle batch stack photo or a quick 10-second video walkthrough of the inventory."
  },
  {
    keywords: ['subscription', 'pro', 'upgrade', 'supplier plan'],
    answer: "Suppliers can easily upgrade to the Pro Verified plan using Razorpay straight from their Settings page to get priority placement."
  },
  {
    keywords: ['delivery', 'porter', 'transport', 'shipping'],
    answer: "We coordinate direct business-to-business logistics and transport tracking to make sure your items move smoothly between venues."
  },
  {
    keywords: ['cancel', 'refund', 'cancellation'],
    answer: "If you cancel before the supplier approves your request, you get a full refund of your deposit straight back to your payment source."
  }
];

const FOLLOW_UP_QUESTIONS = [
  { label: "🔒 How does escrow work?", query: "How does escrow work?" },
  { label: "💰 What is the platform fee?", query: "What is the platform fee?" },
  { label: "⚠️ How to report damaged goods?", query: "How to report damaged goods?" },
  { label: "📍 How does geofencing work?", query: "How does geofencing work?" },
  { label: "📦 How does bulk verification work?", query: "How does bulk verification work?" }
];

export default function CustomerSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! Welcome to venueX. I am the VenueX Chatbot. How can I help you with your booking or escrow details today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isTyping) return;

    const userMessage = text;
    const updatedMessages = [...messages, { sender: 'user', text: userMessage }];
    setMessages(updatedMessages);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const lowerQuery = userMessage.toLowerCase();
      let matchedAnswer = "";

      for (const item of KNOWLEDGE_BASE) {
        if (item.keywords.some(kw => lowerQuery.includes(kw))) {
          matchedAnswer = item.answer;
          break;
        }
      }

      if (!matchedAnswer) {
        matchedAnswer = "I'm not completely sure about that specific detail! Give our customer care team a quick call at **+91 75881 35834** and we'll sort it out for you right away.";
      }

      setMessages(prev => [...prev, { sender: 'bot', text: matchedAnswer }]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* Floating Support Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center space-x-2.5 transition-all hover:scale-105 border border-slate-700"
        title="Open Support Chat"
      >
        <MessageCircle className="w-6 h-6 text-cyan-400" />
        <span className="font-bold text-sm tracking-wide">VenueX Chatbot</span>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[580px]"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600/30 border border-blue-500/30 rounded-2xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">VenueX Chatbot</h3>
                  <p className="text-[11px] text-cyan-400 font-medium flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Online & Ready to Help
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center shrink-0 mb-1 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`max-w-[78%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-sm'
                  }`}>
                    {msg.text.includes('+91 75881 35834') ? (
                      <span>
                        {msg.text.split('+91 75881 35834')[0]}
                        <a href="tel:+917588135834" className="font-bold text-blue-600 underline bg-blue-50 px-1 py-0.5 rounded">
                          +91 75881 35834
                        </a>
                        {msg.text.split('+91 75881 35834')[1]}
                      </span>
                    ) : (
                      msg.text
                    )}
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Dynamic Auto-Questions Box (Shows after every bot response) */}
              {!isTyping && (
                <div className="space-y-1.5 pt-2 pl-9">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Suggested Questions:</p>
                  {FOLLOW_UP_QUESTIONS.map((q, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSend(q.query)} 
                      className="w-full text-left text-xs bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 px-3 py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center justify-between"
                    >
                      <span>{q.label}</span>
                      <span className="text-blue-600 font-bold">→</span>
                    </button>
                  ))}
                </div>
              )}

              {isTyping && (
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 text-slate-400 flex items-center space-x-2 shadow-sm">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(inputMessage); }} className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2">
              <input 
                type="text" 
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              <button 
                type="submit" 
                disabled={!inputMessage.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}