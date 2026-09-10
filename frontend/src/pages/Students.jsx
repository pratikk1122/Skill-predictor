import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

/* ================= ONLY REQUIRED FIX ================= */
// ✅ Attach admin token to every request (NO OTHER CHANGE)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
/* ================= END FIX ================= */

const ITEMS_PER_PAGE = 10;

const Students = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/students");
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const blockStudent = async (id) => {
    if (!window.confirm("Block this student?")) return;
    try {
      await api.patch(`/admin/students/${id}/block`);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to block student");
    }
  };

  const unblockStudent = async (id) => {
    if (!window.confirm("Unblock this student?")) return;
    try {
      await api.patch(`/admin/students/${id}/unblock`);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to unblock student");
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      setActionLoading(true);
      await api.delete(`/admin/students/${id}`);
      fetchStudents();
      setShowDeleteConfirm(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete student");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    /* ✅ Background changed to teeny-greeny and font consistency */
    <div className="min-h-screen bg-teeny-greeny p-8 font-sans text-text-dark">
      {/* ✅ LATEST HEADER DESIGN - Matched with Admin Dashboard style */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-heading font-black text-text-dark uppercase tracking-tight">Student Management</h2>
          <p className="text-xs text-text-light font-bold uppercase tracking-[0.2em] mt-1">View, search, and manage all registered student accounts</p>
        </div>
        <button 
          onClick={() => navigate("/admin/dashboard")} 
          className="text-xs font-black text-blue-greeny bg-white px-6 py-2.5 rounded-xl hover:bg-blue-greeny hover:text-white transition-all shadow-sm border border-blue-greeny/10 uppercase tracking-widest"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
        </button>
      </div>

      {/* ✅ SEARCH BAR DESIGN - Matched with Dashboard / Helpdesk */}
      <div className="bg-white p-5 rounded-2xl border border-blue-greeny/10 shadow-sm mb-6">
        <div className="relative">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-text-light"></i>
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-96 pl-12 pr-6 py-3.5 bg-teeny-greeny border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-greeny/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* ✅ TABLE SECTION - Modern 2.5rem rounded corners */}
      <div className="bg-white rounded-[2.5rem] border border-blue-greeny/5 shadow-xl overflow-hidden">
        {!loading && !error && (
          <>
            <table className="w-full text-left border-collapse">
              <thead className="bg-teeny-greeny text-[10px] uppercase font-black text-text-dark tracking-[0.2em] border-b border-blue-greeny/10">
                <tr>
                  <th className="px-6 py-6">Email</th>
                  <th className="px-6 py-6">Course</th>
                  <th className="px-6 py-6">Status</th>
                  <th className="px-6 py-6">Joined</th>
                  <th className="px-6 py-6">Last Login</th>
                  <th className="px-6 py-6 text-center">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-blue-greeny/5 text-sm">
                {paginatedStudents.map((student) => (
                  <tr key={student._id} className="group hover:bg-teeny-greeny/30 transition-colors">
                    <td className="px-6 py-5 font-black text-text-dark">
                      {student.email}
                    </td>

                    <td className="px-6 py-5 text-text-light font-bold">
                      {student.course || "—"}
                    </td>

                    <td className="px-6 py-5">
                      {student.isBlocked ? (
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-500 border border-red-100">
                          Blocked
                        </span>
                      ) : student.isVerified ? (
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-greeny/10 text-blue-greeny border border-blue-greeny/20">
                          Verified
                        </span>
                      ) : (
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-50 text-orange-600 border border-orange-100">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-text-light font-bold text-xs">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-5 text-text-light font-bold text-xs">
                      {student.lastLoginAt
                        ? new Date(student.lastLoginAt).toLocaleString()
                        : "—"}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-4">
                        {student.isBlocked ? (
                          <button
                            onClick={() => unblockStudent(student._id)}
                            className="text-[11px] font-black uppercase tracking-widest px-5 py-2 rounded-xl bg-blue-greeny/10 text-blue-greeny hover:bg-blue-greeny hover:text-white border border-blue-greeny/20 transition-all active:scale-95"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={() => blockStudent(student._id)}
                            className="text-[11px] font-black uppercase tracking-widest px-5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 transition-all active:scale-95"
                          >
                            Block
                          </button>
                        )}

                        <button
                          onClick={() => setShowDeleteConfirm(student._id)}
                          className="opacity-0 group-hover:opacity-100 transition-all text-red-400 hover:text-red-600 p-2"
                        >
                          <i className="fas fa-trash-alt text-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* ✅ PAGINATION - Styled to match theme */}
      {totalPages > 1 && (
         <div className="mt-8 flex justify-center gap-3">
            {[...Array(totalPages)].map((_, i) => (
                <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${
                        currentPage === i + 1 
                        ? 'bg-blue-greeny text-white shadow-lg shadow-blue-greeny/20' 
                        : 'bg-white text-text-light border border-blue-greeny/10 hover:bg-teeny-greeny'
                    }`}
                >
                    {i + 1}
                </button>
            ))}
         </div>
      )}

      {/* DELETE MODAL - Matched with theme */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-text-dark/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 transition-all">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl border border-blue-greeny/10 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-inner">
                <i className="fas fa-exclamation-triangle text-2xl"></i>
            </div>
            <h3 className="text-2xl font-heading font-black text-text-dark mb-3 uppercase tracking-tight">
              Confirm Deletion
            </h3>
            <p className="text-sm text-text-light font-bold mb-10 leading-relaxed px-4">
              Are you sure you want to permanently remove this student record? This action cannot be undone.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="py-4 rounded-2xl text-xs font-black text-text-light uppercase tracking-widest hover:bg-teeny-greeny transition-all"
              >
                Cancel
              </button>

              <button
                disabled={actionLoading}
                onClick={() => handleDeleteStudent(showDeleteConfirm)}
                className="py-4 rounded-2xl text-xs font-black bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all uppercase tracking-widest disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;