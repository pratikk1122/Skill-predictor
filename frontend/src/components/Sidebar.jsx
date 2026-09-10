import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Video, Brain, 
  Users, Building2, PieChart, LogOut
} from 'lucide-react';
import { motion } from 'framer-motion'; // ✨ Added for premium feel

const Sidebar = ({ handleLogout }) => {
  // ✅ Removed Admin Menu Items as per screenshot requirement
  const menuItems = [
    { icon: <FileText size={20} />, label: "Resume Scorer", path: "/resume-scorer" },
    { icon: <Video size={20} />, label: "AI Mock Interview", path: "/student/ai-interview" },
    { icon: <Brain size={20} />, label: "Aptitude Tests", path: "/student/aptitude" },
    { icon: <Users size={20} />, label: "Group Discussion", path: "/student/group-discussion" },
    { icon: <Building2 size={20} />, label: "Company Prep", path: "/company-prep" },
    { icon: <PieChart size={20} />, label: "Analytics", path: "/student/analytics" },
  ];

  return (
    <aside className="w-72 bg-[#fdfdfd] border-r border-slate-100 p-6 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-screen sticky top-0 font-sans z-50">
      
      {/* Logo Section - Professional & Sleek */}
      <div className="flex items-center gap-3 mb-12 px-2 group cursor-pointer">
        <div className="w-11 h-11 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/20 transform group-hover:rotate-6 transition-all duration-300">
          <LayoutDashboard className="text-white size-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight text-slate-800 leading-none">
            Skill<span className="text-teal-600">Predictor</span>
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Elevate Your Career</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
        {/* DASHBOARD: High-impact Active State */}
        <div className="flex items-center gap-4 px-4 py-4 rounded-2xl font-extrabold text-[13px] bg-teal-600 text-white shadow-xl shadow-teal-600/25 cursor-default mb-8 uppercase tracking-[0.1em]">
          <LayoutDashboard size={20} strokeWidth={2.5} />
          <span>Dashboard</span>
        </div>

        {/* Features Label */}
        <div className="flex items-center justify-between px-4 mb-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Core Modules
          </p>
          <div className="h-[1px] flex-1 bg-slate-100 ml-4"></div>
        </div>
        
        {/* Menu Items with Hover Physics */}
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => `
              relative flex items-center gap-4 px-4 py-4 rounded-2xl font-bold text-sm transition-all duration-300 group
              ${isActive 
                ? 'bg-teal-50 text-teal-700 shadow-[inset_0_0_0_1px_rgba(13,148,136,0.1)]' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-teal-600'}
            `}
          >
            {({ isActive }) => (
              <>
                <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {React.cloneElement(item.icon, { 
                    strokeWidth: isActive ? 2.5 : 2,
                    className: isActive ? "text-teal-600" : "text-slate-400 group-hover:text-teal-500"
                  })}
                </span>
                <span className="relative z-10">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="absolute inset-0 border-l-4 border-teal-600 rounded-2xl pointer-events-none"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout - Bottom Section */}
      <div className="mt-auto pt-6 border-t border-slate-100">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 text-slate-500 hover:text-red-600 hover:bg-red-50/50 rounded-2xl transition-all duration-300 font-extrabold text-xs uppercase tracking-[0.15em] group"
        >
          <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-red-100 transition-colors">
            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
          </div>
          Logout Session
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;