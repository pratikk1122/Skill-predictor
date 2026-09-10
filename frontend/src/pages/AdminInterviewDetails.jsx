import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const AdminInterviewDetails = () => {
  const { studentId } = useParams();
  const token = localStorage.getItem("token");

  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await api.get(`/admin/interviews/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(res.data.data);
    } catch (err) {
      console.error("Failed to fetch interview details");
    }
  };

  const handleDelete = async (sessionId) => {
    const confirmDelete = window.confirm("Delete this interview?");
    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/interviews/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInterviews();
    } catch (err) {
      console.error("Delete failed");
    }
  };

  const handleReset = async (sessionId) => {
    const confirmReset = window.confirm("Reset this interview?");
    if (!confirmReset) return;

    try {
      await api.put(`/admin/interviews/reset/${sessionId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInterviews();
    } catch (err) {
      console.error("Reset failed");
    }
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-[#2d3748]">
        Student Interview History
      </h2>

      {sessions.length === 0 && (
        <div className="text-slate-400 italic">
          No interview sessions found.
        </div>
      )}

      {sessions.map((session) => (
        <div
          key={session._id}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6"
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-slate-400">
                {new Date(session.createdAt).toLocaleString()}
              </p>
              <p className="text-lg font-bold text-teal-600">
                Score: {session.overallScore}%
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleReset(session._id)}
                className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-yellow-200 transition"
              >
                Reset
              </button>

              <button
                onClick={() => handleDelete(session._id)}
                className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-200 transition"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Transcript */}
          <div className="space-y-4">
            {session.transcript.map((item, index) => (
              <div key={index} className="bg-slate-50 p-4 rounded-xl">
                <p className="font-semibold mb-2">
                  Q{index + 1}: {item.question}
                </p>

                <p className="text-sm mb-2">
                  <strong>Answer:</strong> {item.answer || "Not answered"}
                </p>

                {item.feedback && (
                  <div className="text-xs text-slate-600 space-y-1">
                    <p>Technical: {item.feedback.technical_score}</p>
                    <p>Communication: {item.feedback.communication_score}</p>
                    <p>Confidence: {item.feedback.confidence_score}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminInterviewDetails;
