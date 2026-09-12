import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  ArrowLeft, 
  Search, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  UserX, 
  CheckCircle, 
  Clock, 
  ShieldAlert,
  GraduationCap
} from "lucide-react";
import api from "../services/api";
import ThemeToggle from "../components/common/ThemeToggle";

/* ================= ONLY REQUIRED FIX ================= */
// ✅ Attach admin token to every request
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
    student.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const verifiedCount = students.filter(s => s.isVerified).length;
  const blockedCount = students.filter(s => s.isBlocked).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP CONTROLS & HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate("/admin/dashboard")} 
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl hover:bg-teal-500 hover:text-white dark:hover:bg-teal-600 dark:hover:text-white transition-all shadow-sm border border-slate-200 dark:border-slate-800 uppercase tracking-widest"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </button>
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <Users size={24} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Student Directory
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  View, search, and manage registered student accounts & security credentials
                </p>
              </div>
            </div>
          </div>

          {/* QUICK METRICS */}
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 shadow-sm text-center">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Enrolled</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{students.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 shadow-sm text-center">
              <p className="text-[10px] uppercase font-bold tracking-wider text-teal-600 dark:text-teal-400">Verified</p>
              <p className="text-xl font-black text-teal-600 dark:text-teal-400">{verifiedCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 shadow-sm text-center">
              <p className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400">Blocked</p>
              <p className="text-xl font-black text-rose-600 dark:text-rose-400">{blockedCount}</p>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <Search size={18} className="text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            placeholder="Search student by email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {search && (
            <button 
              onClick={() => setSearch("")} 
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

        {/* STUDENTS TABLE */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium">
              <div className="animate-spin w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full mx-auto mb-3"></div>
              Loading student directory...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-rose-500 font-medium">
              {error}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-16 text-center text-slate-400 font-medium">
              <Users size={48} className="mx-auto mb-3 opacity-30" />
              No matching student records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Student Account</th>
                    <th className="px-6 py-4">Domain / Course</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4">Last Activity</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {paginatedStudents.map((student) => (
                    <tr key={student._id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {student.email ? student.email[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">
                              {student.firstName ? `${student.firstName} ${student.surName || ''}`.trim() : (student.email?.split("@")[0] || "Student")}
                            </p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {student.course || "General Candidate"}
                      </td>

                      <td className="px-6 py-4">
                        {student.isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30">
                            <ShieldAlert size={11} /> Blocked
                          </span>
                        ) : student.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-900/30">
                            <ShieldCheck size={11} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30">
                            <Clock size={11} /> Pending
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {student.lastLoginAt ? new Date(student.lastLoginAt).toLocaleDateString() : "Never"}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {student.isBlocked ? (
                            <button
                              onClick={() => unblockStudent(student._id)}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 hover:bg-teal-600 hover:text-white transition-all shadow-sm"
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => blockStudent(student._id)}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                            >
                              Block
                            </button>
                          )}

                          <button
                            onClick={() => setShowDeleteConfirm(student._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                            title="Delete Student Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-2">
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                  currentPage === i + 1 
                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 transition-all animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 text-center animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                Confirm Record Deletion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed px-4">
                Are you sure you want to permanently delete this student account? This will revoke all active credentials and sessions.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => handleDeleteStudent(showDeleteConfirm)}
                  className="py-3 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-all uppercase tracking-wider disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Students;