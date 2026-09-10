import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from "../services/api";
import { ROUTES } from "../routes/routes";

const Login = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "", surName: "", mobile: "", education: "", email: "", password: ""
  });

  const [passwordRules, setPasswordRules] = useState({
    upper: false, lower: false, number: false, special: false, length: false
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'signup') setIsLoginView(false);
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordRules({
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[@$!%*?&]/.test(value),
        length: value.length >= 8
      });
    }
  };

  const isPasswordValid = Object.values(passwordRules).every(Boolean);

  // ================= LOGIN LOGIC =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email || !password) {
      alert("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/login-password", { email, password });

      // ✅ 1. OTP REDIRECTION
      if (response.data?.requireOtp === true) {
        navigate(ROUTES.VERIFY_OTP, { 
          state: { 
            email, 
            mode: "login",
            firstName: response.data.user?.firstName,
            surName: response.data.user?.surName
          } 
        });
        return;
      }

      // ✅ 2. SUCCESSFUL LOGIN & STORAGE (CRASH-PROOF)
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        
        // 🔥 ULTIMATE FIX: Print to console so we can see what the backend actually sends
        console.log("BACKEND LOGIN RESPONSE:", response.data);
        
        // Catch the user object no matter what the backend named it
        const userData = response.data.user || response.data.userData || response.data.student || response.data;

        // Ensure the ID actually exists before saving it to localStorage
        if (userData && (userData._id || userData.id)) {
          localStorage.setItem("user", JSON.stringify(userData));
          
          const fullName = userData.name || (userData.firstName ? `${userData.firstName} ${userData.surName}` : "Student User");
          localStorage.setItem("userName", fullName);
          localStorage.setItem("userEmail", userData.email || email);
          
          navigate(response.data.role === "admin" ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD);
        } else {
          alert("Login successful, but your server didn't send a valid User ID! Check the console.");
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    const { firstName, surName, mobile, education, email, password } = form;

    if (!firstName || !surName || !mobile || !education || !email || !password) {
      alert("All fields are mandatory.");
      return;
    }
    if (!isPasswordValid) {
      alert("Password must meet all security requirements.");
      return;
    }

    navigate(ROUTES.VERIFY_OTP, {
      state: { 
        firstName, surName, mobile, education, 
        email: email.trim().toLowerCase(), 
        password,
        mode: "signup" 
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-6 font-sans">
      <div className={`bg-white rounded-[2.5rem] shadow-2xl w-full ${isLoginView ? 'max-w-md' : 'max-w-2xl'} p-10 border border-slate-100 transition-all duration-500`}>
        
        <Link to={ROUTES.HOME} className="inline-flex items-center text-slate-400 hover:text-[#5cbdb9] mb-6 transition-all text-xs font-bold uppercase tracking-widest">
          <i className="fas fa-arrow-left mr-2"></i> Back to Home
        </Link>

        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#5cbdb9]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className={`fas ${isLoginView ? 'fa-lock' : 'fa-user-plus'} text-[#5cbdb9] text-2xl`}></i>
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                {isLoginView ? 'Welcome Back' : 'Join SkillPredictor'}
            </h2>
            <p className="text-slate-400 text-sm mt-2 font-medium">
                {isLoginView ? 'Log in to your account' : 'Create your account to start your professional journey'}
            </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <button type="button" onClick={() => setIsLoginView(false)} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${!isLoginView ? 'bg-white text-[#5cbdb9] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Sign Up</button>
          <button type="button" onClick={() => setIsLoginView(true)} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${isLoginView ? 'bg-white text-[#5cbdb9] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Log In</button>
        </div>

        <form onSubmit={isLoginView ? handleLogin : (e) => e.preventDefault()} className="space-y-5">
          {!isLoginView && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                <input name="firstName" placeholder="First Name" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#5cbdb9]/20 outline-none transition-all" onChange={handleChange} />
              </div>
              <div className="relative">
                <i className="fas fa-signature absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                <input name="surName" placeholder="Surname" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#5cbdb9]/20 outline-none transition-all" onChange={handleChange} />
              </div>
              <div className="relative">
                <i className="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                <input name="mobile" placeholder="Mobile Number" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#5cbdb9]/20 outline-none transition-all" onChange={handleChange} />
              </div>
              <div className="relative">
                <i className="fas fa-university absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
                <select name="education" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#5cbdb9]/20 outline-none appearance-none transition-all" onChange={handleChange}>
                  <option value="">Select Education</option>
                  <option value="B.Tech">B.Tech</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="B.Sc">B.Sc</option>
                </select>
              </div>
            </div>
          )}

          <div className="relative">
            <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
            <input name="email" type="email" placeholder="Email Address" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#5cbdb9]/20 outline-none transition-all" onChange={handleChange} />
          </div>

          <div className="relative">
            <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs"></i>
            <input name="password" type="password" placeholder="Password" className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#5cbdb9]/20 outline-none transition-all" onChange={handleChange} />
          </div>

          {!isLoginView && (
            <div className="bg-slate-50 p-4 rounded-2xl grid grid-cols-2 gap-2 border border-slate-100">
                <p className="col-span-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Security Checklist</p>
                <PasswordRule met={passwordRules.length} text="8+ Characters" />
                <PasswordRule met={passwordRules.upper} text="Uppercase" />
                <PasswordRule met={passwordRules.lower} text="Lowercase" />
                <PasswordRule met={passwordRules.number} text="Number" />
                <PasswordRule met={passwordRules.special} text="Special Char" />
            </div>
          )}

          {isLoginView && (
            <div className="text-right">
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs font-bold text-[#5cbdb9] hover:underline uppercase tracking-tighter">Forgot Password?</Link>
            </div>
          )}

          <button
            type={isLoginView ? "submit" : "button"}
            onClick={!isLoginView ? handleSignup : undefined}
            disabled={(!isLoginView && !isPasswordValid) || loading}
            className="w-full bg-[#5cbdb9] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-[#5cbdb9]/20 hover:bg-[#4aa8a4] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : (isLoginView ? 'Secure Log In' : 'Create Profile')}
          </button>
        </form>
      </div>
    </div>
  );
};

const PasswordRule = ({ met, text }) => (
    <div className={`flex items-center gap-2 ${met ? 'text-green-500' : 'text-slate-300'}`}>
        <i className={`fas ${met ? 'fa-check-circle' : 'fa-circle'} text-[10px]`}></i>
        <span className="text-[10px] font-bold">{text}</span>
    </div>
);

export default Login;