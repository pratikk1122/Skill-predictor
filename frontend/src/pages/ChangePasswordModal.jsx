import React, { useState } from "react";
import api from "../services/api";

const ChangePasswordModal = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 PASSWORD RULE STATE
  const [rules, setRules] = useState({
    upper: false, lower: false, number: false, special: false, length: false
  });

  const handleNewPasswordChange = (val) => {
    setNewPassword(val);
    setRules({
      upper: /[A-Z]/.test(val),
      lower: /[a-z]/.test(val),
      number: /[0-9]/.test(val),
      special: /[@$!%*?&]/.test(val),
      length: val.length >= 8 // Boundary: Min 8 chars for security
    });
  };

  const isPasswordValid = Object.values(rules).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword) {
      alert("Please fill in both old and new password fields.");
      return;
    }

    if (!isPasswordValid) {
      alert("New password must meet all security requirements.");
      return;
    }

    try {
      setLoading(true);

      // Backend call to change password
      await api.post("/auth/change-password", {
        oldPassword,
        newPassword
      });

      alert("Password changed successfully! For security, please login again.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.message || "Failed to change password. Please check your old password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#5cbdb9]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-[#5cbdb9] text-2xl"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Security Update</h2>
            <p className="text-slate-400 text-xs mt-2 font-medium uppercase tracking-widest">Update Your Password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Old Password */}
          <div className="relative">
            <i className="fas fa-unlock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
            <input
              type="password"
              placeholder="Current Password"
              className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#5cbdb9]/20 outline-none transition-all"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          {/* New Password */}
          <div className="relative">
            <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
            <input
              type="password"
              placeholder="New Secure Password"
              className="w-full pl-10 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#5cbdb9]/20 outline-none transition-all"
              value={newPassword}
              onChange={(e) => handleNewPasswordChange(e.target.value)}
              required
            />
          </div>

          {/* Security Checklist (Matches Signup Design) */}
          <div className="bg-slate-50 p-5 rounded-2xl grid grid-cols-2 gap-2 border border-slate-100">
                <p className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">New Password Strength</p>
                <PasswordRule met={rules.length} text="8+ Characters" />
                <PasswordRule met={rules.upper} text="Uppercase" />
                <PasswordRule met={rules.lower} text="Lowercase" />
                <PasswordRule met={rules.number} text="Number" />
                <PasswordRule met={rules.special} text="Special Char" />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="w-full bg-[#5cbdb9] text-white py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-lg shadow-[#5cbdb9]/20 hover:bg-[#4aa8a4] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin mr-2"></i> : "Confirm Update"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all"
            >
              Discard Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Internal Helper Component
const PasswordRule = ({ met, text }) => (
    <div className={`flex items-center gap-2 ${met ? 'text-green-500' : 'text-slate-300'}`}>
        <i className={`fas ${met ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
        <span className="text-[10px] font-bold">{text}</span>
    </div>
);

export default ChangePasswordModal;