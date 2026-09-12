import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Video, Brain, 
  Users, Building2, PieChart, LogOut, X, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ handleLogout, isOpen = false, onClose = () => {} }) => {
  const menuItems = [
    { icon: <FileText size={18} />, label: "Resume Scorer", path: "/resume-scorer", code: "01" },
    { icon: <Video size={18} />, label: "AI Mock Interview", path: "/student/ai-interview", code: "02" },
    { icon: <Brain size={18} />, label: "Aptitude Tests", path: "/student/aptitude", code: "03" },
    { icon: <PieChart size={18} />, label: "Analytics", path: "/student/analytics", code: "04" },
    { icon: <Users size={18} />, label: "Group Discussion", path: "/student/group-discussion", code: "05" },
    { icon: <Building2 size={18} />, label: "Company Prep", path: "/company-prep", code: "06" },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      <aside className={`
        fixed md:sticky top-0 inset-y-0 left-0 z-50
        w-72 bg-white border-r-2 border-slate-900 p-5 flex flex-col h-screen font-sans
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Logo Section */}
        <div className="flex items-center justify-between mb-8 px-1">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_0px_#090d16]">
              <Zap className="text-slate-950 fill-current size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black uppercase tracking-tight text-slate-900 leading-none">
                Skill<span className="text-sky-500">Predictor</span>
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">
                PROTOCOL v3.2
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-all"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
          {/* Dashboard Active Pill */}
          <NavLink
            to="/student"
            className="flex items-center justify-between px-3.5 py-3 rounded-xl font-black text-xs bg-slate-950 text-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0ea5e9] cursor-pointer mb-6 uppercase tracking-wider"
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard size={18} className="text-sky-400" />
              <span>COMMAND DECK</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </NavLink>

          {/* Modules Label */}
          <div className="flex items-center justify-between px-2 mb-3">
            <p className="font-mono text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              // CORE PROTOCOLS
            </p>
            <div className="h-[1px] flex-1 bg-slate-200 ml-3"></div>
          </div>
          
          {/* Menu Items */}
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center justify-between px-3.5 py-3 rounded-xl font-bold text-xs transition-all duration-150 group border-2
                ${isActive 
                  ? 'bg-sky-50 text-sky-900 border-sky-500 shadow-[3px_3px_0px_0px_#0ea5e9]' 
                  : 'text-slate-600 border-transparent hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span className={`transition-transform ${isActive ? 'text-sky-600 scale-105' : 'text-slate-400 group-hover:text-slate-700'}`}>
                      {item.icon}
                    </span>
                    <span className="uppercase tracking-tight font-black">{item.label}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 group-hover:text-sky-600">
                    {item.code}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="mt-auto pt-4 border-t-2 border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-all font-black text-[11px] uppercase tracking-wider group"
          >
            <LogOut size={16} className="group-hover:rotate-12 transition-transform text-slate-400 group-hover:text-rose-500" />
            <span>DISCONNECT SESSION</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;