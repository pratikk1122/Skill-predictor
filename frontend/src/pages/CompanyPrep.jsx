import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ROUTES } from "../routes/routes"; 
import MobileBottomNav from "../components/MobileBottomNav";
import ThemeToggle from "../components/common/ThemeToggle";
import { 
  ArrowLeft, 
  Search, 
  Sparkles, 
  Radar, 
  Building2, 
  ExternalLink, 
  Compass, 
  ChevronRight 
} from "lucide-react";

// --- DATA: Brand Colors & Conceptual Metadata ---
const companyData = [
  { name: "Google", type: "Product", gradient: "from-blue-500 via-red-500 to-yellow-500", glow: "group-hover:shadow-blue-500/20" },
  { name: "Microsoft", type: "Product", gradient: "from-blue-600 to-cyan-500", glow: "group-hover:shadow-cyan-500/20" },
  { name: "Amazon", type: "Product", gradient: "from-orange-500 to-yellow-500", glow: "group-hover:shadow-orange-500/20" },
  { name: "NVIDIA", type: "Product", gradient: "from-green-500 to-emerald-700", glow: "group-hover:shadow-green-500/20" },
  { name: "Adobe", type: "Product", gradient: "from-red-600 to-pink-600", glow: "group-hover:shadow-red-500/20" }, 
  { name: "Intel", type: "Product", gradient: "from-blue-600 to-indigo-600", glow: "group-hover:shadow-blue-600/20" },
  { name: "Oracle", type: "Product", gradient: "from-red-500 to-orange-600", glow: "group-hover:shadow-red-500/20" },
  { name: "SAP", type: "Product", gradient: "from-blue-800 to-cyan-600", glow: "group-hover:shadow-blue-800/20" },
  { name: "Freshworks", type: "Product", gradient: "from-pink-500 to-orange-400", glow: "group-hover:shadow-pink-500/20" },
  { name: "Zoho", type: "Product", gradient: "from-yellow-500 to-red-500", glow: "group-hover:shadow-yellow-500/20" },
  { name: "TCS", type: "Service", gradient: "from-indigo-600 to-blue-500", glow: "group-hover:shadow-indigo-500/20" },
  { name: "Infosys", type: "Service", gradient: "from-blue-600 to-cyan-500", glow: "group-hover:shadow-cyan-500/20" },
  { name: "Wipro", type: "Service", gradient: "from-green-500 to-teal-400", glow: "group-hover:shadow-teal-500/20" },
  { name: "Cognizant", type: "Service", gradient: "from-blue-800 to-indigo-500", glow: "group-hover:shadow-indigo-500/20" },
  { name: "Accenture", type: "Service", gradient: "from-purple-600 to-indigo-600", glow: "group-hover:shadow-purple-500/20" },
  { name: "Capgemini", type: "Service", gradient: "from-blue-500 to-blue-700", glow: "group-hover:shadow-blue-600/20" },
  { name: "HCLTech", type: "Service", gradient: "from-blue-400 to-indigo-600", glow: "group-hover:shadow-indigo-500/20" },
  { name: "Tech Mahindra", type: "Service", gradient: "from-red-600 to-red-400", glow: "group-hover:shadow-red-500/20" },
  { name: "Persistent", type: "Service", gradient: "from-orange-500 to-red-500", glow: "group-hover:shadow-orange-500/20" },
  { name: "Zensar", type: "Service", gradient: "from-cyan-600 to-blue-600", glow: "group-hover:shadow-cyan-500/20" },
  { name: "Mu Sigma", type: "Analytics", gradient: "from-blue-500 to-purple-500", glow: "group-hover:shadow-purple-500/20" },
  { name: "Fractal", type: "Analytics", gradient: "from-yellow-500 to-orange-500", glow: "group-hover:shadow-yellow-500/20" },
  { name: "Tiger Analytics", type: "Analytics", gradient: "from-orange-400 to-red-500", glow: "group-hover:shadow-orange-500/20" },
  { name: "Tredence", type: "Analytics", gradient: "from-teal-400 to-blue-500", glow: "group-hover:shadow-teal-500/20" },
  { name: "IBM", type: "MNC", gradient: "from-blue-700 to-indigo-800", glow: "group-hover:shadow-indigo-500/20" },
  { name: "CDAC", type: "Govt", gradient: "from-slate-600 to-slate-800", glow: "group-hover:shadow-slate-500/20" },
  { name: "Internshala", type: "Startup", gradient: "from-blue-400 to-cyan-300", glow: "group-hover:shadow-cyan-400/20" },
];

const CompanyPrep = () => {
  const navigate = useNavigate(); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  const handleCompanyClick = async (company) => {
    try {
      const token = localStorage.getItem("token"); 
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      
      const res = await axios.post(
        `${API_URL}/company-prep/start`, 
        { 
          companyName: company.name,
          moduleName: "Placement Module"
        },
        { 
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      if (res.data.success && res.data.attemptId) {
        navigate(`/company-prep/${company.name.toLowerCase()}?attemptId=${res.data.attemptId}`);
      } else {
        navigate(`/company-prep/${company.name.toLowerCase()}`);
      }

    } catch {
      navigate(`/company-prep/${company.name.toLowerCase()}`);
    }
  };

  const filteredCompanies = companyData.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 selection:bg-teal-500/20 pb-28 md:pb-12 transition-colors duration-300">
      
      {/* Header Section */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
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
                Company <span className="text-teal-600 dark:text-teal-400">Prep Hub</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Targeted Placement Blueprints & RAG Patterns</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => navigate('/skill-radar')}
              className="hidden sm:flex items-center gap-2 h-10 px-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
            >
              <Radar size={15} className="text-teal-600 dark:text-teal-400" />
              <span>Skill Radar</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Deck */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60 mb-3">
            <Sparkles size={13} />
            <span>Interview Blueprint Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
            Target Company Modules
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-medium leading-relaxed">
            Practice real technical evaluation patterns, coding rounds, and behavioral expectations for top tier engineering firms.
          </p>

          {/* Ergonomic Search Input */}
          <div className="mt-6 max-w-md mx-auto relative">
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl flex items-center shadow-sm border border-slate-200/80 dark:border-slate-800 px-3.5 h-11 transition-all focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20">
              <Search size={16} className="text-slate-400 mr-2.5 shrink-0" />
              <input 
                type="text" 
                placeholder="Filter by company name (e.g. Google, Amazon, TCS)..." 
                className="w-full bg-transparent border-none outline-none text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredCompanies.map((company, index) => (
            <button 
              onClick={() => handleCompanyClick(company)}
              key={index} 
              style={{ 
                opacity: loaded ? 1 : 0, 
                transform: loaded ? 'translateY(0)' : 'translateY(12px)',
                transition: `all 0.3s ease-out ${Math.min(index * 0.02, 0.4)}s`
              }}
              className={`text-left group relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl ${company.glow} transition-all duration-300 overflow-hidden flex flex-col justify-between h-[200px] active:scale-98`}
            >
              {/* Subtle Ambient Background */}
              <div className={`absolute -right-8 -top-8 w-24 h-24 bg-gradient-to-br ${company.gradient} opacity-10 dark:opacity-15 rounded-full blur-xl group-hover:scale-125 transition-all duration-500`} />
              
              {/* Card Top */}
              <div className="flex justify-between items-start relative z-10 w-full">
                <div className={`w-11 h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br ${company.gradient} flex items-center justify-center text-white shadow-md font-bold text-sm group-hover:scale-105 transition-transform duration-200`}>
                  {company.name.charAt(0)}
                </div>
                
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {company.type}
                </span>
              </div>

              {/* Card Bottom */}
              <div className="relative z-10 mt-auto">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {company.name}
                </h3>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500">
                  <span>Placement Rounds</span>
                  <div className="flex items-center gap-1 text-teal-600 dark:text-teal-400 text-xs group-hover:translate-x-0.5 transition-transform">
                    <span>Prepare</span>
                    <ChevronRight size={13} />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-20">
            <Building2 size={40} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">No matching companies found</h3>
            <p className="text-xs text-slate-400">Try searching for another company or clear your search filter.</p>
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default CompanyPrep;