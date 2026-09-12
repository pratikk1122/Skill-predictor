import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Lock, Camera, Trash2, ChevronDown, Menu, Shield } from 'lucide-react';

const Navbar = ({ profileImage, setProfileImage, fileInputRef, studentName, studentEmail, onToggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <header className="flex justify-between md:justify-end items-center mb-3 sm:mb-6">
      {/* Mobile Hamburger Menu */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="md:hidden flex items-center justify-center w-10 h-10 bg-white border-2 border-slate-900 rounded-xl shadow-[2px_2px_0px_0px_#090d16] text-slate-900 hover:bg-sky-50 transition-all active:scale-95"
        aria-label="Open menu"
      >
        <Menu size={18} className="text-slate-900" />
      </button>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-3.5 bg-white border-2 border-slate-900 rounded-xl shadow-[3px_3px_0px_0px_#090d16] hover:shadow-[4px_4px_0px_0px_#0ea5e9] transition-all active:scale-95 group"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-sky-500 rounded-lg overflow-hidden flex items-center justify-center text-slate-950 font-black border border-slate-900 text-xs sm:text-sm">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">
                CANDIDATE //
              </p>
              <p className="text-xs font-black text-slate-900 leading-none truncate max-w-[120px]">{name}</p>
            </div>
            <ChevronDown size={14} className={`text-slate-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-white border-2 border-slate-900 rounded-2xl shadow-[6px_6px_0px_0px_#090d16] py-4 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
              <div className="px-5 pb-3 border-b-2 border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-[10px] text-sky-600 font-black uppercase tracking-wider">
                    // ACCOUNT_DATA
                  </p>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                
                <div className="space-y-3">
                  {/* Real Name Section */}
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-slate-100 rounded-lg border border-slate-200">
                      <User size={14} className="text-slate-700" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Name</p>
                      <p className="text-xs font-black text-slate-900">{name}</p>
                    </div>
                  </div>

                  {/* Real Email Section */}
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-slate-100 rounded-lg border border-slate-200">
                      <Mail size={14} className="text-slate-700" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Email</p>
                      <p className="text-xs font-black text-slate-900 truncate max-w-[190px]">{email}</p>
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-slate-100 rounded-lg border border-slate-200">
                      <Shield size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">Security</p>
                      <p className="text-[11px] font-mono text-emerald-600 font-bold">STRICT OTP VERIFIED</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="px-2 pt-2 space-y-1">
                <button 
                  onClick={() => { fileInputRef.current.click(); setIsProfileOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-lg transition-colors"
                >
                  <Camera size={14} className="text-slate-400" /> Update Photo
                </button>
                {profileImage && (
                  <button 
                    onClick={() => { setProfileImage(null); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-black uppercase tracking-wider text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} /> Remove Photo
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