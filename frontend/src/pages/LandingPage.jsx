import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../services/api"; 
import bgVideo from '../assets/bg.mp4'; 
import ThemeToggle from "../components/common/ThemeToggle";
import PrivacyBadge from "../components/common/PrivacyBadge"; 

// --- Counter & Helper Components ---
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

const Logo = ({ name, imageUrl }) => (
  <div className="flex items-center justify-center gap-4 px-10 transition-all duration-500 hover:scale-110 group cursor-pointer flex-shrink-0">
    <div className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 p-2 group-hover:shadow-md transition-all">
      <img 
        src={imageUrl || `https://logo.clearbit.com/${name.toLowerCase().replace(/\s/g, '')}.com?size=100`} 
        alt={name}
        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${name}&background=0D9488&color=fff`; }}
        className="max-w-full max-h-full object-contain"
      />
    </div>
    <span className="text-xl font-heading font-bold tracking-tight text-text-dark/80 group-hover:text-text-dark whitespace-nowrap">
      {name}
    </span>
  </div>
);

const StatCard = ({ target, suffix, label, sub, icon }) => (
  <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-blue-greeny/5 shadow-sm text-center hover:shadow-lg transition-all">
    <div className="text-blue-greeny mb-2 sm:mb-4 text-xl sm:text-2xl">
        <i className={`fas ${icon}`}></i>
    </div>
    <h3 className="text-2xl sm:text-4xl font-heading font-black text-text-dark mb-1">
      {label === "Support" ? target : <><Counter target={target} />{suffix}</>}
    </h3>
    <p className="text-sm sm:text-lg font-bold text-blue-greeny mb-1">{label}</p>
    <p className="text-text-light text-[10px] sm:text-xs">{sub}</p>
  </div>
);

// --- Main Component ---
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

  // 🔥 AI Chatbot State
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: "bot", message: "Hello! I am SkillPredictor AI. Choose a topic below or type your query!" }
  ]);

  // 🔥 UPDATED: Advanced Quick Action Buttons
  const quickQuestions = [
    { label: "ATS Score?", query: "How to improve my Resume ATS score?" },
    { label: "Mock Interview?", query: "How can I start an AI Mock Interview?" },
    { label: "Aptitude Tests?", query: "What is covered in Aptitude Tests?" },
    { label: "Login Issues?", query: "I am having issues with my account authentication/login." },
    { label: "Reset Password?", query: "How can I reset my password if I forgot it?" },
    { label: "OTP Not Received?", query: "I am not receiving the OTP for verification." },
    { label: "Company Prep?", query: "Tell me about company-specific preparation modules." }
  ];

  // 🔥 Authentication Check
  const isLoggedIn = !!localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  const dashboardRoute = userRole === "admin" ? "/admin/dashboard" : "/student";

  // 🔥 Auto-scroll effect
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

  // Fetch Live Stats & Companies on Load
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
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/submit-query", formData);
      alert("Your message has been sent to the Helpdesk!");
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Please login to submit a query.");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Enhanced AI Ask Logic with Auth Condition
  const handleAiAsk = async (e, customQuery = null) => {
    if (e) e.preventDefault();

    if (!isLoggedIn) {
      setChatHistory(prev => [...prev, { role: "bot", message: "🔒 Please login to your account to use the AI Assistant and raise queries." }]);
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
      setChatHistory(prev => [...prev, { role: "bot", message: "Sorry, I am facing some technical issues. Please try again." }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-pinky relative">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 h-16 sm:h-20 flex items-center transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-greeny rounded-xl flex items-center justify-center shadow-lg shadow-blue-greeny/20 rotate-3">
              <i className="fas fa-graduation-cap text-white text-base sm:text-xl"></i>
            </div>
            <span className={`text-lg sm:text-xl font-heading font-extrabold tracking-tight transition-colors duration-300 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              Skill<span className="text-blue-greeny">Predictor</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['stats', 'about', 'contact'].map((item) => (
              <span
                key={item}
                onClick={() => scrollToSection(item)}
                className={`cursor-pointer font-bold text-xs uppercase tracking-widest transition-colors duration-300 hover:text-blue-greeny ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                {item}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            {isLoggedIn ? (
              <Link 
                to={dashboardRoute} 
                className="bg-blue-greeny hover:bg-blue-greeny-dark text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 active:scale-95"
              >
                <i className="fas fa-th-large text-xs"></i>
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className={`font-bold text-xs sm:text-sm transition-colors duration-300 hover:text-blue-greeny ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}>Log in</Link>
                <Link to="/login?mode=signup" className="bg-blue-greeny hover:bg-blue-greeny-dark text-white px-4 py-2 sm:px-8 sm:py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-md">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 min-h-[90vh] sm:min-h-screen flex items-center justify-center text-center bg-gray-900">
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <video ref={videoRef} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" src={bgVideo} />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20">
          
          {/* 🔥 MODIFIED HEADING HERE: Hollow/Outline effect on hover 🔥 */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-black text-white mb-6 sm:mb-8 leading-tight tracking-tight">
            <span className="transition-all duration-300 hover:text-transparent hover:[-webkit-text-stroke:1px_white] cursor-default">
              Every Student Has Potential.
            </span><br/>
            <span className="text-blue-greeny cursor-default">
              We Help You Find Yours.
            </span>
          </h1>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {isLoggedIn && (
              <Link 
                to={dashboardRoute} 
                className="px-7 py-3.5 sm:px-10 sm:py-4 bg-blue-greeny hover:bg-blue-greeny-dark text-white rounded-full font-black uppercase tracking-[0.2em] text-xs sm:text-sm shadow-xl shadow-blue-greeny/30 transition-all duration-300 active:scale-95 flex items-center gap-2.5"
              >
                Go to Dashboard
                <i className="fas fa-arrow-right"></i>
              </Link>
            )}
            <button 
              onClick={() => scrollToSection('about')} 
              className="group relative px-8 py-4 sm:px-12 sm:py-5 bg-white/10 backdrop-blur-md border border-white/30 text-white rounded-full font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-xs sm:text-sm overflow-hidden transition-all duration-300 hover:border-blue-greeny hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] active:scale-95"
            >
              <div className="absolute inset-0 bg-blue-greeny translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors">
                Discover More
                <i className="fas fa-arrow-down group-hover:translate-y-1 transition-transform"></i>
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section with Real-time Data */}
      <section id="stats" className="py-12 sm:py-24 px-4 sm:px-6 bg-teeny-greeny">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
          <StatCard target={liveStats.studentsJoined} suffix="+" label="Students Joined" sub="Registered active users" icon="fa-user-graduate" />
          <StatCard target={liveStats.questions} suffix="+" label="Questions" sub="Industry-standard prep" icon="fa-lightbulb" />
          <StatCard target={liveStats.mockInterviews} suffix="+" label="Mock Interviews" sub="Conducted AI sessions" icon="fa-microphone-alt" />
          <StatCard target={liveStats.companies} suffix="+" label="Company Tie-ups" sub="Unique hiring partners" icon="fa-handshake" />
          <StatCard target={liveStats.support} suffix="" label="Support" sub="AI assistance anytime" icon="fa-headset" />
        </div>
      </section>

      {/* DYNAMIC LOGO SECTION */}
      <div className="bg-white py-16 border-y border-slate-100 overflow-hidden">
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

      {/* ABOUT US SECTION */}
      <section id="about" className="py-16 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
            <div className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-greeny/10 rounded-full blur-3xl"></div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-text-dark mb-6 sm:mb-8 leading-tight">
                    Empowering Your <br/> <span className="text-blue-greeny">Professional Journey</span>
                </h2>
                <p className="text-base sm:text-lg text-text-light leading-relaxed mb-6 sm:mb-8 font-medium">
                    SkillPredictor isn't just a platform; it's your personal career coach. We leverage advanced technology to analyze your skills, score your resumes, and predict your best career fit.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {[
                        { title: "Resume Scorer", desc: "Get an instant ATS score and expert feedback on your CV.", icon: "fa-file-invoice", color: "text-blue-500", bg: "bg-blue-50" },
                        { title: "AI Mock Interview", desc: "Practice technical rounds with real-time feedback.", icon: "fa-microphone", color: "text-purple-500", bg: "bg-purple-50" },
                        { title: "Aptitude Test", desc: "Practice quant and logical reasoning for placements.", icon: "fa-brain", color: "text-orange-500", bg: "bg-orange-50" },
                        { title: "Performance Analytics", desc: "Track your growth and see areas for improvement.", icon: "fa-chart-pie", color: "text-teal-500", bg: "bg-teal-50" },
                        { title: "Group Discussion", desc: "AI-moderated rooms to practice communication.", icon: "fa-users", color: "text-pink-500", bg: "bg-pink-50" },
                        { title: "Company Specifics", desc: "Tailored modules for Google, Amazon, and more.", icon: "fa-building", color: "text-indigo-500", bg: "bg-indigo-50" },
                        { title: "Interactive Helpdesk", desc: "Resolve your doubts instantly with our support.", icon: "fa-headset", color: "text-blue-greeny", bg: "bg-teeny-greeny" }
                    ].map((item, i) => (
                        item.link ? (
                            <Link to={item.link} key={i} className="flex gap-4 items-start p-3 sm:p-4 rounded-2xl hover:shadow-md transition-all border border-transparent hover:border-slate-100 cursor-pointer">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <i className={`fas ${item.icon} text-base sm:text-lg`}></i>
                                </div>
                                <div>
                                    <h4 className="font-black text-text-dark text-xs sm:text-sm mb-1">{item.title}</h4>
                                    <p className="text-[10px] sm:text-[11px] text-text-light leading-tight">{item.desc}</p>
                                </div>
                            </Link>
                        ) : (
                            <div key={i} className="flex gap-4 items-start p-3 sm:p-4 rounded-2xl hover:shadow-md transition-all border border-transparent hover:border-slate-100">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                    <i className={`fas ${item.icon} text-base sm:text-lg`}></i>
                                </div>
                                <div>
                                    <h4 className="font-black text-text-dark text-xs sm:text-sm mb-1">{item.title}</h4>
                                    <p className="text-[10px] sm:text-[11px] text-text-light leading-tight">{item.desc}</p>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>
            <div className="bg-teeny-greeny rounded-3xl sm:rounded-[3rem] p-6 sm:p-12 relative overflow-hidden border border-blue-greeny/5 shadow-inner">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <i className="fas fa-quote-right text-7xl sm:text-9xl text-blue-greeny"></i>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-blue-greeny mb-4 sm:mb-6">Our Mission</h3>
                <p className="text-base sm:text-xl text-text-dark font-medium leading-relaxed sm:leading-loose italic">
                    "To bridge the gap between academic learning and industry expectations by providing every student with data-driven career clarity and professional tools."
                </p>
                <div className="mt-8 sm:mt-10 flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-greeny rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                        <span className="text-white font-black text-lg sm:text-xl tracking-tighter">SP</span>
                    </div>
                    <div>
                        <p className="font-black text-text-dark text-sm sm:text-base">Team SkillPredictor</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔥 PROFESSIONAL CONTACT US SECTION */}
      <section id="contact" className="py-16 sm:py-32 bg-teeny-greeny relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-text-dark mb-3 sm:mb-4">Get in Touch</h2>
            <p className="text-text-light mb-8 sm:mb-16 font-medium text-sm sm:text-base">Have a question? Our Helpdesk is ready to assist you on your journey.</p>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-greeny/20 to-teal-500/20 rounded-3xl sm:rounded-[3.5rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <form onSubmit={handleContactSubmit} className="relative bg-white/80 backdrop-blur-xl p-6 sm:p-12 rounded-3xl sm:rounded-[3.5rem] shadow-2xl text-left border border-white/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
                      <div className="space-y-2 sm:space-y-3">
                          <label className="text-[10px] font-black text-blue-greeny uppercase tracking-[0.2em] ml-2">Full Name</label>
                          <div className="relative group/input">
                            <i className="fas fa-user absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-greeny transition-colors"></i>
                            <input required type="text" placeholder="John Doe" className="w-full pl-12 pr-6 py-4 sm:py-5 bg-slate-50/50 border-2 border-transparent rounded-2xl sm:rounded-[1.5rem] focus:border-blue-greeny/20 focus:bg-white focus:ring-4 focus:ring-blue-greeny/5 outline-none transition-all font-medium text-xs sm:text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                          </div>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                          <label className="text-[10px] font-black text-blue-greeny uppercase tracking-[0.2em] ml-2">Email Address</label>
                          <div className="relative group/input">
                            <i className="fas fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-blue-greeny transition-colors"></i>
                            <input required type="email" placeholder="john@example.com" className="w-full pl-12 pr-6 py-4 sm:py-5 bg-slate-50/50 border-2 border-transparent rounded-2xl sm:rounded-[1.5rem] focus:border-blue-greeny/20 focus:bg-white focus:ring-4 focus:ring-blue-greeny/5 outline-none transition-all font-medium text-xs sm:text-sm" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                          </div>
                      </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-10">
                      <label className="text-[10px] font-black text-blue-greeny uppercase tracking-[0.2em] ml-2">How can we help?</label>
                      <textarea required rows="4" placeholder="Tell us about your query..." className="w-full px-5 sm:px-8 py-4 sm:py-5 bg-slate-50/50 border-2 border-transparent rounded-2xl sm:rounded-[2rem] focus:border-blue-greeny/20 focus:bg-white focus:ring-4 focus:ring-blue-greeny/5 outline-none transition-all resize-none font-medium text-xs sm:text-sm" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}></textarea>
                  </div>
                  <button type="submit" disabled={loading} className="group relative w-full bg-blue-greeny text-white py-4 sm:py-6 rounded-2xl sm:rounded-[1.5rem] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[11px] sm:text-xs overflow-hidden transition-all shadow-xl shadow-blue-greeny/25 hover:shadow-blue-greeny/40 disabled:opacity-50 active:scale-[0.98]">
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {loading ? "Transmitting..." : "Send Request"}
                        {!loading && <i className="fas fa-paper-plane text-[10px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>}
                      </span>
                  </button>
              </form>
            </div>
        </div>

        {/* 🔥 FIXED FLOATING AI LOGO */}
        <div 
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-5 right-5 sm:bottom-10 sm:right-10 w-14 h-14 sm:w-20 sm:h-20 bg-blue-greeny rounded-full flex items-center justify-center text-white shadow-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all z-[90] group border-2 sm:border-4 border-white"
        >
          <div className="absolute inset-0 rounded-full bg-blue-greeny animate-ping opacity-20 group-hover:opacity-40"></div>
          <i className="fas fa-robot text-xl sm:text-3xl group-hover:rotate-12 transition-transform"></i>
          <span className="absolute -top-1 -right-1 bg-pinky text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase tracking-tighter shadow-lg border-2 border-white">Live AI</span>
        </div>

        {/* 🔥 PROFESSIONAL PREMIUM AI CHAT WIDGET */}
        {isAiOpen && (
          <div className="fixed bottom-20 right-2 sm:bottom-32 sm:right-10 z-[100] w-[calc(100vw-1rem)] sm:w-[400px] max-w-[400px] h-[500px] sm:h-[600px] animate-in zoom-in-95 slide-in-from-bottom-10 duration-300 pointer-events-auto">
            <div className="bg-white w-full h-full rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-slate-100">
              
              {/* Header: Sleek Design */}
              <div className="bg-blue-greeny p-4 sm:p-6 flex justify-between items-center text-white shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-inner">
                    <i className="fas fa-robot text-2xl animate-bounce-slow"></i>
                  </div>
                  <div>
                    <span className="block font-black uppercase tracking-[0.15em] text-[12px]">SkillPredictor AI</span>
                    <div className="flex items-center gap-1.5">
                       <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span>
                       <span className="text-[10px] font-bold text-white/80">Support Online</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAiOpen(false)} 
                  className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all group relative z-10 border border-white/20 shadow-sm"
                >
                  <i className="fas fa-times text-sm group-hover:rotate-90 transition-transform duration-300"></i>
                </button>
              </div>
              
              {/* Chat Body: Sleek Bubbles */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 custom-scrollbar-thin scroll-smooth">
                {chatHistory.map((chat, index) => (
                  <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}>
                    {chat.role === 'bot' && (
                      <div className="w-8 h-8 bg-blue-greeny/10 rounded-xl flex items-center justify-center shrink-0 mb-1 border border-blue-greeny/10 shadow-sm">
                        <i className="fas fa-robot text-[12px] text-blue-greeny"></i>
                      </div>
                    )}
                    <div className={`max-w-[75%] p-4 rounded-[1.5rem] text-[13px] leading-relaxed shadow-sm font-medium ${
                      chat.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-greeny to-teal-600 text-white rounded-br-none shadow-teal-900/10' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                    }`}>
                      {chat.message}
                    </div>
                    {chat.role === 'user' && (
                      <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 mb-1 border border-slate-200">
                        <span className="text-[10px] font-black text-slate-400">YOU</span>
                      </div>
                    )}
                  </div>
                ))}

                {!isLoggedIn && (
                   <div className="flex justify-center pt-2">
                      <button 
                        onClick={() => navigate("/login")}
                        className="bg-white text-blue-greeny border-2 border-blue-greeny/10 px-8 py-3 rounded-full font-black text-[11px] uppercase tracking-widest shadow-sm hover:border-blue-greeny hover:bg-blue-greeny hover:text-white transition-all transform active:scale-95"
                      >
                        Login to chat
                      </button>
                   </div>
                )}

                {aiLoading && (
                   <div className="flex items-center gap-3 pl-2">
                     <div className="w-8 h-8 bg-blue-greeny/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-greeny/10">
                        <i className="fas fa-robot text-[12px] text-blue-greeny"></i>
                     </div>
                     <div className="flex gap-1.5 bg-white p-4 rounded-[1.5rem] rounded-bl-none shadow-sm border border-slate-100">
                       <span className="w-2 h-2 bg-blue-greeny/40 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-blue-greeny/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                       <span className="w-2 h-2 bg-blue-greeny/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                     </div>
                   </div>
                )}
                <div ref={chatEndRef} /> 
                
                {isLoggedIn && !aiLoading && (
                  <div className="pt-4 space-y-3">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Suggested Topics</p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((item, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleAiAsk(null, item.query)}
                          className="text-[11px] font-bold bg-white text-slate-600 border border-slate-100 px-4 py-2.5 rounded-2xl hover:border-blue-greeny hover:text-blue-greeny hover:shadow-lg hover:shadow-blue-greeny/5 transition-all active:scale-95"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Footer: Clean Design */}
              <div className="p-6 bg-white border-t border-slate-50 shrink-0">
                <form onSubmit={handleAiAsk} className="relative">
                  <input 
                    type="text" 
                    disabled={!isLoggedIn}
                    placeholder={isLoggedIn ? "Message the AI..." : "Please login to talk"} 
                    className="w-full pl-6 pr-16 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-2 focus:ring-blue-greeny/20 outline-none text-[13px] font-medium transition-all disabled:opacity-50 shadow-inner"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    disabled={aiLoading || !isLoggedIn || !aiQuery.trim()} 
                    className="absolute right-2 top-2 bottom-2 w-12 bg-blue-greeny text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-greeny/20 active:scale-90 transition-all disabled:bg-slate-200 disabled:shadow-none"
                  >
                    <i className="fas fa-paper-plane text-sm"></i>
                  </button>
                </form>
                <div className="flex items-center justify-center gap-2 mt-4">
                    <i className="fas fa-shield-alt text-[9px] text-slate-300"></i>
                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Secured by SkillPredictor AI</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white pt-20 pb-10 border-t border-blue-greeny/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-greeny rounded-lg flex items-center justify-center rotate-3 shadow-md">
                  <i className="fas fa-graduation-cap text-white text-sm"></i>
                </div>
                <span className="text-xl font-heading font-extrabold text-text-dark tracking-tight">Skill<span className="text-blue-greeny">Predictor</span></span>
              </div>
              <p className="text-text-light text-sm leading-relaxed mb-6 max-w-sm">Empowering students with AI-driven insights to navigate their career paths with confidence and clarity.</p>
            </div>
            <div>
                <h4 className="font-black text-text-dark text-xs uppercase tracking-widest mb-6">Quick Nav</h4>
                <ul className="space-y-4 text-sm text-text-light font-medium">
                    <li className="hover:text-blue-greeny cursor-pointer" onClick={() => scrollToSection('about')}>About Us</li>
                    <li className="hover:text-blue-greeny cursor-pointer" onClick={() => scrollToSection('contact')}>Contact</li>
                </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center gap-4 text-center">
            <PrivacyBadge />
            <p className="text-text-light text-xs font-bold uppercase tracking-widest">&copy; {new Date().getFullYear()} SkillPredictor. Built with Passion & Integrity.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;