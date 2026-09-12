import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Brain, Video, FileText, BarChart3 } from "lucide-react";

const MobileBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/student", icon: Home },
    { name: "Aptitude", path: "/student/aptitude", icon: Brain },
    { 
      name: "Interview", 
      path: "/student/ai-interview", 
      icon: Video,
      isPrimary: true 
    },
    { name: "Resume", path: "/resume-scorer", icon: FileText },
    { name: "Analytics", path: "/student/analytics", icon: BarChart3 }
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-colors duration-300"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== "/student" && location.pathname.startsWith(item.path));

          if (item.isPrimary) {
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className="flex flex-col items-center -mt-6 group focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 active:scale-90 ${
                  isActive 
                    ? "bg-teal-600 text-white shadow-teal-500/40 ring-4 ring-teal-50 dark:ring-teal-950/50" 
                    : "bg-gradient-to-tr from-teal-600 to-teal-500 text-white shadow-teal-500/30 group-hover:scale-105"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-bold mt-1 tracking-tight ${
                  isActive ? "text-teal-600 dark:text-teal-400" : "text-slate-500 dark:text-slate-400"
                }`}>
                  {item.name}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all duration-150 active:scale-95 focus:outline-none ${
                isActive ? "text-teal-600 dark:text-teal-400 font-bold" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? "bg-teal-50 dark:bg-teal-950/60" : ""}`}>
                <Icon className={`w-5 h-5 ${isActive ? "text-teal-600 dark:text-teal-400 stroke-[2.4]" : "stroke-[1.8]"}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
