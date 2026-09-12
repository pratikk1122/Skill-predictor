import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Lock, Camera, Trash2, ChevronDown, Menu } from 'lucide-react';

const Navbar = ({ profileImage, setProfileImage, fileInputRef, studentName, studentEmail, onToggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 🔄 Priority: Props > LocalStorage > Default
  const name = studentName || localStorage.getItem("userName") || "Student User";
  const email = studentEmail || localStorage.getItem("userEmail") || "student@skillpredictor.com";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex justify-between md:justify-end items-center mb-3 sm:mb-8">
      {/* Mobile Hamburger Menu */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="md:hidden flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-700 hover:border-teal-300 transition-all active:scale-95"
        aria-label="Open menu"
      >
        <Menu size={20} className="text-teal-600" />
      </button>
      <div className="flex items-center gap-6">
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pr-4 bg-white border border-slate-200 rounded-2xl hover:border-teal-300 transition-all shadow-sm active:scale-95 group"
          >
            <div className="w-10 h-10 bg-teal-600 rounded-xl overflow-hidden flex items-center justify-center text-white font-bold shadow-md">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Student Account</p>
              <p className="text-sm font-bold text-slate-700 leading-none">{name}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white border border-slate-100 rounded-2xl shadow-2xl py-4 z-50 animate-in fade-in zoom-in duration-150 origin-top-right border-t-4 border-t-teal-600">
              <div className="px-5 pb-4 border-b border-slate-50">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mb-4">Account Details</p>
                
                <div className="space-y-4">
                  {/* Real Name Section */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-lg">
                      <User size={16} className="text-teal-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Full Name</p>
                      <p className="text-sm font-bold text-slate-700">{name}</p>
                    </div>
                  </div>

                  {/* Real Email Section */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Mail size={16} className="text-blue-600" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Email Address</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{email}</p>
                    </div>
                  </div>

                  {/* Static Password Section */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Lock size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Password</p>
                      <p className="text-sm font-bold text-slate-700 tracking-widest">••••••••</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-2 pt-3">
                <button 
                  onClick={() => { fileInputRef.current.click(); setIsProfileOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <Camera size={17} className="text-slate-400" /> Change Profile Photo
                </button>
                {profileImage && (
                  <button 
                    onClick={() => { setProfileImage(null); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={17} /> Remove Photo
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;