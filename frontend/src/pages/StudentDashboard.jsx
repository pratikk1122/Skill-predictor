import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Video, Brain, PieChart, Users, Building2, ArrowUpRight, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MobileBottomNav from "../components/MobileBottomNav";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [studentInfo, setStudentInfo] = useState({ name: "", email: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedName = localStorage.getItem("userName"); 
    const storedEmail = localStorage.getItem("userEmail");
    
    setStudentInfo({
      name: storedName || "Student Candidate",
      email: storedEmail || "student@skillpredictor.com"
    });
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
    } catch (err) { console.error("Logout API failed"); }
    
    localStorage.clear();
    navigate("/login");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result);
      reader.readAsDataURL(file);
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-slate-900 overflow-hidden relative selection:bg-sky-400 selection:text-slate-950">
      {/* Background Tech Grid */}
      <div className="absolute top-0 left-0 w-full h-full bg-tech-grid opacity-60 pointer-events-none z-0"></div>

      <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
      
      <Sidebar 
        handleLogout={handleLogout} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-10 pb-28 md:pb-12 relative z-10 scroll-smooth">
        <Navbar 
          profileImage={profileImage} 
          setProfileImage={setProfileImage}
          fileInputRef={fileInputRef}
          studentName={studentInfo.name}
          studentEmail={studentInfo.email}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />

        {/* Command Center Telemetry Banner */}
        <div className="mb-4 sm:mb-8 mt-1 sm:mt-3 bg-white border-2 border-slate-900 rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#090d16] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">
                TELEMETRY // CANDIDATE COMMAND DECK
              </span>
            </div>
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 uppercase tracking-tight">
              Welcome, <span className="text-sky-600 capitalize">{studentInfo.name}</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
              Select a placement protocol module below to calibrate your skills.
            </p>
          </div>

          {/* Quick System Badges */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg text-sky-700 font-mono text-[10px] sm:text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-sky-600 fill-current" />
              <span>ENGINES: 6 READY</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 font-mono text-[10px] sm:text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SESSION: SECURED</span>
            </div>
          </div>
        </div>

        {/* Dynamic Responsive Grid: 2 Columns Mobile, 3 Columns Laptop */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5 lg:gap-6 pb-6"
        >
          <FeatureCard 
            variants={itemVariants}
            index="01"
            tag="AI ENGINE"
            title="Resume Scorer" 
            desc="Neural ATS parser, keyword gap analysis & annotated redline PDF download." 
            icon={<FileText />} 
            badgeColor="bg-sky-500 text-slate-950"
            onClick={handleResumeScorerClick}
          />

          <FeatureCard 
            variants={itemVariants}
            index="02"
            tag="VOICE STUDIO"
            title="AI Mock Interview" 
            desc="Adaptive speech-to-text dialogue simulations with instant real-time telemetry." 
            icon={<Video />} 
            badgeColor="bg-purple-500 text-white"
            onClick={handleAIInterviewClick}
          />
          
          <FeatureCard 
            variants={itemVariants}
            index="03"
            tag="COGNITIVE MATRIX"
            title="Aptitude Test" 
            desc="Master quantitative arithmetic, verbal logic, and percentile benchmarks." 
            icon={<Brain />} 
            badgeColor="bg-amber-500 text-slate-950"
            onClick={handleAptitudeClick}
          />

          <FeatureCard 
            variants={itemVariants}
            index="04"
            tag="TELEMETRY"
            title="Analytics" 
            desc="Deep performance visualization, competency radar, and progress curves." 
            icon={<PieChart />} 
            badgeColor="bg-emerald-500 text-slate-950"
            onClick={handleAnalyticsClick}
          />

          <FeatureCard 
            variants={itemVariants}
            index="05"
            tag="MULTI-AGENT"
            title="Group Discussion" 
            desc="AI-moderated roundtable communication chambers for vocal articulation." 
            icon={<Users />} 
            badgeColor="bg-rose-500 text-white" 
            onClick={handleGDClick}
          />

          <FeatureCard 
            variants={itemVariants}
            index="06"
            tag="ENTERPRISE VAULT"
            title="Company Prep" 
            desc="Targeted recruitment archives for Google, Amazon, Microsoft, TCS, and Infosys." 
            icon={<Building2 />} 
            badgeColor="bg-indigo-500 text-white" 
            onClick={handleCompanyPrepClick}
          />
        </motion.div>
      </main>

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

const FeatureCard = ({ index, tag, title, desc, icon, badgeColor, onClick, variants }) => (
  <motion.div
    variants={variants}
    whileHover={{ 
      y: -4, 
      transition: { duration: 0.18, ease: "easeOut" } 
    }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="bg-white p-3 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#090d16] sm:shadow-[4px_4px_0px_0px_#090d16] hover:shadow-[6px_6px_0px_0px_#0ea5e9] hover:border-sky-500 transition-all duration-200 group cursor-pointer relative overflow-hidden flex flex-col justify-between h-full"
  >
    <div>
      {/* Top Protocol Index & Category */}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <span className="font-mono text-[10px] sm:text-xs font-black text-sky-600 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
          #{index}
        </span>
        <span className="font-mono text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
          {tag}
        </span>
      </div>

      {/* Compact Icon */}
      <div className={`w-8 h-8 sm:w-11 sm:h-11 lg:w-12 lg:h-12 ${badgeColor} rounded-lg sm:rounded-xl flex items-center justify-center border-2 border-slate-900 mb-2 sm:mb-3.5 shadow-sm transform group-hover:rotate-6 transition-transform`}>
        <span className="block sm:hidden">
          {React.cloneElement(icon, { size: 16, strokeWidth: 2.3 })}
        </span>
        <span className="hidden sm:block">
          {React.cloneElement(icon, { size: 22, strokeWidth: 2.4 })}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xs sm:text-base lg:text-lg font-black text-slate-900 mb-1 sm:mb-1.5 group-hover:text-sky-600 transition-colors uppercase tracking-tight line-clamp-1">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-slate-500 text-[9px] sm:text-xs leading-tight sm:leading-relaxed mb-2 sm:mb-4 font-medium line-clamp-2">
        {desc}
      </p>
    </div>

    {/* Bottom Action Prompt */}
    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
      <span className="font-mono text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-slate-700 group-hover:text-sky-600 transition-colors">
        <span className="sm:hidden">LAUNCH</span>
        <span className="hidden sm:inline">LAUNCH PROTOCOL</span>
      </span>
      <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </div>
  </motion.div>
);

export default StudentDashboard;