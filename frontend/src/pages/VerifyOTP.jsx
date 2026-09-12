import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { ROUTES } from "../routes/routes";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Location state se signup/login ka data nikalna
  const { email, password, mode, firstName, surName, mobile, otpSent } = location.state || {};
  const [emailValue, setEmailValue] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerData, setDisclaimerData] = useState({ role: "", message: "" });

  const inputRefs = useRef([]);

  const autoSentRef = useRef(false);

  const handleSendOtp = async (targetEmail) => {
    const toEmail = targetEmail || emailValue || email;
    if (!toEmail) return;
    setMessage("");

    try {
      setOtpLoading(true);
      const res = await api.post("/auth/send-otp", { email: toEmail.toLowerCase() });
      setTimer(30);
      setMessage("Success: Verification code sent strictly to your email inbox.");
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes("wait")) setTimer(30);
      setMessage(msg || "Error: Failed to send verification code. Please check your email address.");
    } finally {
      setOtpLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      const normalized = email.toLowerCase();
      setEmailValue(normalized);
      if (!autoSentRef.current) {
        autoSentRef.current = true;
        if (otpSent) {
          // Code already sent via loginWithPassword
          setTimer(30);
          setMessage("Success: Verification code sent strictly to your email inbox.");
        } else {
          handleSendOtp(normalized);
        }
      }
    } else {
      navigate(ROUTES.LOGIN);
    }
  }, [email, navigate, otpSent]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (!pastedData) return;
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length < 6) {
      setMessage("Error: Enter 6-digit code.");
      return;
    }

    try {
      setLoading(true);
      const payload = { 
        email: emailValue, otp: finalOtp,
        password, firstName, surName, mobile 
      };

      const res = await api.post("/auth/verify-otp", payload);
      
      // ✅ 1. SAVE CRITICAL AUTH DATA
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      const userData = res.data.user || {};
      if (userData._id || userData.id) {
        localStorage.setItem("user", JSON.stringify(userData));
      }

      // ✅ 2. ENHANCED NAME VERIFICATION LOGIC
      let fullName = "";

      // Pehle backend ke alag-alag name formats check karna
      if (res.data.user?.firstName && res.data.user?.surName) {
        fullName = `${res.data.user.firstName} ${res.data.user.surName}`;
      } else if (res.data.user?.name) {
        fullName = res.data.user.name;
      } 
      // Agar backend nahi bhej raha, toh Signup state use karna
      else if (firstName && surName) {
        fullName = `${firstName} ${surName}`;
      } 
      // Last fallback: Email se name nikalna (e.g. rahul123@gmail.com -> Rahul123)
      else {
        const emailPrefix = emailValue.split('@')[0];
        fullName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
      }

      localStorage.setItem("userName", fullName);
      localStorage.setItem("userEmail", res.data.user?.email || emailValue);

      // Disclaimer check
      if (res.data.showTrustDisclaimer) {
        setDisclaimerData({
          role: res.data.role,
          message: res.data.disclaimer
        });
        setShowDisclaimer(true);
      } else {
        finalizeNavigation(res.data.role);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Error: Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const finalizeNavigation = (role) => {
    if (role === "admin") navigate(ROUTES.ADMIN_DASHBOARD);
    else navigate(ROUTES.STUDENT_DASHBOARD);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6 font-sans">
      
      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-sm p-10 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-[#5cbdb9]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#5cbdb9]/20 shadow-inner">
              <i className="fas fa-user-shield text-[#5cbdb9] text-5xl"></i>
            </div>
            <h3 className="text-2xl font-black text-[#1e293b] mb-3 tracking-tight">Login Secured</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-8 font-medium">
              {disclaimerData.message || "You can log in without OTP for the next 7 days unless you logout."}
            </p>
            <button
              onClick={() => finalizeNavigation(disclaimerData.role)}
              className="w-full bg-[#5cbdb9] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-[#5cbdb9]/20 hover:bg-[#4aa8a4] transition-all active:scale-95"
            >
              UNDERSTAND & CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* Main OTP Verification UI */}
      <div className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-md p-12 relative border border-slate-50">
        <div className="text-center mb-10">
          <Link to={ROUTES.LOGIN} className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-[#5cbdb9] transition-all uppercase tracking-[0.2em] mb-8">
            <i className="fas fa-arrow-left mr-2"></i> BACK
          </Link>
          <div className="w-16 h-16 bg-[#5cbdb9]/5 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#5cbdb9]/10">
            <i className="fas fa-envelope-open-text text-[#5cbdb9] text-2xl"></i>
          </div>
          <h2 className="text-3xl font-black text-[#1e293b] tracking-tight mb-2">Verify Email</h2>
          <p className="text-slate-400 text-sm font-medium tracking-tight">Enter the 6-digit code sent to your inbox</p>
        </div>

        <div className="relative mb-8 group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
             <i className="fas fa-at text-[#5cbdb9] text-[10px]"></i>
          </div>
          <input
            type="email" readOnly value={emailValue}
            className="w-full pl-16 pr-6 py-5 bg-[#F9FBFC] border-none rounded-[1.5rem] text-sm font-bold text-slate-500 cursor-not-allowed outline-none"
          />
        </div>

        <div className="flex justify-between gap-2 mb-8">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength="1"
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleOtpChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-full h-14 bg-[#F9FBFC] border border-slate-100 rounded-2xl text-center text-xl font-black text-[#1e293b] focus:border-[#5cbdb9] focus:ring-2 focus:ring-[#5cbdb9]/20 transition-all outline-none"
            />
          ))}
        </div>

        <div className="space-y-4">
          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.join("").length < 6}
            className="w-full bg-[#5cbdb9] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-xs shadow-xl shadow-[#5cbdb9]/20 hover:bg-[#4aa8a4] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : "VERIFY & CONTINUE"}
          </button>

          <button
            onClick={() => handleSendOtp()}
            disabled={timer > 0 || otpLoading}
            className="w-full py-4 rounded-[1.5rem] text-[10px] font-black text-[#5cbdb9] uppercase tracking-[0.2em] hover:bg-[#5cbdb9]/5 transition-all disabled:text-slate-300"
          >
            {timer > 0 ? `RESEND CODE IN ${timer}S` : (otpLoading ? "SENDING..." : "SEND OTP")}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-4">
          💡 Didn't find it in Inbox? Check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
        </p>

        {message && (
          <div className={`mt-8 p-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest ${
            message.includes("Success") ? 'bg-green-50 text-green-500 border border-green-100' : 'bg-red-50 text-red-500 border border-red-100'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyOTP;