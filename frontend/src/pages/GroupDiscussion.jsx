// 1. GLOBAL FIX (Top priority for simple-peer & browser compatibility)
if (typeof global === 'undefined') {
  window.global = window;
}

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Radar as RadarArea } from 'recharts';
import { Mic, MicOff, Video, Radio, Star, Award, BarChart3, Briefcase, LogOut, Save, ChevronLeft, User, MessageSquare, Send, Zap, Users as UsersIcon, Database, AlertCircle, X, Clock, Download, Loader2 } from 'lucide-react';
import Peer from "simple-peer";

// ✅ PDF Generation Imports
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ✅ Framer Motion import
import { motion, AnimatePresence } from 'framer-motion';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
  extraHeaders: {
    "ngrok-skip-browser-warning": "true"
  },
  reconnectionAttempts: 5,
  timeout: 10000
});

export default function GroupDiscussion() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [joinId, setJoinId] = useState("");
  const [mode, setMode] = useState("AI"); 

  const [difficulty, setDifficulty] = useState("Medium");
  const [isPrepTime, setIsPrepTime] = useState(false);
  const [prepCountdown, setPrepCountdown] = useState(60);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState("You");
  const [speakingTime, setSpeakingTime] = useState(0);

  const [myStats, setMyStats] = useState({ 
    fillers: 0, 
    time: 0, 
    score: 0, 
    aiFeedback: "", 
    highlights: [],
    isEvaluating: false 
  });
  
  const userProfile = JSON.parse(localStorage.getItem("user")) || {};
  const [myName] = useState(userProfile.name || "Host");
  const [participantCount, setParticipantCount] = useState(1);
  const [participants, setParticipants] = useState([]);
  
  const [isMicOn, setIsMicOn] = useState(false); 
  const recognitionRef = useRef(null);

  const [showEndModal, setShowEndModal] = useState(false);
  const reportRef = useRef(null);

  const analysisData = [
    { subject: 'Communication', A: myStats.score > 0 ? myStats.score : 0 },
    { subject: 'Leadership', A: 70 },
    { subject: 'Critical Thinking', A: 90 },
    { subject: 'Listening', A: 75 },
    { subject: 'Confidence', A: 80 },
  ];

  const timerRef = useRef(null);
  const utteranceRef = useRef(null);
  const messagesEndRef = useRef(null); 
  
  const aiBots = ["Rahul", "Anita", "Priya", "Vikram", "Neha"];

  /* ================= PREP TIMER LOGIC ================= */
  useEffect(() => {
    let interval;
    if (isPrepTime && prepCountdown > 0) {
      interval = setInterval(() => setPrepCountdown(prev => prev - 1), 1000);
    } else if (prepCountdown === 0 && isPrepTime) {
      setIsPrepTime(false);
    }
    return () => clearInterval(interval);
  }, [isPrepTime, prepCountdown]);

  /* ================= SOCKET LOGIC ================= */
  useEffect(() => {
    socket.on("connect", () => console.log("Connected to Server via Socket"));
    if (!roomId) return;

    if (!isPrepTime) {
      socket.emit("joinRoom", { roomId, topic, type: mode, userName: myName, difficulty });
    }

    socket.on("newMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
      setCurrentSpeaker(msg.user);
      resetTimer();
      if (mode === "AI" && msg.user !== "You" && msg.user !== myName) {
        speak(msg.message, msg.user);
      }
    });

    socket.on("finalAIScore", (data) => {
      console.log("Real AI Evaluation Received:", data);
      setMyStats(prev => ({ 
        ...prev, 
        score: data.score,
        aiFeedback: data.aiFeedback,
        detailedMetrics: data.detailedMetrics,
        highlights: data.highlights || [],
        isEvaluating: false
      }));
    });

    socket.on("receiveTopic", (newTopic) => setTopic(newTopic));
    socket.on("roomUpdated", (data) => {
      setParticipantCount(data.participantCount);
      setParticipants(data.participants || []);
      if (data.topic) setTopic(data.topic); 
    });

    return () => {
      socket.off("newMessage");
      socket.off("finalAIScore");
      socket.off("receiveTopic");
      socket.off("roomUpdated");
    };
  }, [roomId, mode, isPrepTime]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, input]);

  /* ================= MIC TO TEXT LOGIC ================= */
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false; 
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + (prev.length > 0 ? " " : "") + finalTranscript.trim());
        }
      };
    }
  }, [roomId]);

  const toggleMic = () => {
    const newState = !isMicOn;
    setIsMicOn(newState);
    if (newState) {
      window.speechSynthesis.cancel(); 
      socket.emit("userSpeaking", roomId); 
      try { recognitionRef.current?.start(); } catch(e){}
    } else {
      try { recognitionRef.current?.stop(); } catch(e){}
    }
  };

  const speak = (text, user) => {
    if (user === "Moderator") return;
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    const voices = window.speechSynthesis.getVoices();
    
    const femaleKeywords = ["female", "zira", "heera", "veena", "susan", "girl"];
    const maleKeywords = ["male", "david", "rishi", "kashyap", "mark", "guy"];

    const femaleVoices = voices.filter(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
    const maleVoices = voices.filter(v => maleKeywords.some(k => v.name.toLowerCase().includes(k)));

    const indianFemale = femaleVoices.filter(v => v.lang.includes("IN") || v.name.includes("India"));
    const indianMale = maleVoices.filter(v => v.lang.includes("IN") || v.name.includes("India"));

    const isFemale = ["Anita", "Priya", "Neha"].includes(user);

    if (isFemale) {
      utterance.voice = indianFemale[0] || femaleVoices[0] || voices[0];
      utterance.pitch = 1.1; 
    } else {
      utterance.voice = indianMale[0] || maleVoices[0] || voices[0];
      utterance.pitch = 0.8; 
    }

    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    utterance.onend = () => socket.emit("speechFinished", roomId);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSpeakingTime(0);
    timerRef.current = setInterval(() => setSpeakingTime(p => p + 1), 1000);
  };

  const handleSend = () => {
    if (!input.trim()) return; 
    const fillers = ["um", "uh", "like", "basically"].filter(w => input.toLowerCase().includes(w)).length;
    socket.emit("sendMessage", { roomId, user: myName, message: input, fillerCount: fillers });
    setMyStats(prev => ({ ...prev, fillers: prev.fillers + fillers, time: prev.time + speakingTime }));
    setInput("");
  };

  const processEndSession = (shouldSave) => {
    const wordCount = messages.filter(m => m.user === myName).length;
    let finalScore = 0;
    if (speakingTime > 10 && wordCount > 2) {
       finalScore = Math.min(95, 60 + (wordCount * 5) - (myStats.fillers * 2));
    }
    
    if (shouldSave) {
      setMyStats(prev => ({ ...prev, score: finalScore, isEvaluating: true }));
      socket.emit("saveFinalGD", { roomId, stats: { ...myStats, score: finalScore }, transcript: messages });

      setTimeout(() => {
        setMyStats(prev => {
          if (prev.isEvaluating) {
            console.log("Evaluation Timeout Triggered after 45s");
            return { 
              ...prev, 
              isEvaluating: false, 
              aiFeedback: "⚠️ The AI evaluation took too long. Please check your backend terminal for API errors." 
            };
          }
          return prev;
        });
      }, 45000); 

    } else {
      setMyStats(prev => ({ ...prev, score: finalScore }));
      socket.emit("endGD", roomId);
    }

    setIsFinished(true);
    setShowEndModal(false);
    window.speechSynthesis?.cancel(); 
  };

  const handleExportPDF = async () => {
    try {
      const noPrintElements = document.querySelectorAll('.no-pdf');
      noPrintElements.forEach(el => el.style.setProperty('display', 'none', 'important'));

      window.print();

      setTimeout(() => {
        noPrintElements.forEach(el => el.style.display = 'flex');
      }, 1000);

    } catch (err) {
      console.error("PDF Export Error:", err);
    }
  };

  const handleStartSession = (id) => {
    setIsPrepTime(true);
    setPrepCountdown(60);
    setRoomId(id);
  };

  let gridUsers = [{ name: myName, type: "Host" }];
  if (mode === "LIVE") {
    gridUsers = [...gridUsers, ...participants.filter(p => p.name !== myName).map(p => ({ name: p.name, type: "Participant" }))];
  } else {
    gridUsers = [...gridUsers, ...aiBots.map(b => ({ name: b, type: "AI Member" }))];
  }

  /* ================= UI RENDER ================= */
  return (
    <div className="min-h-screen w-full bg-[#F4F7F6] p-4 md:p-8 font-sans text-slate-800 relative">
      
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body { background-color: #F4F7F6 !important; }
          .no-pdf { display: none !important; }
          .custom-scrollbar { 
            overflow: visible !important; 
            max-height: none !important; 
          }
          .break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      <AnimatePresence>
        {showEndModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full border border-slate-100"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-red-50 p-3 rounded-2xl text-red-500">
                  <AlertCircle size={28} />
                </div>
                <button onClick={() => setShowEndModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">End Session?</h3>
              <p className="text-slate-500 font-medium mb-8">Do you want to save this discussion data for your analytics report, or end without saving?</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => processEndSession(true)} 
                  className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Database size={18} /> Save & Submit GD
                </button>
                <button 
                  onClick={() => processEndSession(false)} 
                  className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-100"
                >
                  End Without Saving
                </button>
                <button 
                  onClick={() => setShowEndModal(false)} 
                  className="w-full bg-slate-50 text-slate-500 py-4 rounded-xl font-bold hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-full mx-auto flex flex-col md:flex-row justify-between items-center mb-10 gap-4 no-pdf">
        <div className="flex items-center gap-4">
          <div className="bg-teal-600 p-3 rounded-2xl shadow-lg shadow-teal-600/20">
            <Zap className="text-white size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">
              Skill<span className="text-teal-600">Predictor</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Intelligence Module</p>
          </div>
        </div>
        <button 
          onClick={() => navigate("/dashboard")} 
          className="group flex items-center gap-2 text-slate-500 font-bold hover:text-teal-600 transition-all bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform"/> 
          Return to Dashboard
        </button>
      </div>

      {!roomId ? (
        <div className="max-w-xl mx-auto bg-white p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white mt-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-800">Room Configuration</h2>
            <p className="text-slate-400 font-medium mt-2">Set your preferences for the discussion</p>
          </div>
          
          <div className="flex bg-slate-50 p-2 rounded-2xl mb-8 border border-slate-100">
            <button onClick={() => setMode("AI")} className={`flex-1 py-4 rounded-xl font-bold transition-all ${mode === "AI" ? "bg-white text-teal-600 shadow-md" : "text-slate-400 hover:text-slate-600"}`}>🤖 AI Simulation</button>
            <button onClick={() => setMode("LIVE")} className={`flex-1 py-4 rounded-xl font-bold transition-all ${mode === "LIVE" ? "bg-white text-teal-600 shadow-md" : "text-slate-400 hover:text-slate-600"}`}>👥 Live Session</button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-2">Discussion Topic</label>
              {/* 🔥 TWEAK 3: Added Icon to Input */}
              <div className="relative flex items-center">
                <MessageSquare className="absolute left-4 text-slate-400" size={20} />
                <input 
                  value={topic} 
                  onChange={e => setTopic(e.target.value)} 
                  placeholder="e.g. Future of Generative AI" 
                  className="w-full pl-12 pr-5 py-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-medium" 
                />
              </div>
            </div>

            {mode === "AI" && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-black text-slate-400 uppercase ml-2">Intensity Level</label>
                <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100 gap-2">
                  {["Easy", "Medium", "Hard"].map(lvl => (
                    <button key={lvl} onClick={() => setDifficulty(lvl)} className={`flex-1 py-3 rounded-xl font-bold transition-all ${difficulty === lvl ? "bg-white text-teal-600 shadow-sm" : "text-slate-400 hover:text-slate-400"}`}>
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* 🔥 TWEAK 3: Upgraded Gradient Button with Icon */}
            <button 
              onClick={() => handleStartSession("R-"+Math.floor(Math.random()*9000))} 
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-6 rounded-2xl font-black shadow-xl shadow-teal-600/30 hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-95 transition-all mt-4 flex items-center justify-center gap-2"
            >
              <Zap size={22} className="text-teal-100" /> Initialize Room
            </button>

            {mode === "LIVE" && (
              <div className="flex gap-3 pt-6 border-t border-slate-50">
                {/* 🔥 TWEAK 3: Added Icon to Input */}
                <div className="relative flex-1 flex items-center">
                  <UsersIcon className="absolute left-4 text-slate-400" size={20} />
                  <input 
                    value={joinId} 
                    onChange={e => setJoinId(e.target.value)} 
                    placeholder="Enter Shared ID" 
                    className="w-full pl-12 pr-5 py-5 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500/20 transition-all font-medium" 
                  />
                </div>
                <button onClick={() => handleStartSession(joinId)} className="bg-slate-900 text-white px-10 rounded-2xl font-black hover:bg-slate-800 transition-all">Join</button>
              </div>
            )}
          </div>
        </div>
      ) : isFinished ? (
        <div ref={reportRef} className="max-w-5xl mx-auto bg-white p-12 rounded-[3.5rem] shadow-2xl border border-white animate-in zoom-in duration-700 my-8">
          <div className="flex justify-between items-center mb-16">
            <div>
               <div className="inline-block bg-teal-50 text-teal-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter mb-4">Post-Session Analytics</div>
               <h2 className="text-4xl font-black text-slate-900">Performance Report</h2>
            </div>
            <button onClick={handleExportPDF} className="no-pdf flex items-center gap-2 bg-white px-6 py-4 rounded-2xl text-teal-600 font-black shadow-sm border border-slate-200 hover:bg-teal-50 transition-all">
              <Download size={20}/> Export PDF
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-inner break-inside-avoid">
              <ResponsiveContainer width="100%" height={350}>
                <RadarChart data={analysisData}>
                  <PolarGrid stroke="#cbd5e1" />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize: 12, fontWeight: 700, fill: '#64748b'}} />
                  <RadarArea name="You" dataKey="A" stroke="#0d9488" fill="#0d9488" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-8">
              <div className="bg-teal-600 p-12 rounded-[3rem] text-white shadow-2xl shadow-teal-600/40 relative overflow-hidden group min-h-[300px] flex flex-col justify-center break-inside-avoid" style={{backgroundColor: '#0d9488'}}>
                <div className="relative z-10">
                  <p className="text-xs font-bold uppercase opacity-60 tracking-widest">Industry Readiness</p>
                  
                  {myStats.isEvaluating ? (
                    <div className="mt-8 flex flex-col items-start gap-4">
                      <Loader2 className="w-12 h-12 animate-spin text-teal-200 opacity-80" />
                      <p className="text-xl font-bold text-teal-100 animate-pulse">Evaluating Transcript... <br/><span className="text-sm font-medium opacity-75">(Takes up to 45s)</span></p>
                    </div>
                  ) : (
                    <>
                      <p className="text-8xl font-black mt-4 tabular-nums">{myStats.score}%</p>
                      <p className="mt-6 text-teal-50 font-medium leading-relaxed">
                        {myStats.aiFeedback || "Analytics collected successfully based on your participation."}
                      </p>
                    </>
                  )}
                  
                </div>
                <Award className="absolute -right-6 -bottom-6 w-48 h-48 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
              </div>
              <button onClick={() => window.location.reload()} className="no-pdf w-full py-5 rounded-2xl border-2 border-slate-100 font-bold text-slate-400 hover:bg-slate-50 transition-all">Start New Practice</button>
            </div>
          </div>

          <div className="mt-16 bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
             <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <MessageSquare className="text-teal-600" /> Session Transcript
             </h3>
             <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-4">
                {messages.length === 0 ? (
                  <p className="text-slate-400 font-medium">No messages were exchanged in this session.</p>
                ) : (
                  messages.map((m, i) => {
                    const isMe = m.user === myName || m.user === "You" || m.senderId === socket.id;
                    
                    const highlightText = m.message.toLowerCase().trim();
                    const highlight = isMe ? myStats.highlights?.find(h => 
                      highlightText.includes((h.text || "---").toLowerCase().trim())
                    ) : null;

                    const isVeryShort = isMe && m.message.trim().split(/\s+/).length < 3 && !highlight;
                    const status = highlight ? highlight.quality : (isVeryShort ? "Needs Improvement" : null);

                    return (
                      <div key={i} className={`break-inside-avoid bg-white p-6 rounded-3xl shadow-sm border transition-all ${status === "Strong" ? 'border-green-400 ring-2 ring-green-50' : status === "Needs Improvement" ? 'border-red-400 ring-2 ring-red-50' : 'border-slate-100'}`}>
                         <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">{isMe ? "You" : m.user}</span>
                           {status && (
                              <span className={`whitespace-nowrap flex-shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${status === 'Strong' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {status}
                              </span>
                           )}
                         </div>
                         <p className="text-base font-medium text-slate-700 leading-relaxed">{m.message}</p>
                         
                         {highlight?.reason && (
                           <div className={`mt-3 p-3 rounded-xl text-[11px] font-bold italic border-l-4 ${status === 'Strong' ? 'bg-green-50 text-green-600 border-green-300' : 'bg-red-50 text-red-500 border-red-300'}`}>
                              AI Insight: {highlight.reason}
                           </div>
                         )}

                         {isVeryShort && (
                           <p className="mt-2 text-[10px] text-red-400 font-bold italic opacity-80">💡 High Scoring Tip: One-word answers like "{m.message}" decrease your communication score.</p>
                         )}
                      </div>
                    );
                  })
                )}
             </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-160px)] min-h-[600px] overflow-hidden relative">
          
          <AnimatePresence>
            {isPrepTime && (
              <motion.div 
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                className="absolute inset-0 z-40 bg-slate-900/80 rounded-[3rem] flex flex-col items-center justify-center text-white border border-slate-700"
              >
                <div className="bg-teal-500/20 p-6 rounded-full mb-8">
                  <Clock size={64} className="text-teal-400 animate-pulse" />
                </div>
                <h2 className="text-4xl font-black mb-4">Preparation Time</h2>
                <p className="text-slate-300 font-medium text-lg mb-10 text-center max-w-md">Gather your thoughts on <strong className="text-white">"{topic}"</strong> before the discussion begins.</p>
                <div className="text-8xl font-black tabular-nums text-teal-400 mb-12 drop-shadow-[0_0_20px_rgba(45,212,191,0.5)]">
                  {prepCountdown}s
                </div>
                <button 
                  onClick={() => setIsPrepTime(false)}
                  className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all border border-white/20"
                >
                  Skip & Start Now
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden min-h-0">
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-teal-600 mb-1">{mode} Discussion {mode === "AI" && `• ${difficulty}`}</span>
                <h2 className="font-extrabold text-slate-800 text-lg leading-tight">{topic || "Synchronizing Topic..."}</h2>
              </div>

              <div className="flex items-center gap-4">
                {mode === "LIVE" && (
                  <div className="text-right border-r-2 pr-4 border-slate-100 mr-2 hidden sm:block">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Share Room ID</p>
                    <p className="font-mono font-black text-teal-600 text-lg bg-teal-50 px-3 py-1 rounded-lg mt-1 border border-teal-100">{roomId}</p>
                  </div>
                )}
                
                <button onClick={() => setShowEndModal(true)} className="bg-red-50 text-red-600 px-8 py-4 rounded-2xl font-black text-sm hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100">End Session</button>
              </div>
            </div>

            <div className="bg-slate-100/50 flex-1 rounded-[2.5rem] p-6 overflow-y-auto border border-slate-200 shadow-inner grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
               {gridUsers.map((user, idx) => {
                  const isActive = currentSpeaker === user.name || (currentSpeaker === "You" && user.name === myName);
                  return (
                      <div key={idx} className={`aspect-video bg-slate-800 rounded-3xl relative flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'ring-[5px] ring-teal-500 shadow-[0_0_30px_rgba(13,148,136,0.5)] z-10' : 'ring-1 ring-slate-700'}`}>
                        <div className={`p-5 rounded-full ${isActive ? 'bg-teal-500/20' : 'bg-slate-700'}`}>
                           <User size={48} className={isActive ? 'text-teal-400' : 'text-slate-400'}/>
                        </div>
                        
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-2">
                           {isActive && <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-pulse shadow-[0_0_8px_#2dd4bf]"></div>}
                           <span className="text-white text-xs font-bold truncate max-w-[120px]">
                             {user.type === "Host" ? `${user.name || "Host"} (You)` : user.name}
                           </span>
                           
                           {isActive && (
                             <span className="text-teal-400 text-[10px] font-mono font-bold bg-teal-400/10 px-1.5 py-0.5 rounded">
                                {speakingTime}s
                             </span>
                           )}
                        </div>

                        {user.type === "Host" && (
                          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm p-2 rounded-xl">
                            {isMicOn ? <Mic size={14} className="text-green-400 animate-pulse"/> : <MicOff size={14} className="text-red-400"/>}
                          </div>
                        )}
                     </div>
                  );
               })}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden min-h-0">
            
            <div className="bg-white h-full flex flex-col rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-0">
               <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center shrink-0">
                  <h3 className="font-black text-slate-700 uppercase tracking-widest text-xs flex items-center gap-2">
                     <MessageSquare size={16} className="text-teal-600"/> Discussion Room
                  </h3>
                  <span className="bg-white px-3 py-1 rounded-full text-[10px] font-bold text-slate-400 border border-slate-100">{participants.length + (mode==="AI"? 5:0)} Connected</span>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-slate-50/30 min-h-0">
                 {messages.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                     <MessageSquare size={40} className="mb-3" />
                     <p className="font-bold text-sm">Start the conversation...</p>
                   </div>
                 )}
                 {messages.map((m, i) => {
                   const isMe = m.user === myName || m.senderId === socket.id;
                   return (
                     <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in slide-in-from-bottom-2`}>
                       <span className={`text-[9px] font-black uppercase tracking-widest mb-1 px-2 ${isMe ? "text-teal-600" : "text-slate-400"}`}>
                         {isMe ? "You" : m.user}
                       </span>
                       {/* 🔥 TWEAK 2: Better readability max-width */}
                       <div className={`max-w-[75%] p-4 rounded-3xl text-sm font-medium ${isMe ? "bg-teal-600 text-white rounded-tr-sm shadow-md shadow-teal-600/10" : "bg-white text-slate-700 rounded-tl-sm border border-slate-200 shadow-sm"}`}>
                         {m.message}
                       </div>
                     </div>
                   );
                 })}
                 <div ref={messagesEndRef} />
               </div>

               <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3 shrink-0 relative">
                  
                  {/* 🔥 TWEAK 1: Animated Listening Indicator */}
                  <AnimatePresence>
                    {isMicOn && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute -top-10 left-6 bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg z-10"
                      >
                        <div className="flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></span>
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></span>
                        </div>
                        Listening...
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-2 items-center">
                    <button onClick={toggleMic} className={`p-4 rounded-2xl transition-all shrink-0 z-20 ${isMicOn ? "bg-red-100 text-red-600 animate-pulse border border-red-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                        {isMicOn ? <Mic size={20}/> : <MicOff size={20}/>}
                    </button>
                    <input 
                      value={input} 
                      onChange={e => setInput(e.target.value)} 
                      onKeyPress={e => e.key === 'Enter' && handleSend()} 
                      className="flex-1 w-full min-w-0 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400 relative z-20" 
                      placeholder={isMicOn ? "Speak to type..." : "Type your message..."}
                    />
                    <button onClick={handleSend} disabled={!input.trim()} className="shrink-0 bg-teal-600 text-white p-4 rounded-2xl disabled:opacity-50 disabled:bg-slate-300 hover:scale-105 transition-all shadow-md shadow-teal-600/20 z-20">
                      <Send size={20}/>
                    </button>
                  </div>
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}