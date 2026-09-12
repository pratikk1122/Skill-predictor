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
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-slate-900 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
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
                <div className={`w-12 h-12 rounded-xl border-2 border-slate-900 flex items-center justify-center transition-all duration-150 active:scale-90 ${
                  isActive 
                    ? "bg-sky-400 text-slate-950 shadow-[3px_3px_0px_0px_#090d16]" 
                    : "bg-slate-900 text-sky-400 shadow-[2px_2px_0px_0px_#0ea5e9]"
                }`}>
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider mt-1 ${
                  isActive ? "text-sky-600" : "text-slate-600"
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
                isActive ? "text-sky-600 font-black" : "text-slate-400 hover:text-slate-700 font-bold"
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? "bg-sky-50 text-sky-600 border border-sky-200" : ""}`}>
                <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
              </div>
              <span className="text-[9px] uppercase tracking-tight mt-0.5 font-bold">
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
