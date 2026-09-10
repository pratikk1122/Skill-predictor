import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Video, Brain, PieChart, Users, Building2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // ✨ Animations upgrade
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [studentInfo, setStudentInfo] = useState({ name: "", email: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedName = localStorage.getItem("userName"); 
    const storedEmail = localStorage.getItem("userEmail");
    
    setStudentInfo({
      name: storedName || "Student User",
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

  // ✨ Animation Configurations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden relative">
      {/* Dynamic Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.04] pointer-events-none z-0" 
           style={{ backgroundImage: `radial-gradient(#0d9488 1.5px, transparent 1.5px)`, backgroundSize: '40px 40px' }}></div>

      <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
      
      <Sidebar handleLogout={handleLogout} />

      <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative z-10 scroll-smooth">
        <Navbar 
          profileImage={profileImage} 
          setProfileImage={setProfileImage}
          fileInputRef={fileInputRef}
          studentName={studentInfo.name}
          studentEmail={studentInfo.email}
        />

        {/* Welcome Section with Reveal Animation */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12 mt-6"
        >
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">
            Welcome back, <span className="text-teal-600 capitalize">{studentInfo.name}</span>! 👋
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-500 mt-2 text-lg font-medium"
          >
            Your path to professional excellence starts here.
          </motion.p>
        </motion.div>

        {/* Animated Grid System */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10"
        >
          <FeatureCard 
            variants={itemVariants}
            title="Resume Scorer" 
            desc="AI-powered ATS score & detailed analysis feedback." 
            icon={<FileText />} 
            color="bg-gradient-to-br from-blue-500 to-blue-700"
            onClick={handleResumeScorerClick}
          />

          <FeatureCard 
            variants={itemVariants}
            title="AI Mock Interview" 
            desc="Real-time technical & HR practice with AI feedback." 
            icon={<Video />} 
            color="bg-gradient-to-br from-purple-500 to-purple-700"
            onClick={handleAIInterviewClick}
          />
          
          <FeatureCard 
            variants={itemVariants}
            title="Aptitude Test" 
            desc="Master quantitative, verbal & logical reasoning." 
            icon={<Brain />} 
            color="bg-gradient-to-br from-orange-500 to-orange-700"
            onClick={handleAptitudeClick} // 🔥 FIXED ROUTING HERE
          />

          <FeatureCard 
            variants={itemVariants}
            title="Analytics" 
            desc="Visualise your performance and growth charts." 
            icon={<PieChart />} 
            color="bg-gradient-to-br from-teal-500 to-teal-700"
            onClick={handleAnalyticsClick}
          />

          <FeatureCard 
            variants={itemVariants}
            title="Group Discussion" 
            desc="AI-moderated communication rooms for practice." 
            icon={<Users />} 
            color="bg-gradient-to-br from-pink-500 to-pink-700" 
            onClick={handleGDClick}
          />

          <FeatureCard 
            variants={itemVariants}
            title="Company Prep" 
            desc="Specific preparation modules for Tech Giants." 
            icon={<Building2 />} 
            color="bg-gradient-to-br from-indigo-500 to-indigo-700" 
            onClick={handleCompanyPrepClick}
          />
        </motion.div>
      </main>
    </div>
  );
};

const FeatureCard = ({ title, desc, icon, color, onClick, variants }) => (
  <motion.div
    variants={variants}
    whileHover={{ 
      y: -12, 
      scale: 1.02,
      transition: { duration: 0.3, ease: "easeInOut" } 
    }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-white p-8 rounded-[2.5rem] border border-slate-200/50 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.12)] transition-all duration-500 group cursor-pointer relative overflow-hidden"
  >
    {/* Animated Floating Glow */}
    <motion.div 
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, 90, 0] 
      }}
      transition={{ duration: 8, repeat: Infinity }}
      className={`absolute -top-10 -right-10 w-40 h-40 opacity-[0.08] rounded-full blur-3xl ${color}`}
    ></motion.div>

    {/* Icon Container with Hover Rotation */}
    <div className={`w-16 h-16 ${color} rounded-[1.25rem] flex items-center justify-center text-white mb-8 shadow-xl transform group-hover:rotate-[10deg] transition-all duration-500 ease-out`}>
      {React.cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
    </div>

    <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-teal-600 transition-colors tracking-tight">
      {title}
    </h3>
    
    <p className="text-slate-500 text-[16px] leading-relaxed mb-10 font-medium">
      {desc}
    </p>

    {/* Animated Action Button */}
    <div className="flex items-center gap-2 text-teal-600 font-extrabold text-[14px] uppercase tracking-widest transition-all">
      <span className="relative overflow-hidden group">
        Open Tool
        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-teal-600 group-hover:w-full transition-all duration-300"></span>
      </span>
      <motion.div
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronRight size={20} />
      </motion.div>
    </div>
  </motion.div>
);

export default StudentDashboard;