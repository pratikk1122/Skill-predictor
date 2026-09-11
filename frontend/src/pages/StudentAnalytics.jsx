import React, { useEffect, useState } from "react"; 
import { useNavigate } from "react-router-dom"; 
import { ROUTES } from "../routes/routes"; 
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MobileBottomNav from "../components/MobileBottomNav";
import { jsPDF } from "jspdf";
import { 
  TrendingUp, 
  Target, 
  Zap, 
  BrainCircuit, 
  Download, 
  Trophy,
  ArrowLeft,
  FileText,
  UserCheck,
  Building2,
  Users,
  Lightbulb,
  AlertCircle
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

const StudentAnalytics = () => {
  const navigate = useNavigate();
  const [performance, setPerformance] = useState([]);
  const [skills, setSkills] = useState([]);
  const [career, setCareer] = useState({});
  const [weakness, setWeakness] = useState([]);
  const [studyPlan, setStudyPlan] = useState([]);
  const [activity, setActivity] = useState({});
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(true);

  const [detailedCounts, setDetailedCounts] = useState({
    resumeScans: 0,
    mockInterviews: 0,
    aptitudeTests: 0,
    companyPrepTests: 0,
    gdParticipations: 0
  });

  const [aiSuggestions, setAiSuggestions] = useState([]);

  // 🔥 PERSONALIZATION FIX: Ensuring valid ID extraction
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = storedUser._id || storedUser.id; 

  useEffect(() => {
    if (studentId && studentId !== "123") {
      fetchAnalytics();
    } else if (!studentId) {
      console.warn("No valid session found. Redirecting...");
      navigate("/login");
    }
  }, [studentId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // REQUIREMENT: Consolidating calls with the correct studentId
      const [perf, skill, car, weak, study, act, ins, suggs] = await Promise.all([
        api.get(`/analytics/performance/${studentId}`),
        api.get(`/analytics/skills/${studentId}`),
        api.get(`/analytics/career/${studentId}`),
        api.get(`/analytics/weakness/${studentId}`),
        api.get(`/analytics/study-plan/${studentId}`),
        api.get(`/analytics/activity/${studentId}`),
        api.get(`/analytics/insights/${studentId}`),
        api.get(`/analytics/improvement-suggestions/${studentId}`)
      ]);

      // Map Performance
      setPerformance([
        { name: "Resume", score: perf.data.resume || 0 },
        { name: "Aptitude", score: perf.data.aptitude || 0 },
        { name: "Interview", score: perf.data.interview || 0 },
        { name: "GD", score: perf.data.gd || 0 }
      ]);

      // Update States
      setSkills(skill.data || []);
      setCareer(car.data || {});
      setWeakness(weak.data.weaknesses || []);
      setStudyPlan(study.data || []);
      setActivity(act.data || {});
      setInsight(ins.data.insight || "Keep practicing to generate AI insights.");
      setAiSuggestions(suggs.data.suggestions || []);
      
      // 🔥 COUNT FIX: Direct mapping from backend keys
      setDetailedCounts({
        resumeScans: act.data.resumeScans || 0, 
        mockInterviews: act.data.interviewMocks || 0,
        aptitudeTests: act.data.aptitudeTests || 0,
        companyPrepTests: act.data.companyPrepCount || 0, 
        gdParticipations: act.data.gdSessions || 0
      });

    } catch (err) {
      console.error("Critical: Analytics load failed", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    try {
      const studentName = localStorage.getItem("userName") || "Student Candidate";
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      // Header Banner
      doc.setFillColor(13, 148, 136); // #0D9488
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("SKILL PREDICTOR AI", 105, 12, { align: "center" });
      doc.setFontSize(8);
      doc.text("OFFICIAL PLACEMENT READINESS & SKILL ASSESSMENT REPORT", 105, 18, { align: "center" });

      // Outer Decorative Border
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.5);
      doc.rect(10, 30, 190, 252);

      // Certificate Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(20);
      doc.text("VERIFIED CANDIDATE ASSESSMENT", 105, 48, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("This credential verifies the technical performance evaluation for:", 105, 56, { align: "center" });

      // Candidate Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(13, 148, 136);
      doc.text(studentName.toUpperCase(), 105, 68, { align: "center" });

      // Divider line
      doc.setDrawColor(13, 148, 136);
      doc.setLineWidth(0.6);
      doc.line(70, 72, 140, 72);

      // Domain Scores Section
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("EVALUATED PERFORMANCE DOMAINS", 20, 86);

      const scores = [
        ["Resume ATS Optimization", `${performance.find(p => p.name === "Resume")?.score || 0}%`],
        ["Aptitude & Logical Reasoning", `${performance.find(p => p.name === "Aptitude")?.score || 0}%`],
        ["Technical & HR AI Interview", `${performance.find(p => p.name === "Interview")?.score || 0}%`],
        ["Group Discussion Communication", `${performance.find(p => p.name === "GD")?.score || 0}%`],
      ];

      let y = 96;
      scores.forEach(([domain, val]) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(20, y - 5, 170, 9, 2, 2, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.text(domain, 25, y + 1.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(13, 148, 136);
        doc.text(val, 180, y + 1.5, { align: "right" });
        y += 13;
      });

      // Activity summary
      y += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("ASSESSMENT ACTIVITY AUDIT", 20, y);

      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const activities = [
        `Mock Interviews Completed: ${detailedCounts.mockInterviews || 0}`,
        `Aptitude Tests Taken: ${detailedCounts.aptitudeTests || 0}`,
        `Resume Scans & ATS Evaluations: ${detailedCounts.resumeScans || 0}`,
        `Company Prep Modules Explored: ${detailedCounts.companyPrepTests || 0}`,
        `Group Discussion Sessions: ${detailedCounts.gdParticipations || 0}`
      ];
      activities.forEach(act => {
        doc.text(`•   ${act}`, 25, y);
        y += 7.5;
      });

      // Verification Badge Box
      doc.setFillColor(240, 253, 250);
      doc.roundedRect(20, 222, 170, 28, 4, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 118, 110);
      doc.text("VERIFIED BY SKILL PREDICTOR AI ENGINE", 105, 233, { align: "center" });
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text(`Issue Date: ${new Date().toLocaleDateString()} | Credential ID: SP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`, 105, 241, { align: "center" });

      doc.save(`SkillPredictor_Certificate_${studentName.replace(/\s+/g, "_")}.pdf`);
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-teeny-greeny">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-greeny border-r-transparent"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-greeny animate-pulse">Syncing Skill DNA...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-teeny-greeny text-text-dark font-sans selection:bg-blue-greeny/20">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 pb-28 md:pb-10 scroll-smooth">
        <Navbar />

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <button 
            onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)} 
            className="flex items-center gap-2 px-6 py-3 bg-white border border-blue-greeny/10 rounded-2xl text-[11px] font-black text-blue-greeny hover:bg-blue-greeny hover:text-white transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={14} />
            BACK TO DASHBOARD
          </button>

          <div className="flex items-center gap-3">
             <button
               onClick={downloadReport}
               className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-black rounded-2xl uppercase tracking-wider shadow-lg shadow-teal-600/20 active:scale-95 transition-all"
             >
               <Download size={14} />
               DOWNLOAD CERTIFICATE
             </button>
             <span className="hidden sm:inline-block px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] border border-slate-800 shadow-xl">
               Personal Analytics Engine
             </span>
          </div>
        </div>

        {/* Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-heading font-black text-text-dark uppercase tracking-tighter">
              Performance <span className="text-blue-greeny font-light">Metric Suite</span>
            </h1>
            <p className="text-[11px] text-text-light font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-greeny animate-ping"></div>
              Live Audit for {storedUser.name || "Student"}
            </p>
          </div>
          <button
            onClick={downloadReport}
            className="group flex items-center gap-3 bg-white text-slate-900 border-2 border-slate-900 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-xl active:scale-95"
          >
            <Download size={16} className="group-hover:animate-bounce" />
            Export Personalized Audit
          </button>
        </div>

        {/* 🔥 REAL-TIME COUNTS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-10">
          <DetailCard icon={<FileText />} label="Resume Scans" value={detailedCounts.resumeScans} sub="Scored" color="text-blue-600" bg="bg-blue-50" />
          <DetailCard icon={<UserCheck />} label="Interview Mock" value={detailedCounts.mockInterviews} sub="Sessions" color="text-purple-600" bg="bg-purple-50" />
          <DetailCard icon={<BrainCircuit />} label="Apti Logic" value={detailedCounts.aptitudeTests} sub="Solved" color="text-amber-600" bg="bg-amber-50" />
          <DetailCard icon={<Building2 />} label="Prep Labs" value={detailedCounts.companyPrepTests} sub="Companies" color="text-indigo-600" bg="bg-indigo-50" />
          <DetailCard icon={<Users />} label="GD Forums" value={detailedCounts.gdParticipations} sub="Participated" color="text-rose-600" bg="bg-rose-50" />
        </div>

        {/* VISUAL ANALYTICS */}
        <div className="grid lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 p-10">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-text-dark mb-10">
              <div className="w-1.5 h-6 bg-blue-greeny rounded-full"></div> 
              Placement Readiness Curve
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={performance}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 900}} />
                <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontSize: '11px', fontWeight: '900' }} />
                <Bar dataKey="score" fill="#5cbdb9" radius={[12, 12, 12, 12]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-4 bg-white rounded-[3rem] border border-slate-100 p-10 flex flex-col items-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-slate-400">Skill DNA</h2>
            <h3 className="text-xl font-black uppercase mb-8 text-text-dark text-center">Radar Profile</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skills}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="skill" tick={{fill: '#64748B', fontSize: 9, fontWeight: 900}} />
                <Radar name="Proficiency" dataKey="score" stroke="#5cbdb9" strokeWidth={3} fill="#5cbdb9" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🔥 WEAKNESS & SUGGESTION SECTION (Requirement) */}
        <div className="grid lg:grid-cols-12 gap-8 pb-16">
          {/* AI Projected Pathway */}
          <div className="lg:col-span-4 bg-slate-950 text-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <BrainCircuit size={280} className="text-blue-greeny" />
            </div>
            <div className="relative z-10">
                <div className="inline-flex items-center px-5 py-2 bg-blue-greeny text-slate-950 rounded-full text-[9px] font-black uppercase tracking-widest mb-8">
                   AI Intelligence Engine
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">{career.recommendedCareer || "Calculating..."}</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-bold italic tracking-wide">
                  "{insight}"
                </p>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Weakness Audit */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3 text-rose-600">
                <AlertCircle size={18} /> Critical Weakness Audit
              </h2>
              <div className="flex flex-wrap gap-3">
                {weakness.length > 0 ? weakness.map((w, i) => (
                  <span key={i} className="px-6 py-3 bg-rose-50 text-rose-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 shadow-sm">
                    {w}
                  </span>
                )) : (
                  <p className="text-slate-400 font-bold text-sm">Performing more tests will unlock detailed weakness analysis.</p>
                )}
              </div>
            </div>

            {/* AI Improvement Roadmap */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-3 text-blue-greeny">
                <Lightbulb size={18} /> Personalized Improvement Roadmap
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiSuggestions.length > 0 ? aiSuggestions.map((s, i) => (
                  <div key={i} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-blue-greeny/30 transition-all group cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xs font-black text-blue-greeny mb-4 shadow-sm group-hover:bg-blue-greeny group-hover:text-white transition-all">
                      {i + 1}
                    </div>
                    <p className="text-slate-700 font-bold text-[11px] leading-relaxed uppercase tracking-tight">{s}</p>
                  </div>
                )) : (
                  <p className="text-slate-400 font-bold text-sm italic">Complete your profile activities to receive custom AI suggestions.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 📱 Mobile App Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

// Sub-component DetailCard
const DetailCard = ({ icon, label, value, sub, color, bg }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col items-center text-center">
    <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <h3 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">{value}</h3>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-4">{label}</p>
    <div className="px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
       <p className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{sub}</p>
    </div>
  </div>
);

export default StudentAnalytics;