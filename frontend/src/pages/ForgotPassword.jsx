import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0); // ⏳ Timer State
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const [passwordRules, setPasswordRules] = useState({
    upper: false, lower: false, number: false, special: false, length: false
  });

  // ⏳ Timer countdown logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // 1️⃣ Step 1 & Resend: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    if (!email) {
      setMessage("Error: Email is required.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase()
      });

      setStep(2);
      setTimer(30); // ⏳ 30s cooldown
      setMessage(res.data?.message || "Reset verification code sent to your email.");

      if (res.data?.resetCode) {
        const digits = String(res.data.resetCode).split("");
        setOtp(digits);
      }
    } catch (err) {
      const backendMsg = err.response?.data?.message;

      if (backendMsg === "Email not authorized") {
        setMessage("Error: You are not allowed to reset password.");
      } else if (backendMsg === "Email is required") {
        setMessage("Error: Please enter your email address.");
      } else {
        setMessage(backendMsg || "Error: Failed to send OTP.");
      }
    } finally {
      setLoading(false);
    }
  };


  // 2️⃣ Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length < 6) return setMessage("Error: Enter full 6-digit OTP.");
    
    try {
      setLoading(true);
      const response = await api.post("/auth/verify-reset-otp", { 
        email: email.trim().toLowerCase(), 
        otp: finalOtp 
      });
      
      if (response.data.otpVerified) {
        setStep(3);
        setMessage("");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error: Invalid OTP.");
    } finally { setLoading(false); }
  };

  // 3️⃣ Step 3: Final Reset
  const handleReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(), 
        otp: otp.join(""), 
        newPassword
      });
      alert("Success: Password reset successful!");
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error: Reset failed.");
    } finally { setLoading(false); }
  };

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

  const handleOtpInput = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1].focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 font-sans">
      <div className="bg-white rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] w-full max-w-md p-10 relative border border-slate-50">
        
        {/* Dynamic Logo Circle */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#5cbdb9]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#5cbdb9]/20 shadow-inner">
            <i className={`fas ${step === 3 ? 'fa-shield-check' : step === 2 ? 'fa-comment-dots' : 'fa-key-skeleton'} text-[#5cbdb9] text-3xl transition-all duration-500`}></i>
          </div>
          <h2 className="text-3xl font-black text-[#1e293b] tracking-tight mb-2">
            {step === 1 ? "Forgot Password?" : step === 2 ? "Verify Identity" : "Reset Security"}
          </h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Step {step} of 3</p>
        </div>

        {/* Phase 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100"><i className="fas fa-at text-[#5cbdb9] text-[10px]"></i></div>
              <input type="email" placeholder="Email Address" className="w-full pl-16 pr-6 py-5 bg-[#F9FBFC] border-none rounded-[1.5rem] text-sm font-bold text-slate-600 outline-none" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#5cbdb9] text-white py-5 rounded-[1.5rem] font-black uppercase text-xs shadow-xl shadow-[#5cbdb9]/20 hover:bg-[#4aa8a4] transition-all">
               {loading ? <i className="fas fa-circle-notch fa-spin"></i> : "SEND RESET OTP"}
            </button>
          </form>
        )}

        {/* Phase 2: OTP & Resend Timer */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => (
                <input key={index} type="text" maxLength="1" ref={(el) => (inputRefs.current[index] = el)} value={data} 
                  onChange={(e) => handleOtpInput(e.target.value, index)}
                  onKeyDown={(e) => e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index-1].focus()}
                  className="w-full h-12 bg-[#F9FBFC] border-none rounded-xl text-center text-xl font-black text-[#1e293b] focus:ring-2 focus:ring-[#5cbdb9]/20 outline-none transition-all" />
              ))}
            </div>
            <button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-[#5cbdb9] text-white py-5 rounded-[1.5rem] font-black uppercase text-xs shadow-xl hover:bg-[#4aa8a4] transition-all">
               {loading ? <i className="fas fa-circle-notch fa-spin"></i> : "CONFIRM OTP"}
            </button>
            
            {/* ✅ RESEND SECTION */}
            <div className="text-center">
              <button 
                onClick={() => handleSendOtp()} 
                disabled={timer > 0 || loading}
                className={`text-[10px] font-black uppercase tracking-widest transition-all ${timer > 0 ? 'text-slate-300' : 'text-[#5cbdb9] hover:text-[#4aa8a4]'}`}
              >
                {timer > 0 ? `Resend OTP in ${timer}s` : "Didn't get code? Resend Now"}
              </button>
            </div>
          </div>
        )}

        {/* Phase 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleReset} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100"><i className="fas fa-lock text-[#5cbdb9] text-[10px]"></i></div>
              <input type="password" placeholder="New Secure Password" className="w-full pl-16 pr-6 py-5 bg-[#F9FBFC] border-none rounded-[1.5rem] text-sm font-bold text-slate-600 outline-none" value={newPassword} onChange={(e) => handlePasswordChange(e.target.value)} />
            </div>
            <div className="bg-slate-50 p-5 rounded-3xl grid grid-cols-2 gap-2 border border-slate-100">
              <PasswordRule met={passwordRules.length} text="8+ Char" />
              <PasswordRule met={passwordRules.upper} text="Uppercase" />
              <PasswordRule met={passwordRules.lower} text="Lowercase" />
              <PasswordRule met={passwordRules.number} text="Number" />
              <PasswordRule met={passwordRules.special} text="Special" />
            </div>
            <button type="submit" disabled={loading || !Object.values(passwordRules).every(Boolean)} className="w-full bg-[#5cbdb9] text-white py-5 rounded-[1.5rem] font-black uppercase text-xs shadow-xl shadow-[#5cbdb9]/20 hover:bg-[#4aa8a4] transition-all">
               {loading ? <i className="fas fa-circle-notch fa-spin"></i> : "UPDATE PASSWORD"}
            </button>
          </form>
        )}

        {message && <div className={`mt-8 p-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest ${message.includes('Error') ? 'bg-red-50 text-red-400' : 'bg-[#5cbdb9]/10 text-[#5cbdb9]'}`}>{message}</div>}
        
        <div className="text-center mt-8 font-black text-[10px] uppercase tracking-widest">
           <Link to="/login" className="text-slate-400 hover:text-[#5cbdb9]">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

const PasswordRule = ({ met, text }) => (
  <div className={`flex items-center gap-2 transition-colors duration-300 ${met ? 'text-green-500' : 'text-slate-300'}`}>
    <i className={`fas ${met ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
    <span className="text-[10px] font-bold uppercase">{text}</span>
  </div>
);

export default ForgotPassword;