import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const ResetPassword = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [passwordRules, setPasswordRules] = useState({
    upper: false, lower: false, number: false, special: false, length: false
  });

  const email = state?.email;

  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    setPasswordRules({
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[@$!%*?&]/.test(value),
      length: value.length >= 8
    });
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value !== "" && index < 5) inputRefs.current[index + 1].focus();
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  const handleReset = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join("");
    if (finalOtp.length < 6 || !isPasswordValid) return setMessage("Error: Complete all fields properly.");

    try {
      setLoading(true);
      await api.post("/auth/reset-password", { email, otp: finalOtp, newPassword });
      alert("Password reset successful! Please login.");
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 font-sans">
      <div className="bg-white rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] w-full max-w-md p-10 relative border border-slate-50">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#5cbdb9]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#5cbdb9]/20 shadow-inner">
            <i className="fas fa-shield-check text-[#5cbdb9] text-4xl"></i>
          </div>
          <h2 className="text-3xl font-black text-[#1e293b] tracking-tight mb-2">Secure Reset</h2>
          <p className="text-slate-400 text-sm font-medium tracking-tight px-4">Resetting password for: <span className="text-[#5cbdb9]">{email}</span></p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((data, index) => (
              <input
                key={index} type="text" maxLength="1"
                ref={(el) => (inputRefs.current[index] = el)}
                value={data}
                onChange={(e) => handleOtpChange(e.target, index)}
                className="w-full h-12 bg-[#F9FBFC] border-none rounded-xl text-center text-xl font-black text-[#1e293b] focus:ring-2 focus:ring-[#5cbdb9]/20 transition-all outline-none"
              />
            ))}
          </div>

          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
              <i className="fas fa-lock text-[#5cbdb9] text-[10px]"></i>
            </div>
            <input
              type="password"
              placeholder="Enter New Password"
              className="w-full pl-16 pr-6 py-5 bg-[#F9FBFC] border-none rounded-[1.5rem] text-sm font-bold text-slate-600 focus:ring-2 focus:ring-[#5cbdb9]/20 outline-none transition-all"
              value={newPassword}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
          </div>

          <div className="bg-slate-50 p-5 rounded-3xl grid grid-cols-2 gap-2 border border-slate-100">
            <PasswordRule met={passwordRules.length} text="8+ Char" />
            <PasswordRule met={passwordRules.upper} text="Uppercase" />
            <PasswordRule met={passwordRules.lower} text="Lowercase" />
            <PasswordRule met={passwordRules.number} text="Number" />
            <PasswordRule met={passwordRules.special} text="Special" />
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className="w-full bg-[#5cbdb9] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[#5cbdb9]/20 hover:bg-[#4aa8a4] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : "UPDATE PASSWORD"}
          </button>
        </form>
      </div>
    </div>
  );
};

const PasswordRule = ({ met, text }) => (
  <div className={`flex items-center gap-2 ${met ? 'text-green-500' : 'text-slate-300'}`}>
    <i className={`fas ${met ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
    <span className="text-[10px] font-bold uppercase tracking-widest">{text}</span>
  </div>
);

export default ResetPassword;