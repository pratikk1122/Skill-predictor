import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    surName: "",
    mobile: "",
    education: "",
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

    const { firstName, surName, mobile, education, email, password } = form;

    if (!firstName || !surName || !mobile || !education || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
      setError("Mobile number must be 10 digits");
      return;
    }

    setLoading(true);

    navigate("/verify-otp", {
      state: {
        email: email.trim().toLowerCase(),
        mobile: mobile.trim()
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
              name="firstName"
              placeholder="First Name"
              className="input"
              onChange={handleChange}
            />
            <input
              name="surName"
              placeholder="Surname"
              className="input"
              onChange={handleChange}
            />
          </div>

          <input
            name="mobile"
            type="tel"
            placeholder="Mobile Number"
            className="input"
            onChange={handleChange}
          />

          <select
            name="education"
            className="input"
            onChange={handleChange}
          >
            <option value="">Education</option>
            <option value="B.Tech">B.Tech</option>
            <option value="BCA">BCA</option>
            <option value="MCA">MCA</option>
          </select>

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            className="input"
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
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
