import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🔥 Requirement: Added for session creation
import { ROUTES } from "../routes/routes";
import MobileBottomNav from "../components/MobileBottomNav";

// --- STATIC DATA FOR CATEGORIES ---
const aptitudeCategories = [
  {
    id: 'mathematics',
    title: 'Mathematics',
    icon: 'fas fa-calculator',
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    description: 'Quantitative aptitude, arithmetic, percentages, time & work, probability and more.',
    level: 'Intermediate',
    accuracy: '76%',
    topics: ['Percentages & Averages', 'Profit, Loss & Discount', 'Time, Speed & Distance', 'Probability', 'Algebra & Equations']
  },
  {
    id: 'logical-reasoning',
    title: 'Logical Reasoning',
    icon: 'fas fa-brain',
    color: 'bg-purple-600',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    description: 'Patterns, sequences, analytical puzzles and critical reasoning problems.',
    level: 'Advanced',
    accuracy: '88%',
    topics: ['Syllogism', 'Blood Relations', 'Number & Letter Series', 'Seating Arrangements', 'Venn Diagrams']
  },
  {
    id: 'verbal-ability',
    title: 'Verbal Ability',
    icon: 'fas fa-book-open',
    color: 'bg-teal-500',
    lightColor: 'bg-teal-50',
    textColor: 'text-teal-600',
    description: 'Reading comprehension, vocabulary, grammar and language reasoning.',
    level: 'Beginner',
    accuracy: '45%',
    topics: ['Reading Comprehension', 'Synonyms & Antonyms', 'Sentence Correction', 'Para Jumbles', 'Idioms & Phrases']
  }
];

const Aptitude = () => {
  const navigate = useNavigate();

  // 🔥 NEW: Function to trigger backend session before navigating
  const handleStartTest = async (categoryId) => {
    try {
      const token = localStorage.getItem("token");
      
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await axios.post(
        `${API_URL}/aptitude/start`, 
        { category: categoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Navigation with sessionId (optional, but good for workflow)
      if (res.data.success) {
        // Aapka existing route format maintain rakha hai
        navigate(`/student/aptitude/${categoryId}?sessionId=${res.data.sessionId}`);
      } else {
        navigate(`/student/aptitude/${categoryId}`);
      }
    } catch (err) {
      console.error("❌ Failed to initialize aptitude session:", err.message);
      // Fallback navigation so user isn't stuck
      navigate(`/student/aptitude/${categoryId}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] font-sans selection:bg-teal-500/20 pb-20">
      
      {/* ================= HEADER ================= */}
      <div className="bg-white sticky top-0 z-40 shadow-sm border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center">
          <button onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:text-[#5cbdb9] hover:bg-teal-50 transition-all border border-slate-200 mr-6 shadow-sm">
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            Aptitude <span className="text-[#5cbdb9]">Dashboard</span>
          </h1>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 mt-12">
        
        {/* ================= PAGE TITLES ================= */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">Skill Training Hub</h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            Master the core concepts. Choose a category below to begin targeted, adaptive practice sessions.
          </p>
        </div>

        {/* ================= CATEGORY CARDS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {aptitudeCategories.map((category) => (
            <div 
              key={category.id} 
              className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 relative overflow-hidden group flex flex-col h-[380px]"
            >
              {/* Header: Icon and Level Badge */}
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className={`w-16 h-16 rounded-2xl ${category.color} flex items-center justify-center text-white shadow-lg shadow-${category.textColor}/30 transform group-hover:scale-110 transition-transform duration-300`}>
                  <i className={`${category.icon} text-2xl`}></i>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${category.lightColor} ${category.textColor}`}>
                    {category.level}
                  </span>
                  <span className="text-xs font-bold text-slate-400 mt-2">Acc: {category.accuracy}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-slate-800 mb-4 relative z-10">{category.title}</h3>

              {/* Default Description (Fades out on hover) */}
              <p className="text-slate-500 font-medium leading-relaxed transition-opacity duration-300 group-hover:opacity-0 absolute top-[150px] pr-8">
                {category.description}
              </p>

              {/* Hover Reveal: Sub-Topics (Slides up and fades in on hover) */}
              <div className="absolute top-[140px] left-8 right-8 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 pointer-events-none">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Key Topics Assessed</p>
                <ul className="space-y-2.5">
                  {category.topics.slice(0, 4).map((topic, i) => (
                    <li key={i} className="text-sm font-bold text-slate-700 flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${category.color}`}></div>
                      {topic}
                    </li>
                  ))}
                  <li className="text-xs font-bold text-slate-400 italic mt-1">+ more adaptive modules</li>
                </ul>
              </div>

              {/* Start Test Button */}
              <div className="mt-auto relative z-10 pt-6">
                <button 
                  // 🔥 UPDATED: Now calls handleStartTest instead of direct navigate
                  onClick={() => handleStartTest(category.id)} 
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 ${category.lightColor} ${category.textColor} hover:bg-slate-900 hover:text-white`}
                >
                  Start Training <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 📱 Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

export default Aptitude;