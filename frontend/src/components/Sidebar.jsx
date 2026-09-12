import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Video, Brain, 
  Users, Building2, PieChart, LogOut, X
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ handleLogout, isOpen = false, onClose = () => {} }) => {
  const menuItems = [
    { icon: <FileText size={19} />, label: "Resume Scorer", path: "/resume-scorer" },
    { icon: <Video size={19} />, label: "AI Mock Interview", path: "/student/ai-interview" },
    { icon: <Brain size={19} />, label: "Aptitude Tests", path: "/student/aptitude" },
    { icon: <Users size={19} />, label: "Group Discussion", path: "/student/group-discussion" },
    { icon: <Building2 size={19} />, label: "Company Prep", path: "/company-prep" },
    { icon: <PieChart size={19} />, label: "Analytics", path: "/student/analytics" },
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
        w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-6 flex flex-col shadow-sm h-screen font-sans
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Logo Section */}
        <div className="flex items-center justify-between mb-8 md:mb-10 px-2">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/20 transform group-hover:rotate-6 transition-all duration-300">
              <LayoutDashboard className="text-white size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-black tracking-tight text-slate-800 dark:text-white leading-none">
                Skill<span className="text-teal-600 dark:text-teal-400">Predictor</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Elevate Your Career</span>
            </div>
          </div>

          {/* Close button visible only on mobile */}
          <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
        {/* DASHBOARD: Active State */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs bg-teal-600 text-white shadow-lg shadow-teal-600/20 cursor-default mb-6 uppercase tracking-wider">
          <LayoutDashboard size={17} strokeWidth={2.5} />
          <span>Dashboard</span>
        </div>

        {/* Features Label */}
        <div className="flex items-center justify-between px-3 mb-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Core Modules
          </p>
          <div className="h-[1px] flex-1 bg-slate-100 dark:bg-slate-800 ml-3"></div>
        </div>
        
        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `
              relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-semibold text-xs transition-all duration-200 group
              ${isActive 
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-100 dark:border-teal-900/40' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-teal-600 dark:hover:text-teal-400'}
            `}
          >
            {({ isActive }) => (
              <>
                <span className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                  {React.cloneElement(item.icon, { 
                    strokeWidth: isActive ? 2.4 : 2,
                    className: isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-400 group-hover:text-teal-500"
                  })}
                </span>
                <span className="relative z-10">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout - Bottom Section */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 rounded-xl transition-all duration-200 font-bold text-xs uppercase tracking-wider group"
        >
          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50 transition-colors">
            <LogOut size={16} className="group-hover:rotate-6 transition-transform" />
          </div>
          Logout Session
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;