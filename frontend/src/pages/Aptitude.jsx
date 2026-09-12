import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ROUTES } from "../routes/routes";
import MobileBottomNav from "../components/MobileBottomNav";
import ThemeToggle from "../components/common/ThemeToggle";
import { 
  Calculator, 
  Brain, 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  Target, 
  Sparkles, 
  CheckCircle2 
} from "lucide-react";

// --- STATIC DATA FOR CATEGORIES ---
const aptitudeCategories = [
  {
    id: 'mathematics',
    title: 'Quantitative Aptitude',
    icon: Calculator,
    color: 'bg-blue-600',
    badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
    description: 'Arithmetic, percentages, speed & distance, time & work, probability and algebraic equations.',
    level: 'Intermediate',
    accuracy: '76%',
    topics: ['Percentages & Averages', 'Profit, Loss & Discount', 'Speed & Distance', 'Probability']
  },
  {
    id: 'logical-reasoning',
    title: 'Logical Reasoning',
    icon: Brain,
    color: 'bg-purple-600',
    badgeColor: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50',
    description: 'Analytical puzzles, sequences, critical reasoning patterns and syllogisms.',
    level: 'Advanced',
    accuracy: '88%',
    topics: ['Syllogism', 'Blood Relations', 'Number Series', 'Seating Arrangements']
  },
  {
    id: 'verbal-ability',
    title: 'Verbal Ability',
    icon: BookOpen,
    color: 'bg-teal-600',
    badgeColor: 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900/50',
    description: 'Reading comprehension, advanced vocabulary, contextual grammar and sentence correction.',
    level: 'Beginner',
    accuracy: '45%',
    topics: ['Reading Comprehension', 'Synonyms & Antonyms', 'Sentence Correction', 'Para Jumbles']
  }
];

const Aptitude = () => {
  const navigate = useNavigate();

  const handleStartTest = async (categoryId) => {
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const res = await axios.post(
        `${API_URL}/aptitude/start`, 
        { category: categoryId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success && res.data.sessionId) {
        navigate(`/student/aptitude/${categoryId}?sessionId=${res.data.sessionId}`);
      } else {
        navigate(`/student/aptitude/${categoryId}`);
      }
    } catch {
      navigate(`/student/aptitude/${categoryId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 selection:bg-teal-500/20 pb-28 md:pb-12 transition-colors duration-300">
      
      {/* ================= HEADER ================= */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              to={ROUTES.STUDENT_DASHBOARD} 
              className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:border-teal-500 transition-all border border-slate-200 dark:border-slate-700 shadow-sm active:scale-95"
              title="Return to Dashboard"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-800 dark:text-white tracking-tight">
                Aptitude <span className="text-teal-600 dark:text-teal-400">Hub</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Targeted Placement Practice Sessions</p>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        
        {/* ================= PAGE TITLE ================= */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 mb-3">
            <Sparkles size={13} />
            <span>Placement Readiness Practice</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
            Skill Training Hub
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-medium leading-relaxed">
            Select an assessment category to practice real-world aptitude questions benchmarked against current hiring patterns.
          </p>
        </div>

        {/* ================= CATEGORY CARDS GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aptitudeCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div 
                key={category.id} 
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between group"
              >
                <div>
                  {/* Header: Icon & Level */}
                  <div className="flex justify-between items-start mb-5">
                    <div className={`w-12 h-12 rounded-2xl ${category.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${category.badgeColor}`}>
                        {category.level}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400 mt-1.5 flex items-center gap-1">
                        <Target size={12} className="text-teal-600 dark:text-teal-400" />
                        Acc: {category.accuracy}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-5 font-normal">
                    {category.description}
                  </p>

                  {/* Topics Assessed */}
                  <div className="mb-6 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Key Topics Covered</p>
                    <div className="flex flex-wrap gap-1.5">
                      {category.topics.map((topic, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[11px] font-medium border border-slate-200/60 dark:border-slate-700 shadow-2xs"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Standardized Action Button */}
                <button 
                  onClick={() => handleStartTest(category.id)} 
                  className="w-full h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 active:scale-95 group-hover:shadow-lg"
                >
                  <span>Start Practice Session</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>

      </div>

      {/* 📱 Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

export default Aptitude;