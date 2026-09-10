import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 🔥 Requirement: Added for API call
import { ROUTES } from "../routes/routes"; 

// --- DATA: Brand Colors & Conceptual Icons ---
const companyData = [
  { name: "Google", type: "Product", gradient: "from-blue-500 via-red-500 to-yellow-500", icon: "fab fa-google", glow: "group-hover:shadow-blue-500/30" },
  { name: "Microsoft", type: "Product", gradient: "from-blue-600 to-cyan-500", icon: "fab fa-microsoft", glow: "group-hover:shadow-cyan-500/30" },
  { name: "Amazon", type: "Product", gradient: "from-orange-500 to-yellow-500", icon: "fab fa-amazon", glow: "group-hover:shadow-orange-500/30" },
  { name: "NVIDIA", type: "Product", gradient: "from-green-500 to-emerald-700", icon: "fas fa-microchip", glow: "group-hover:shadow-green-500/30" },
  { name: "Adobe", type: "Product", gradient: "from-red-600 to-pink-600", icon: "fab fa-adn", glow: "group-hover:shadow-red-500/30" }, 
  { name: "Intel", type: "Product", gradient: "from-blue-600 to-indigo-600", icon: "fas fa-layer-group", glow: "group-hover:shadow-blue-600/30" },
  { name: "Oracle", type: "Product", gradient: "from-red-500 to-orange-600", icon: "fas fa-database", glow: "group-hover:shadow-red-500/30" },
  { name: "SAP", type: "Product", gradient: "from-blue-800 to-cyan-600", icon: "fas fa-server", glow: "group-hover:shadow-blue-800/30" },
  { name: "Freshworks", type: "Product", gradient: "from-pink-500 to-orange-400", icon: "fas fa-ticket-alt", glow: "group-hover:shadow-pink-500/30" },
  { name: "Zoho", type: "Product", gradient: "from-yellow-500 to-red-500", icon: "fas fa-briefcase", glow: "group-hover:shadow-yellow-500/30" },
  { name: "TCS", type: "Service", gradient: "from-indigo-600 to-blue-500", icon: "fas fa-building", glow: "group-hover:shadow-indigo-500/30" },
  { name: "Infosys", type: "Service", gradient: "from-blue-600 to-cyan-500", icon: "fas fa-code", glow: "group-hover:shadow-cyan-500/30" },
  { name: "Wipro", type: "Service", gradient: "from-green-500 to-teal-400", icon: "fas fa-laptop-code", glow: "group-hover:shadow-teal-500/30" },
  { name: "Cognizant", type: "Service", gradient: "from-blue-800 to-indigo-500", icon: "fas fa-users-cog", glow: "group-hover:shadow-indigo-500/30" },
  { name: "Accenture", type: "Service", gradient: "from-purple-600 to-indigo-600", icon: "fas fa-globe", glow: "group-hover:shadow-purple-500/30" },
  { name: "Capgemini", type: "Service", gradient: "from-blue-500 to-blue-700", icon: "fas fa-handshake", glow: "group-hover:shadow-blue-600/30" },
  { name: "HCLTech", type: "Service", gradient: "from-blue-400 to-indigo-600", icon: "fas fa-network-wired", glow: "group-hover:shadow-indigo-500/30" },
  { name: "Tech Mahindra", type: "Service", gradient: "from-red-600 to-red-400", icon: "fas fa-cogs", glow: "group-hover:shadow-red-500/30" },
  { name: "Persistent", type: "Service", gradient: "from-orange-500 to-red-500", icon: "fas fa-chart-line", glow: "group-hover:shadow-orange-500/30" },
  { name: "Zensar", type: "Service", gradient: "from-cyan-600 to-blue-600", icon: "fas fa-cloud", glow: "group-hover:shadow-cyan-500/30" },
  { name: "Mu Sigma", type: "Analytics", gradient: "from-blue-500 to-purple-500", icon: "fas fa-infinity", glow: "group-hover:shadow-purple-500/30" },
  { name: "Fractal", type: "Analytics", gradient: "from-yellow-500 to-orange-500", icon: "fas fa-brain", glow: "group-hover:shadow-yellow-500/30" },
  { name: "Tiger Analytics", type: "Analytics", gradient: "from-orange-400 to-red-500", icon: "fas fa-chart-bar", glow: "group-hover:shadow-orange-500/30" },
  { name: "Tredence", type: "Analytics", gradient: "from-teal-400 to-blue-500", icon: "fas fa-project-diagram", glow: "group-hover:shadow-teal-500/30" },
  { name: "IBM", type: "MNC", gradient: "from-blue-700 to-indigo-800", icon: "fas fa-server", glow: "group-hover:shadow-indigo-500/30" },
  { name: "CDAC", type: "Govt", gradient: "from-slate-600 to-slate-800", icon: "fas fa-university", glow: "group-hover:shadow-slate-500/30" },
  { name: "Internshala", type: "Startup", gradient: "from-blue-400 to-cyan-300", icon: "fas fa-rocket", glow: "group-hover:shadow-cyan-400/30" },
];

const CompanyPrep = () => {
  const navigate = useNavigate(); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  // 🔥 NEW: Function to record activity before navigation
  const handleCompanyClick = async (company) => {
    try {
      const token = localStorage.getItem("token"); 
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      
      // ✅ Record Start Activity in New Collection
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

      // 🔥 CORRECTED ROUTING: Now routes to /company-prep/:companyName
      if (res.data.success && res.data.attemptId) {
        navigate(`/company-prep/${company.name.toLowerCase()}?attemptId=${res.data.attemptId}`);
      } else {
        navigate(`/company-prep/${company.name.toLowerCase()}`);
      }

    } catch (err) {
      console.error("Activity tracking failed:", err.message);
      // 🔥 CORRECTED ROUTING: Fallback navigation if API fails
      navigate(`/company-prep/${company.name.toLowerCase()}`);
    }
  };

  const filteredCompanies = companyData.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-greeny/20 overflow-x-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-greeny/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header Section */}
      <div className="relative z-10 bg-white/50 backdrop-blur-md border-b border-white/20 pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-greeny transition-all mb-8 text-sm font-bold uppercase tracking-widest group"
          >
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md border border-slate-100 group-hover:-translate-x-1 transition-transform">
                <i className="fas fa-arrow-left"></i>
            </span> 
            Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-5xl md:text-7xl font-heading font-black text-slate-800 mb-6 tracking-tight">
                Company <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-greeny to-teal-500">Specifics</span>
              </h1>
              
              <p className="text-xl text-slate-500 max-w-2xl font-medium leading-relaxed">
                Crack the interview patterns of top tech giants.
                <span className="font-bold text-slate-800"> Powered by Live RAG Engine.</span>
              </p>
            </div>

            <button 
              onClick={() => navigate('/skill-radar')}
              className="bg-white border-2 border-slate-100 text-slate-600 px-6 py-4 rounded-2xl font-bold hover:border-teal-500 hover:text-teal-600 hover:shadow-xl hover:shadow-teal-500/10 transition-all flex items-center gap-3 group whitespace-nowrap"
            >
              <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-500 group-hover:scale-110 transition-transform">
                <i className="fas fa-chart-pie text-lg"></i>
              </div>
              View Skill Radar
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-12 relative max-w-xl group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-greeny to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
            <div className="relative bg-white rounded-2xl flex items-center shadow-xl p-1">
                <div className="w-12 h-12 flex items-center justify-center text-slate-400">
                   <i className="fas fa-search text-xl"></i>
                </div>
                <input 
                    type="text" 
                    placeholder="Search Google, Amazon, TCS..." 
                    className="w-full h-12 pr-6 border-none outline-none text-slate-800 font-bold text-lg bg-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredCompanies.map((company, index) => (
            <button 
              onClick={() => handleCompanyClick(company)} // 🔥 Requirement Updated: Uses New Function
              key={index} 
              style={{ 
                  opacity: loaded ? 1 : 0, 
                  transform: loaded ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.5s ease-out ${index * 0.05}s`
              }}
              className={`text-left group relative bg-white rounded-[1.5rem] p-6 border border-slate-100/60 shadow-sm hover:shadow-2xl ${company.glow} transition-all duration-300 overflow-hidden flex flex-col h-[260px]`}
            >
              <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${company.gradient} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-500`}></div>
              
              <div className="flex justify-between items-start relative z-10 mb-8 w-full">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${company.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`${company.icon} text-2xl`}></i>
                </div>
                
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-slate-100 bg-slate-50 text-slate-500 group-hover:bg-white group-hover:shadow-sm`}>
                    {company.type}
                </span>
              </div>

              <div className="relative z-10 mt-auto">
                 <h3 className="text-2xl font-heading font-black text-slate-800 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${company.gradient} transition-colors">
                    {company.name}
                 </h3>
                 <div className="h-1 w-12 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full w-full bg-gradient-to-r ${company.gradient} transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500`}></div>
                 </div>
              </div>

              <div className="relative z-10 pt-4 flex w-full items-center justify-between text-xs font-bold text-slate-400 mt-4">
                 <span className="group-hover:text-slate-600 transition-colors">Updated 24h ago</span>
                 <i className="fas fa-arrow-right transform opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 text-slate-800"></i>
              </div>
            </button>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-24 opacity-60">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-3xl">
                <i className="fas fa-ghost"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800">No results found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPrep;