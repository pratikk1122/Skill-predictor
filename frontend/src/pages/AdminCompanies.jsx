import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  Search,
  X,
  Globe,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Building,
  AlertTriangle,
  Loader2
} from "lucide-react";

import api from "../services/api";

import ThemeToggle from "../components/common/ThemeToggle";

const AdminCompanies = () => {
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Track images that fail to load
  const [imageErrors, setImageErrors] = useState({});

  const [statusAlert, setStatusAlert] = useState({ 
    show: false, 
    companyId: null, 
    currentStatus: "", 
    isUpdating: false 
  });

  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    website: ""
  });

  // ✅ HELPER: Generate Initials
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/companies");
      setCompanies(res.data);
    } catch (err) {
      console.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const addCompany = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name) return alert("Company name is required");

    try {
      const res = await api.post("/admin/companies", formData);
      setIsModalOpen(false);
      setFormData({ name: "", logo: "", website: "" });
      fetchCompanies();
    } catch (err) {
      alert("Company already exists or Server Error");
    }
  };

  const handleConfirmStatusChange = async () => {
    const { companyId, currentStatus } = statusAlert;
    try {
      setStatusAlert(prev => ({ ...prev, isUpdating: true }));
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      
      await api.patch(`/admin/companies/${companyId}/status`, {
        status: newStatus
      });

      setStatusAlert({ show: false, companyId: null, currentStatus: "", isUpdating: false });
      fetchCompanies();
    } catch (err) {
      alert("Failed to update status");
      setStatusAlert(prev => ({ ...prev, isUpdating: false }));
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/dashboard")}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl hover:bg-teal-500 hover:text-white dark:hover:bg-teal-600 dark:hover:text-white transition-all shadow-sm border border-slate-200 dark:border-slate-800 uppercase tracking-widest"
              >
                <ArrowLeft size={14} /> BACK TO DASHBOARD
              </button>
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <Building2 size={24} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Company Directory & Partners
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Active Hiring Partners: {companies.filter(c => c.status === "Active").length} of {companies.length} total
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-teal-600/20 transition-all active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Add Partner Company
          </button>
        </div>

        {/* SEARCH */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <Search size={18} className="text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            placeholder="Search company by name..."
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

        {/* TABLE SECTION */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Company Entity</th>
                  <th className="px-6 py-4">Digital Presence</th>
                  <th className="px-6 py-4 text-center">Engagement Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="3" className="px-6 py-6"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div></td>
                    </tr>
                  ))
                ) : filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-20 text-slate-400 font-medium">
                      <Building size={48} className="mx-auto mb-3 opacity-30" />
                      No partner companies found.
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                    <tr key={company._id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center border border-teal-500/20 overflow-hidden shadow-sm shrink-0">
                            {company.logo && !imageErrors[company._id] ? (
                              <img 
                                src={company.logo} 
                                alt={company.name} 
                                className="w-full h-full object-contain p-2"
                                onError={() => setImageErrors(prev => ({ ...prev, [company._id]: true }))}
                              />
                            ) : (
                              <span className="text-teal-600 dark:text-teal-400 font-black text-sm uppercase">
                                {getInitials(company.name)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">{company.name}</p>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Employer</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <a
                          href={company.website?.startsWith("http") ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-semibold text-xs transition-colors group/link"
                        >
                          <Globe size={14} className="text-slate-400 group-hover/link:text-teal-500" />
                          {company.website || "not-available.io"}
                          <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setStatusAlert({ show: true, companyId: company._id, currentStatus: company.status, isUpdating: false })}
                          className={`relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                            company.status === "Active"
                              ? "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400 border border-teal-200 dark:border-teal-900/30 hover:bg-teal-100"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${company.status === "Active" ? "bg-teal-500 animate-pulse" : "bg-slate-400"}`}></span>
                          {company.status}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* STATUS ALERT MODAL */}
      {statusAlert.show && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setStatusAlert({ show: false, companyId: null, currentStatus: "", isUpdating: false })}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-6 ${statusAlert.currentStatus === "Active" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-500" : "bg-teal-50 dark:bg-teal-500/10 text-teal-600"}`}>
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Confirm Status Change</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">
              Toggle partner status to <span className="text-slate-900 dark:text-white font-bold">{statusAlert.currentStatus === "Active" ? "INACTIVE" : "ACTIVE"}</span>?
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setStatusAlert({ show: false, companyId: null, currentStatus: "", isUpdating: false })}
                className="py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmStatusChange}
                disabled={statusAlert.isUpdating}
                className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 ${statusAlert.currentStatus === "Active" ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-teal-600 hover:bg-teal-700 shadow-teal-600/20"}`}
              >
                {statusAlert.isUpdating ? <Loader2 className="animate-spin" size={16} /> : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Add Partner Company</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Integrate verified recruiter or enterprise employer</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={addCompany} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Google, Microsoft, Infosys"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Logo Image URL</label>
                  <input
                    type="text"
                    placeholder="https://.../logo.png"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Official Website</label>
                  <input
                    type="text"
                    placeholder="company.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-teal-600 hover:bg-teal-500 text-white py-3.5 rounded-xl font-bold text-xs shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider">
                  <ShieldCheck size={18} /> Register Partner Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;