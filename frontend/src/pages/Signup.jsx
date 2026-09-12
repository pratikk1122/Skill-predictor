import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes/routes";

const Signup = () => {
  const navigate = useNavigate();

  // 🔄 If user is already logged in, redirect them directly to their dashboard
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token) {
      navigate(role === "admin" ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD, { replace: true });
    }
  }, [navigate]);

  const [form, setForm] = useState({
    firstName: "",
    surName: "",
    mobile: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // 🔥 BUTTON HANDLER (NO FORM SUBMIT ISSUES)
  const handleSubmit = () => {
    console.log("🔥 CREATE ACCOUNT CLICKED");

    const { firstName, surName, mobile, email, password } = form;

    if (!firstName || !surName || !mobile || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      setError("Mobile number must be 10 digits");
      return;
    }

    setLoading(true);

    navigate(ROUTES.VERIFY_OTP, {
      state: {
        firstName: firstName.trim(),
        surName: surName.trim(),
        mobile: mobile.trim(),
        email: email.trim().toLowerCase(),
        password,
        mode: "signup"
      }
    });

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-teeny-greeny p-4">
      {/* ✅ z-50 + relative ensures clicks work */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-8 relative z-50 pointer-events-auto">

        <Link to="/" className="text-sm text-gray-500">
          ← Back to Home
        </Link>

        <h2 className="text-2xl font-bold text-center mt-4">
          Create Your Profile
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Fill your details to create an account
        </p>

        {error && (
          <p className="text-center text-red-500 mb-4">{error}</p>
        )}

        {/* ❌ NO onSubmit (browser validation removed) */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              id="signup-firstName"
              name="firstName"
              value={form.firstName}
              autoComplete="given-name"
              placeholder="First Name"
              className="input"
              onChange={handleChange}
            />
            <input
              id="signup-surName"
              name="surName"
              value={form.surName}
              autoComplete="family-name"
              placeholder="Surname"
              className="input"
              onChange={handleChange}
            />
          </div>

          <input
            id="signup-mobile"
            name="mobile"
            type="tel"
            value={form.mobile}
            autoComplete="tel"
            placeholder="Mobile Number"
            className="input"
            onChange={handleChange}
          />

          <input
            id="signup-email"
            name="email"
            type="email"
            value={form.email}
            autoComplete="username email"
            placeholder="Email Address"
            className="input"
            onChange={handleChange}
          />

          <input
            id="signup-password"
            name="password"
            type="password"
            value={form.password}
            autoComplete="new-password"
            placeholder="Password"
            className="input"
            onChange={handleChange}
          />

          {/* ✅ BUTTON CONTROLS EVERYTHING */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-greeny text-white py-3 rounded-xl font-bold disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </div>

        <p className="text-center text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-greeny font-bold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
