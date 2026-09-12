import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Mail, Lock, Camera, Trash2, ChevronDown, 
  LogOut, ShieldCheck, KeyRound, ExternalLink 
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './common/ThemeToggle';
import ProfileModal from './common/ProfileModal';
import ChangePasswordModal from '../pages/ChangePasswordModal';
import api from '../services/api';

const Navbar = ({ 
  profileImage, 
  setProfileImage, 
  studentName, 
  studentEmail,
  showBrandOnMobile = true 
}) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const internalFileInputRef = useRef(null);

  // 🔄 Priority: Props > LocalStorage > Default
  const name = studentName || localStorage.getItem("userName") || "Student User";
  const email = studentEmail || localStorage.getItem("userEmail") || "student@skillpredictor.com";
  const role = localStorage.getItem("role") || "student";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await api.post("/auth/logout", {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.clear();
      setIsDropdownOpen(false);
      navigate("/login");
    }
  };

  const handleInternalImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (setProfileImage) setProfileImage(reader.result);
        try {
          localStorage.setItem("userProfileImage", reader.result);
        } catch {
          // Ignore quota error
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <header className="flex justify-between items-center mb-3 sm:mb-8">
        {/* Mobile Brand Mark (Replaces useless 3-lines hamburger menu) */}
        {showBrandOnMobile ? (
          <Link 
            to="/student" 
            className="md:hidden flex items-center gap-2 group"
          >
            <div className="w-8 h-8 bg-teal-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shadow-teal-600/20">
              SP
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-800 dark:text-white">
              Skill<span className="text-teal-600 dark:text-teal-400">Predictor</span>
            </span>
          </Link>
        ) : (
          <div className="md:hidden" />
        )}

        {/* Action Controls: Theme Toggle & User Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4 ml-auto">
          {/* Modern Dark/Light Mode Toggle */}
          <ThemeToggle />
          
          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(prev => !prev)}
              aria-label="User profile menu"
              className="flex items-center gap-2.5 sm:gap-3 p-1 sm:p-1.5 pr-2.5 sm:pr-4 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl hover:border-teal-400 dark:hover:border-teal-500 transition-all shadow-sm active:scale-95 group backdrop-blur-md"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-600 rounded-xl overflow-hidden flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
                {profileImage ? (
                  <img src={profileImage} alt={name} className="w-full h-full object-cover" />
                ) : (
                  name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                  {role === "admin" ? "Administrator" : "Student"}
                </p>
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 leading-none truncate max-w-[130px]">
                  {name}
                </p>
              </div>
              <ChevronDown 
                size={14} 
                className={`text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-teal-600' : ''}`} 
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right border-t-4 border-t-teal-600">
                {/* Header Summary */}
                <div className="px-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white capitalize truncate">{name}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
                      {role === "admin" ? "Admin" : "Student"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-400 truncate">{email}</p>
                </div>

                {/* Primary Action: View Full Profile */}
                <div className="px-2 py-2 border-b border-slate-100 dark:border-slate-800">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-700 dark:hover:text-teal-300 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-teal-100/80 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
                        <User size={14} />
                      </div>
                      <span>View My Profile</span>
                    </div>
                    <ExternalLink size={13} className="text-slate-400 group-hover:text-teal-600 transition-colors" />
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setIsPasswordModalOpen(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <KeyRound size={14} />
                    </div>
                    <span>Change Password</span>
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      internalFileInputRef.current?.click();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <Camera size={14} />
                    </div>
                    <span>Update Profile Photo</span>
                  </button>
                </div>

                {/* Logout Action */}
                <div className="px-2 pt-2">
                  <button 
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-100/70 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                      <LogOut size={14} />
                    </div>
                    <span>Log Out Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hidden File Picker */}
        <input 
          type="file" 
          ref={internalFileInputRef} 
          onChange={handleInternalImageChange} 
          className="hidden" 
          accept="image/*" 
        />
      </header>

      {/* Full Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        studentName={name}
        studentEmail={email}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
      />

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}
    </>
  );
};

export default Navbar;