import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, ShieldCheck, KeyRound, LogOut, X, 
  Camera, Trash2, Award, Sparkles, CheckCircle2 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import ChangePasswordModal from "../../pages/ChangePasswordModal";

const ProfileModal = ({ 
  isOpen, 
  onClose, 
  studentName, 
  studentEmail, 
  profileImage, 
  setProfileImage 
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const name = studentName || localStorage.getItem("userName") || "Student User";
  const email = studentEmail || localStorage.getItem("userEmail") || "student@skillpredictor.com";
  const role = localStorage.getItem("role") || "student";

  const handleLogout = async () => {
    setIsLoggingOut(true);
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
      setIsLoggingOut(false);
      onClose();
      navigate("/login");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (setProfileImage) setProfileImage(reader.result);
        try {
          localStorage.setItem("userProfileImage", reader.result);
        } catch {
          // Ignore local storage quota exceeded for images
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (setProfileImage) setProfileImage(null);
    localStorage.removeItem("userProfileImage");
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
          >
            {/* Hidden Photo Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*" 
            />

            {/* Header Banner */}
            <div className="h-28 bg-gradient-to-r from-teal-500 to-teal-700 relative flex items-start justify-end p-4">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all active:scale-95"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Avatar & Details */}
            <div className="px-6 sm:px-8 pb-8 pt-0 relative">
              {/* Avatar Floating Badge */}
              <div className="flex justify-between items-end -mt-14 mb-4">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-2xl bg-teal-600 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden flex items-center justify-center text-white text-3xl font-black">
                    {profileImage ? (
                      <img src={profileImage} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change Profile Photo"
                    className="absolute bottom-1 right-1 w-8 h-8 rounded-xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-lg transition-all active:scale-90 border-2 border-white dark:border-slate-900"
                  >
                    <Camera size={14} />
                  </button>
                </div>

                <div className="flex gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                    <ShieldCheck size={14} />
                    <span>{role === "admin" ? "Administrator" : "Verified Student"}</span>
                  </span>
                </div>
              </div>

              {/* Identity Header */}
              <div className="mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white capitalize">
                  {name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                  {email}
                </p>
              </div>

              {/* Photo Management Actions */}
              {profileImage && (
                <div className="mb-6 flex gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition-all"
                  >
                    <Trash2 size={13} />
                    <span>Remove Custom Photo</span>
                  </button>
                </div>
              )}

              {/* Account Details Deck */}
              <div className="space-y-3 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-400 font-medium flex items-center gap-2">
                    <Mail size={14} className="text-teal-600 dark:text-teal-400" />
                    Email Status
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={13} /> Verified
                  </span>
                </div>

                <div className="h-[1px] bg-slate-200/60 dark:bg-slate-700/60" />

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-400 font-medium flex items-center gap-2">
                    <Award size={14} className="text-teal-600 dark:text-teal-400" />
                    Account Access
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Full AI Toolkit Enabled
                  </span>
                </div>

                <div className="h-[1px] bg-slate-200/60 dark:bg-slate-700/60" />

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-400 font-medium flex items-center gap-2">
                    <Sparkles size={14} className="text-teal-600 dark:text-teal-400" />
                    Session State
                  </span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">
                    Authenticated
                  </span>
                </div>
              </div>

              {/* Action Buttons: Change Password & Log Out */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
                >
                  <KeyRound size={16} className="text-slate-400" />
                  <span>Change Password</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex-1 h-11 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  <LogOut size={16} />
                  <span>{isLoggingOut ? "Signing Out..." : "Log Out Session"}</span>
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Embedded Change Password Dialog */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
};

export default ProfileModal;
