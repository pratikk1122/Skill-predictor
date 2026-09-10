import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AdminInterviews = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchInterviewSummary();
  }, []);

  const fetchInterviewSummary = async () => {
    try {
      const res = await api.get("/admin/interviews", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch interview summary");
    }
  };

  const filteredStudents = students.filter((student) =>
    student.name?.toLowerCase().includes(search.toLowerCase()) ||
    student.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getScoreColor = (score) => {
    if (score >= 75) return "bg-teeny-greeny text-blue-greeny";
    if (score >= 50) return "bg-yellow-50 text-yellow-600";
    return "bg-red-50 text-red-500";
  };

  return (
    <div className="p-10 bg-teeny-greeny min-h-screen">

      {/* 🔙 Back Button */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="flex items-center gap-3 px-6 py-3 bg-white border border-blue-greeny/20 text-blue-greeny font-bold rounded-2xl shadow-md hover:bg-teeny-greeny hover:shadow-lg transition-all"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </button>
      </div>

      {/* 🌿 Header */}
      <div className="mb-10">
        <h2 className="text-4xl font-heading font-black text-text-dark">
          AI Interview <span className="text-blue-greeny">Analytics</span>
        </h2>
        <p className="text-text-light mt-2 font-medium text-sm">
          Monitor student interview performance with real-time insights.
        </p>
      </div>

      {/* 🌿 Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-6 py-3 rounded-2xl bg-white border border-blue-greeny/10 focus:ring-2 focus:ring-blue-greeny/30 outline-none transition-all shadow-sm"
        />
      </div>

      {/* 🌿 Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-blue-greeny/5 overflow-hidden">

        <table className="w-full text-left">
          <thead className="bg-teeny-greeny text-[11px] uppercase font-black text-text-dark tracking-widest">
            <tr>
              <th className="px-8 py-6">Student</th>
              <th className="px-8 py-6">Email</th>
              <th className="px-8 py-6">Total</th>
              <th className="px-8 py-6">Average</th>
              <th className="px-8 py-6">Latest</th>
              <th className="px-8 py-6 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-blue-greeny/5 text-sm">

            {filteredStudents.map((student) => (
              <tr
                key={student.studentId}
                className="hover:bg-teeny-greeny/40 transition-all duration-200"
              >
                <td className="px-8 py-6 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-greeny rounded-full flex items-center justify-center text-white font-black shadow-md">
                    {student.name?.charAt(0)?.toUpperCase() || "N"}
                  </div>
                  <div>
                    <p className="font-black text-text-dark">
                      {student.name || "N/A"}
                    </p>
                    <p className="text-xs text-text-light">
                      ID: {student.studentId}
                    </p>
                  </div>
                </td>

                <td className="px-8 py-6 text-text-light font-medium">
                  {student.email}
                </td>

                <td className="px-8 py-6 font-bold text-text-dark">
                  {student.totalInterviews}
                </td>

                <td className="px-8 py-6">
                  <span className={`px-4 py-1 rounded-full text-xs font-black ${getScoreColor(student.avgScore)}`}>
                    {student.avgScore}%
                  </span>

                  <div className="w-full bg-teeny-greeny rounded-full h-2 mt-3">
                    <div
                      className="h-2 rounded-full bg-blue-greeny"
                      style={{ width: `${student.avgScore}%` }}
                    ></div>
                  </div>
                </td>

                <td className="px-8 py-6 font-bold text-text-dark">
                  {student.latestScore}%
                </td>

                <td className="px-8 py-6 text-center">
                  <button
                    onClick={() =>
                      navigate(`/admin/interviews/${student.studentId}`)
                    }
                    className="bg-blue-greeny hover:bg-blue-greeny-dark text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-md transition-all"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}

            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-12 text-text-light italic">
                  No Interview Data Available
                </td>
              </tr>
            )}

          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminInterviews;
