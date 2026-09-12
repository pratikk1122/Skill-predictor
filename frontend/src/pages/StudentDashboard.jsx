import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Video, Brain, PieChart, Users, Building2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MobileBottomNav from "../components/MobileBottomNav";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [studentInfo, setStudentInfo] = useState({ name: "", email: "" });

  useEffect(() => {
    const storedName = localStorage.getItem("userName"); 
    const storedEmail = localStorage.getItem("userEmail");
    const storedImage = localStorage.getItem("userProfileImage");
    
    if (storedImage) {
      setProfileImage(storedImage);
    }

    setStudentInfo({
      name: storedName || "Student User",
      email: storedEmail || "student@skillpredictor.com"
    });
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await api.post("/auth/logout", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch {
      // Ignore network failure on logout
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  /* ===============================
        CLICK HANDLERS
  ================================ */
  const handleAptitudeClick = () => navigate("/student/aptitude");
  const handleAIInterviewClick = () => navigate("/student/ai-interview");
  const handleResumeScorerClick = () => navigate("/resume-scorer");
  const handleCompanyPrepClick = () => navigate("/company-prep");
  const handleGDClick = () => navigate("/student/group-discussion");
  const handleAnalyticsClick = () => navigate("/student/analytics");

  // ✨ Animation Configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 14 }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden relative">
      {/* Background Subtle Gradient Grid */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-0" 
        style={{ backgroundImage: `radial-gradient(#0d9488 1.5px, transparent 1.5px)`, backgroundSize: '36px 36px' }}
      />

      {/* Desktop Persistent Sidebar */}
      <Sidebar handleLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 pb-28 md:pb-12 relative z-10 scroll-smooth">
        <Navbar 
          profileImage={profileImage} 
          setProfileImage={setProfileImage}
          studentName={studentInfo.name}
          studentEmail={studentInfo.email}
        />

        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 sm:mb-8 mt-1 sm:mt-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200/60 dark:border-teal-800/60">
              Student Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            Welcome back, <span className="text-teal-600 dark:text-teal-400 capitalize">{studentInfo.name}</span>! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-1.5 text-xs sm:text-sm font-medium">
            Track your preparedness, master technical domains, and accelerate your placement journey.
          </p>
        </motion.div>

        {/* Responsive Grid System */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 pb-8"
        >
          <FeatureCard 
            variants={itemVariants}
            title="Resume Scorer" 
            desc="AI-powered ATS score, recruiter heat-map simulation, and targeted keyword gap analysis." 
            icon={<FileText />} 
            color="bg-gradient-to-br from-blue-500 to-blue-700"
            onClick={handleResumeScorerClick}
          />

          <FeatureCard 
            variants={itemVariants}
            title="AI Mock Interview" 
            desc="Real-time voice & technical simulations with adaptive AI questioning and instant evaluation." 
            icon={<Video />} 
            color="bg-gradient-to-br from-purple-500 to-purple-700"
            onClick={handleAIInterviewClick}
          />
          
          <FeatureCard 
            variants={itemVariants}
            title="Aptitude Test" 
            desc="Targeted quantitative, verbal, and logical practice modules with instant answer breakdowns." 
            icon={<Brain />} 
            color="bg-gradient-to-br from-amber-500 to-orange-600"
            onClick={handleAptitudeClick}
          />

          <FeatureCard 
            variants={itemVariants}
            title="Performance Analytics" 
            desc="Multi-dimensional competency radar, study schedules, and personalized score improvements." 
            icon={<PieChart />} 
            color="bg-gradient-to-br from-teal-500 to-emerald-600"
            onClick={handleAnalyticsClick}
          />

          <FeatureCard 
            variants={itemVariants}
            title="Group Discussion" 
            desc="AI-moderated peer debate rooms with sentiment, fluency, and leadership impact tracking." 
            icon={<Users />} 
            color="bg-gradient-to-br from-pink-500 to-rose-600" 
            onClick={handleGDClick}
          />

          <FeatureCard 
            variants={itemVariants}
            title="Company Prep Hub" 
            desc="RAG-curated technical test patterns and placement blueprints for top engineering companies." 
            icon={<Building2 />} 
            color="bg-gradient-to-br from-indigo-500 to-violet-700" 
            onClick={handleCompanyPrepClick}
          />
        </motion.div>
      </main>

      {/* 📱 Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

const FeatureCard = ({ title, desc, icon, color, onClick, variants }) => (
  <motion.div
    variants={variants}
    whileHover={{ 
      y: -5, 
      transition: { duration: 0.2, ease: "easeOut" } 
    }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:border-slate-700 transition-all duration-300 group cursor-pointer flex flex-col justify-between h-full relative overflow-hidden"
  >
    {/* Subtle Background Glow */}
    <div className={`absolute -top-12 -right-12 w-28 h-28 opacity-[0.06] dark:opacity-[0.12] rounded-full blur-2xl ${color}`} />

    <div>
      {/* Icon Badge */}
      <div className={`w-11 h-11 sm:w-12 sm:h-12 ${color} rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-3.5 sm:mb-4 shadow-md group-hover:scale-105 transition-transform duration-300`}>
        {React.cloneElement(icon, { size: 22, strokeWidth: 2.2 })}
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-1.5 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors tracking-tight">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-[13px] leading-relaxed mb-4 font-normal">
        {desc}
      </p>
    </div>

    {/* Balanced Action Bar */}
    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
      <span className="text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
        Launch Module
      </span>
      <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-teal-500 transition-all">
        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  </motion.div>
);

export default StudentDashboard;