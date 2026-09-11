import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Video, Brain, 
  Users, Building2, PieChart, LogOut, X
} from 'lucide-react';
import { motion } from 'framer-motion'; // ✨ Added for premium feel

const Sidebar = ({ handleLogout, isOpen = false, onClose = () => {} }) => {
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
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed md:sticky top-0 inset-y-0 left-0 z-50
        w-72 bg-[#fdfdfd] border-r border-slate-100 p-6 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-screen font-sans
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Logo Section - Professional & Sleek */}
        <div className="flex items-center justify-between mb-8 md:mb-12 px-2">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 md:w-11 md:h-11 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/20 transform group-hover:rotate-6 transition-all duration-300">
              <LayoutDashboard className="text-white size-5 md:size-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-black tracking-tight text-slate-800 leading-none">
                Skill<span className="text-teal-600">Predictor</span>
              </span>
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Elevate Your Career</span>
            </div>
          </div>

          {/* Close button visible only on mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
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
            onClick={onClose}
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
    </>
  );
};

export default Sidebar;