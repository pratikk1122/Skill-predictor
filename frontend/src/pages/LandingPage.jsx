import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../services/api"; 
import bgVideo from '../assets/bg.mp4'; 
import { 
  FileText, Video, Brain, Users, Building2, 
  PieChart, ArrowUpRight, CheckCircle2, Zap, 
  Sparkles, ShieldCheck, ChevronRight, MessageSquare, 
  Bot, Send, X, Terminal, Activity, ChevronDown
} from 'lucide-react';

// --- Counter Helper Component ---
const Counter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(target) || 0;
    if (end === 0) return;
    const increment = end / (duration / 10);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 10);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <span>{count.toLocaleString()}</span>;
};

// --- Hirrd-Style Dynamic Logo Component ---
const Logo = ({ name, imageUrl }) => (
  <div className="flex items-center justify-center gap-3 px-8 transition-all duration-300 hover:scale-105 group cursor-pointer flex-shrink-0">
    <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#090d16] p-2 group-hover:shadow-[4px_4px_0px_0px_#0ea5e9] group-hover:border-sky-500 transition-all">
      <img 
        src={imageUrl || `https://logo.clearbit.com/${name.toLowerCase().replace(/\s/g, '')}.com?size=100`} 
        alt={name}
        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${name}&background=090D16&color=38BDF8`; }}
        className="max-w-full max-h-full object-contain"
      />
    </div>
    <span className="text-sm font-black tracking-tight text-slate-800 group-hover:text-sky-500 uppercase whitespace-nowrap transition-colors">
      {name}
    </span>
  </div>
);

// --- Numbered Telemetry Metric Card ---
const StatCard = ({ index, target, suffix, label, sub, icon }) => (
  <div className="group relative bg-white p-5 sm:p-7 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#090d16] hover:shadow-[6px_6px_0px_0px_#0ea5e9] hover:border-sky-500 transition-all duration-200 text-left overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <span className="font-mono text-[11px] font-black text-sky-500 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
        {index}
      </span>
      <div className="w-8 h-8 rounded-lg bg-slate-900 text-sky-400 flex items-center justify-center text-sm shadow-sm group-hover:bg-sky-500 group-hover:text-slate-900 transition-colors">
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
    <h3 className="text-2xl sm:text-4xl font-black text-slate-900 mb-1 tracking-tight font-sans">
      {label === "Support" ? target : <><Counter target={target} />{suffix}</>}
    </h3>
    <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700 mb-1">{label}</p>
    <p className="text-slate-500 text-[10px] sm:text-xs font-medium">{sub}</p>
  </div>
);

// --- Main Landing Page Component ---
const LandingPage = () => {
  const videoRef = useRef(null);
  const chatEndRef = useRef(null); 
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Real-time Stats State
  const [liveStats, setLiveStats] = useState({
    studentsJoined: 0,
    mockInterviews: 0,
    questions: 10000,
    companies: 26,
    support: "24/7"
  });

  // Companies List State
  const [companyList, setCompanyList] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  // AI Chatbot State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "bot", message: "SYSTEM READY: Welcome to SkillPredictor AI. Select a protocol topic or type your query." }
  ]);

  const quickQuestions = [
    { label: "ATS Score?", query: "How to improve my Resume ATS score?" },
    { label: "Mock Interview?", query: "How can I start an AI Mock Interview?" },
    { label: "Aptitude Tests?", query: "What is covered in Aptitude Tests?" },
    { label: "Login Issues?", query: "I am having issues with my account authentication/login." },
    { label: "Reset Password?", query: "How can I reset my password if I forgot it?" },
    { label: "OTP Not Received?", query: "I am not receiving the OTP for verification." },
    { label: "Company Prep?", query: "Tell me about company-specific preparation modules." }
  ];

  // Auth Status
  const isLoggedIn = !!localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const dashboardRoute = userRole === "admin" ? "/admin/dashboard" : "/student";

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, aiLoading]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/auth/stats");
        if (res.data.success) {
          setLiveStats(res.data.stats);
        }
      } catch (err) {
        console.error("Stats fetch failed, using default values");
      }
    };

    const fetchCompanies = async () => {
      try {
        const res = await api.get("/admin/companies");
        setCompanyList(res.data);
        setLiveStats(prev => ({...prev, companies: res.data.length}));
      } catch (err) {
        console.error("Failed to fetch companies for landing page");
      }
    };

    fetchStats();
    fetchCompanies();

    if (videoRef.current) {
      videoRef.current.playbackRate = 0.8; 
      videoRef.current.play().catch(() => {});
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/submit-query", formData);
      alert("Telemetry received! Your query has been logged to the SkillPredictor Helpdesk.");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Please login to submit a query.");
    } finally {
      setLoading(false);
    }
  };

  const handleAiAsk = async (e, customQuery = null) => {
    if (e) e.preventDefault();

    if (!isLoggedIn) {
      setChatHistory(prev => [...prev, { role: "bot", message: "🔒 AUTHENTICATION REQUIRED: Please log in to initiate an interactive AI session." }]);
      return;
    }

    const finalQuery = customQuery || aiQuery;
    if (!finalQuery.trim()) return;
    
    setChatHistory(prev => [...prev, { role: "user", message: finalQuery }]);
    setAiQuery("");
    setAiLoading(true);

    try {
      const res = await api.post("/admin/ask-ai", { 
        name: "Student", 
        email: "authenticated@skillpredictor.com", 
        query: finalQuery 
      });
      setChatHistory(prev => [...prev, { role: "bot", message: res.data.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "bot", message: "ERR_TELEMETRY: Connection interrupted. Please re-try your request." }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-sky-400 selection:text-slate-900 relative">
      
      {/* ================= HIGH-TECH NAVIGATION ================= */}
      <nav className={`fixed w-full z-50 h-16 sm:h-20 flex items-center transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex justify-between items-center">
          
          {/* Brand Logo with Status Indicator */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-sky-500 rounded-xl flex items-center justify-center border-2 border-white shadow-[2px_2px_0px_0px_#0ea5e9]">
              <Zap className="text-slate-950 fill-current w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black uppercase tracking-tight text-white leading-none">
                Skill<span className="text-sky-400">Predictor</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-sky-300 font-bold uppercase mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                PROTOCOL v3.2
              </span>
            </div>
          </div>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Protocols', id: 'protocols' },
              { label: 'Metrics', id: 'stats' },
              { label: 'Capabilities', id: 'about' },
              { label: 'Helpdesk', id: 'contact' }
            ].map((item) => (
              <span
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="cursor-pointer font-black text-xs uppercase tracking-[0.2em] text-slate-300 hover:text-sky-400 transition-colors"
              >
                {item.label}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link 
                to={dashboardRoute} 
                className="group relative px-4 py-2 sm:px-6 sm:py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#090d16] hover:shadow-[4px_4px_0px_0px_#ffffff] transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Dashboard</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/login?mode=signup" 
                  className="group relative px-4 py-2 sm:px-6 sm:py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#090d16] hover:shadow-[4px_4px_0px_0px_#ffffff] transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span>Sign up</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 min-h-[92vh] sm:min-h-screen flex items-center justify-center text-center bg-[#07090e] overflow-hidden">
        {/* Ambient Video & Grid Background */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-[#07090e]/85 backdrop-blur-[2px] z-10"></div>
          <div className="absolute inset-0 bg-tech-grid-dark opacity-30 z-10 pointer-events-none"></div>
          <video ref={videoRef} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" src={bgVideo} />
        </div>

        {/* Hero Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20">
          
          {/* Micro-Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-sky-500/40 text-sky-400 text-[10px] sm:text-xs font-mono font-black uppercase tracking-[0.2em] mb-6 sm:mb-8 shadow-[0_0_20px_rgba(14,165,233,0.2)]">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <span>NEXT-GEN AI PLACEMENT ENGINE</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">TRUSTED BY 5,000+ CANDIDATES</span>
          </div>

          {/* Punchy Title */}
          <h1 className="text-3xl sm:text-6xl md:text-7xl font-black text-white mb-6 sm:mb-8 leading-[1.08] tracking-tight uppercase">
            ELEVATE YOUR <br className="hidden sm:block" />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-sky-300">
              CAREER POTENTIAL
            </span> <br />
            WITH PRECISION AI.
          </h1>
          
          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-slate-300 text-xs sm:text-base md:text-lg mb-8 sm:mb-12 font-medium leading-relaxed">
            Harness automated ATS resume scoring, voice-driven mock interviews with instant feedback, and company-calibrated aptitude benchmarks designed for top-tier hiring.
          </p>

          {/* Interactive CTA Deck */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link 
                to={dashboardRoute} 
                className="w-full sm:w-auto px-8 py-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black uppercase tracking-widest text-xs sm:text-sm rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-[6px_6px_0px_0px_#0ea5e9] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Access Student Command Center</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link 
                to="/login?mode=signup" 
                className="w-full sm:w-auto px-8 py-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black uppercase tracking-widest text-xs sm:text-sm rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-[6px_6px_0px_0px_#0ea5e9] transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Launch Placement Engine</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}

            <button 
              onClick={() => scrollToSection('protocols')} 
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs sm:text-sm rounded-xl border border-slate-700 hover:border-sky-400 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Explore Protocols</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Floating Telemetry Badges */}
          <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-800/80 flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-slate-400 font-mono text-[10px] sm:text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>98.4% ATS Match Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Real-time Voice Synthesis</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Zero Leak Email OTP Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LIVE METRICS TELEMETRY BAR ================= */}
      <section id="stats" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#f1f5f9] border-y-2 border-slate-900 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <span className="font-mono text-xs font-black text-sky-600 uppercase tracking-widest block mb-1">
                // SYSTEM TELEMETRY
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
                Live Platform Performance
              </h2>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-600 bg-white border border-slate-300 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SYNCED WITH CLOUD DATABASE
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            <StatCard index="#01" target={liveStats.studentsJoined} suffix="+" label="Candidates" sub="Active registered learners" icon="fa-user-graduate" />
            <StatCard index="#02" target={liveStats.questions} suffix="+" label="Questions" sub="Curated placement bank" icon="fa-brain" />
            <StatCard index="#03" target={liveStats.mockInterviews} suffix="+" label="Interviews" sub="AI-evaluated simulations" icon="fa-microphone" />
            <StatCard index="#04" target={liveStats.companies} suffix="+" label="Tie-ups" sub="Enterprise recruitment targets" icon="fa-building" />
            <StatCard index="#05" target={liveStats.support} suffix="" label="Support" sub="Instant automated AI helpdesk" icon="fa-bolt" />
          </div>
        </div>
      </section>

      {/* ================= HIRING PARTNER MARQUEE ================= */}
      <div className="bg-white py-12 border-b-2 border-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-6 flex items-center justify-between">
          <p className="font-mono text-xs font-black uppercase tracking-[0.25em] text-slate-400">
            // TARGET ENTERPRISES & RECRUITMENT NETWORKS
          </p>
          <span className="text-[10px] font-mono font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
            26+ FIRMS
          </span>
        </div>
        <div className="flex animate-scroll whitespace-nowrap w-max">
          {[...companyList, ...companyList].map((company, index) => (
            <Logo 
              key={`${company._id}-${index}`} 
              name={company.name} 
              imageUrl={company.logo} 
            />
          ))}
        </div>
      </div>

      {/* ================= THE 3-STEP PLACEMENT PROTOCOL ================= */}
      <section id="protocols" className="py-20 sm:py-32 px-4 sm:px-6 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-grid-dark opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-24">
            <span className="font-mono text-xs font-black text-sky-400 uppercase tracking-[0.25em] block mb-3">
              // ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mb-4">
              The Placement Protocol
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              A structured 3-phase engineering pipeline turning preparation into guaranteed hiring readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                tag: "PHASE ONE",
                title: "Diagnose & Benchmark",
                desc: "Ingest your resume through our Neural ATS scanner. Identify keyword omissions, formatting vulnerabilities, and score alignment against target enterprise job descriptions.",
                color: "border-sky-500",
                accent: "text-sky-400"
              },
              {
                step: "02",
                tag: "PHASE TWO",
                title: "Simulate Under Pressure",
                desc: "Run live voice-based mock interviews with adaptive technical & behavioral questioning. Receive real-time speech-to-text transcript analysis and scoring telemetry.",
                color: "border-teal-500",
                accent: "text-teal-400"
              },
              {
                step: "03",
                tag: "PHASE THREE",
                title: "Conquer & Secure",
                desc: "Drill quantitative aptitude matrices, participate in AI-moderated group discussions, and access company-specific technical test archives to ace final rounds.",
                color: "border-emerald-500",
                accent: "text-emerald-400"
              }
            ].map((p, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/90 border-2 border-slate-800 hover:border-sky-400 p-8 rounded-2xl shadow-[4px_4px_0px_0px_#0ea5e9] transition-all group relative"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="font-mono text-3xl font-black text-white group-hover:text-sky-400 transition-colors">
                    {p.step}
                  </span>
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {p.tag}
                  </span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-3">
                  {p.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PROTOCOL CAPABILITIES BENTO GRID ================= */}
      <section id="about" className="py-20 sm:py-32 bg-white px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
            <div>
              <span className="font-mono text-xs font-black text-sky-600 uppercase tracking-[0.25em] block mb-2">
                // PLATFORM ARSENAL
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight">
                Core Capabilities
              </h2>
            </div>
            <p className="text-slate-500 text-sm max-w-md font-medium">
              Every tool is engineered with neo-tech standards to provide clear, actionable feedback rather than generic advice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "ATS Resume Scorer",
                tag: "AI SCANNER",
                desc: "Instant ATS compliance score, keyword gap detection, and annotated PDF download with redline corrections.",
                icon: FileText,
                link: "/resume-scorer"
              },
              {
                num: "02",
                title: "AI Mock Interview",
                tag: "VOICE STUDIO",
                desc: "Live audio dialogue simulation with adaptive questioning, voice transcription, and full scorecard telemetry.",
                icon: Video,
                link: "/student/ai-interview"
              },
              {
                num: "03",
                title: "Aptitude Tests",
                tag: "COGNITIVE MATRIX",
                desc: "Master quantitative analysis, logical reasoning, and verbal skills with timed mock tests and percentile rankings.",
                icon: Brain,
                link: "/student/aptitude"
              },
              {
                num: "04",
                title: "Performance Analytics",
                tag: "DATA TELEMETRY",
                desc: "Track readiness across all disciplines, monitor historical growth, and pinpoint exact weaknesses.",
                icon: PieChart,
                link: "/student/analytics"
              },
              {
                num: "05",
                title: "Group Discussion",
                tag: "MULTI-AGENT ROOM",
                desc: "AI-moderated roundtable communication rooms to refine articulateness and spontaneous debate.",
                icon: Users,
                link: "/student/group-discussion"
              },
              {
                num: "06",
                title: "Company Prep Modules",
                tag: "ENTERPRISE VAULT",
                desc: "Targeted problem archives tailored specifically to Google, Amazon, Microsoft, TCS, and Infosys formats.",
                icon: Building2,
                link: "/company-prep"
              }
            ].map((module, i) => {
              const Icon = module.icon;
              return (
                <div 
                  key={i}
                  onClick={() => navigate(isLoggedIn ? module.link : "/login")}
                  className="group bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#090d16] hover:shadow-[6px_6px_0px_0px_#0ea5e9] hover:border-sky-500 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-sky-400 flex items-center justify-center border-2 border-slate-900 group-hover:bg-sky-500 group-hover:text-slate-900 transition-colors">
                        <Icon size={22} strokeWidth={2.3} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {module.tag}
                        </span>
                        <span className="font-mono text-xs font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          {module.num}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2 group-hover:text-sky-600 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                      {module.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="font-mono text-[11px] font-black uppercase tracking-widest text-slate-700 group-hover:text-sky-600 transition-colors">
                      {isLoggedIn ? "Access Protocol" : "Sign In to Access"}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= HIGH-TECH HELPDESK & CONTACT ================= */}
      <section id="contact" className="py-20 sm:py-32 bg-[#f8fafc] border-t-2 border-slate-900 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          
          <div className="text-center mb-12">
            <span className="font-mono text-xs font-black text-sky-600 uppercase tracking-[0.25em] block mb-2">
              // TELEMETRY UPLINK
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 uppercase tracking-tight mb-3">
              Transmit Your Query
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-lg mx-auto">
              Our engineering helpdesk monitors incoming signals 24/7. Log questions regarding your account, tests, or placements.
            </p>
          </div>
          
          <div className="bg-white p-6 sm:p-12 rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_#090d16] relative">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-mono text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2">
                    // CANDIDATE_NAME
                  </label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Alex Hunter" 
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:bg-white outline-none font-bold text-xs sm:text-sm text-slate-800 transition-all shadow-inner" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2">
                    // EMAIL_ADDRESS
                  </label>
                  <input 
                    required 
                    type="email" 
                    placeholder="candidate@domain.com" 
                    className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:bg-white outline-none font-bold text-xs sm:text-sm text-slate-800 transition-all shadow-inner" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] font-black text-slate-700 uppercase tracking-wider mb-2">
                  // QUERY_PAYLOAD
                </label>
                <textarea 
                  required 
                  rows="4" 
                  placeholder="Describe your inquiry, issue, or feedback..." 
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-sky-500 focus:bg-white outline-none font-medium text-xs sm:text-sm text-slate-800 transition-all resize-none shadow-inner" 
                  value={formData.message} 
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-slate-900 hover:bg-sky-500 hover:text-slate-900 text-white py-4 sm:py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs sm:text-sm border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0ea5e9] transition-all disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-3"
              >
                <span>{loading ? "TRANSMITTING..." : "DISPATCH TELEMETRY"}</span>
                {!loading && <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* ================= FLOATING AI ASSISTANT TRIGGER ================= */}
        <div 
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-slate-950 text-sky-400 rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#0ea5e9] border-2 border-sky-400 cursor-pointer hover:scale-110 active:scale-95 transition-all z-[90] group"
        >
          <Bot className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1.5 -right-1.5 bg-sky-500 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tight border border-slate-950 shadow-sm">
            AI LIVE
          </span>
        </div>

        {/* ================= CYBER-TERMINAL AI CHAT WIDGET ================= */}
        {isAiOpen && (
          <div className="fixed bottom-20 right-2 sm:bottom-28 sm:right-8 z-[100] w-[calc(100vw-1rem)] sm:w-[420px] max-w-[420px] h-[520px] sm:h-[600px] animate-in zoom-in-95 duration-200 pointer-events-auto">
            <div className="bg-white w-full h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-slate-900">
              
              {/* Terminal Header */}
              <div className="bg-slate-950 p-4 sm:p-5 flex justify-between items-center text-white border-b-2 border-slate-900 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-sky-500 text-slate-950 rounded-lg flex items-center justify-center font-black">
                    <Bot size={20} />
                  </div>
                  <div>
                    <span className="block font-black uppercase tracking-wider text-xs text-white">
                      SkillPredictor AI
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      <span className="font-mono text-[9px] text-slate-400 uppercase">SYSTEM ONLINE</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAiOpen(false)} 
                  className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar text-xs font-medium">
                {chatHistory.map((chat, index) => (
                  <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2.5`}>
                    {chat.role === 'bot' && (
                      <div className="w-7 h-7 bg-slate-900 text-sky-400 rounded-md flex items-center justify-center shrink-0 mt-0.5">
                        <Terminal size={12} />
                      </div>
                    )}
                    <div className={`max-w-[78%] p-3.5 rounded-xl leading-relaxed ${
                      chat.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-br-none shadow-sm' 
                        : 'bg-white text-slate-800 border-2 border-slate-200 rounded-bl-none shadow-sm'
                    }`}>
                      {chat.message}
                    </div>
                  </div>
                ))}

                {!isLoggedIn && (
                  <div className="flex justify-center pt-2">
                    <button 
                      onClick={() => navigate("/login")}
                      className="bg-sky-400 hover:bg-sky-300 text-slate-950 border-2 border-slate-900 px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_#090d16] transition-all"
                    >
                      Authenticate to Chat
                    </button>
                  </div>
                )}

                {aiLoading && (
                  <div className="flex items-center gap-2 pl-2 text-slate-500 font-mono text-[10px]">
                    <div className="w-2 h-2 bg-sky-500 rounded-full animate-ping"></div>
                    <span>CALCULATING TELEMETRY...</span>
                  </div>
                )}
                <div ref={chatEndRef} /> 
                
                {isLoggedIn && !aiLoading && (
                  <div className="pt-2 space-y-2">
                    <p className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest">QUICK CHIPS</p>
                    <div className="flex flex-wrap gap-1.5">
                      {quickQuestions.map((item, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleAiAsk(null, item.query)}
                          className="text-[10px] font-bold bg-white text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-lg hover:border-sky-500 hover:text-sky-600 transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Deck */}
              <div className="p-3 bg-white border-t-2 border-slate-900 shrink-0">
                <form onSubmit={handleAiAsk} className="relative flex items-center gap-2">
                  <input 
                    type="text" 
                    disabled={!isLoggedIn}
                    placeholder={isLoggedIn ? "Input prompt for AI..." : "Login required"} 
                    className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl focus:border-sky-500 outline-none text-xs font-semibold text-slate-800 disabled:opacity-50"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    disabled={aiLoading || !isLoggedIn || !aiQuery.trim()} 
                    className="w-10 h-10 bg-sky-400 hover:bg-sky-300 text-slate-950 border-2 border-slate-900 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40 transition-all shadow-[2px_2px_0px_0px_#090d16]"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ================= HIGH-TECH FOOTER ================= */}
      <footer className="bg-slate-950 text-white pt-16 pb-12 border-t-2 border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center border border-white">
                  <Zap className="text-slate-950 fill-current w-4 h-4" />
                </div>
                <span className="text-lg font-black uppercase tracking-tight text-white">
                  Skill<span className="text-sky-400">Predictor</span>
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md font-normal">
                Next-generation placement intelligence architecture empowering university students with automated resume analysis, speech-to-text interview simulations, and adaptive aptitude benchmark telemetry.
              </p>
            </div>
            <div>
              <h4 className="font-mono text-xs font-black uppercase tracking-[0.2em] text-sky-400 mb-4">
                // SYSTEM_LINKS
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-300 font-bold">
                <li className="hover:text-sky-400 cursor-pointer" onClick={() => scrollToSection('protocols')}>Placement Protocols</li>
                <li className="hover:text-sky-400 cursor-pointer" onClick={() => scrollToSection('stats')}>System Telemetry</li>
                <li className="hover:text-sky-400 cursor-pointer" onClick={() => scrollToSection('about')}>Platform Arsenal</li>
                <li className="hover:text-sky-400 cursor-pointer" onClick={() => scrollToSection('contact')}>Engineering Helpdesk</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-slate-500">
            <p>&copy; {new Date().getFullYear()} SKILLPREDICTOR PLATFORM. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ALL ENGINES OPERATIONAL
              </span>
              <span>•</span>
              <span>STRICT AUTH PROTOCOL v3.2</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;