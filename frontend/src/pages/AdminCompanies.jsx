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
    <div className="p-4 md:p-8 bg-teeny-greeny min-h-screen font-sans text-text-dark">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-4">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-blue-greeny/10 rounded-lg text-[12px] font-bold text-text-light hover:text-blue-greeny hover:border-blue-greeny/30 transition-all shadow-sm"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              BACK TO DASHBOARD
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-greeny rounded-2xl flex items-center justify-center shadow-lg shadow-blue-greeny/20 rotate-3 transition-transform hover:rotate-0 cursor-default">
                <Building2 className="text-white" size={28} />
              </div>
              <div>
                {/* ✅ REMOVED 'italic' - FONT IS NOW STRAIGHT */}
                <h1 className="text-3xl font-heading font-black text-text-dark tracking-tight">
                  Company <span className="text-blue-greeny">Forge</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-greeny animate-pulse"></span>
                  <p className="text-[11px] font-black text-text-light uppercase tracking-[0.2em]">
                    Active Partners: {companies.filter(c => c.status === "Active").length} / {companies.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-text-dark text-white px-8 py-4 rounded-2xl font-black text-sm hover:bg-blue-greeny hover:shadow-xl hover:shadow-blue-greeny/20 transition-all active:scale-95 uppercase tracking-widest"
          >
            <Plus size={18} strokeWidth={3} /> ADD PARTNER
          </button>
        </div>

        {/* SEARCH */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-blue-greeny transition-colors"
            />
            <input
              type="text"
              placeholder="Search by company name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl border-none bg-white shadow-sm ring-1 ring-blue-greeny/5 focus:ring-2 focus:ring-blue-greeny/20 text-sm transition-all outline-none font-medium"
            />
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-blue-greeny/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-teeny-greeny/30 text-text-light text-[10px] font-black uppercase tracking-[0.15em]">
                  <th className="px-10 py-6">Company Entity</th>
                  <th className="px-10 py-6">Digital Presence</th>
                  <th className="px-10 py-6 text-center">Engagement Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-teeny-greeny/20">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="3" className="px-10 py-8"><div className="h-4 bg-teeny-greeny rounded-full w-full"></div></td>
                    </tr>
                  ))
                ) : filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-24 text-text-light opacity-30 font-bold uppercase tracking-widest text-xs">
                      <Building size={64} className="mx-auto mb-4" />
                      No partners registered
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                    <tr key={company._id} className="group hover:bg-teeny-greeny/10 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-greeny/10 flex items-center justify-center border border-blue-greeny/20 overflow-hidden transition-all shadow-sm group-hover:shadow-md">
                            {company.logo && !imageErrors[company._id] ? (
                              <img 
                                src={company.logo} 
                                alt={company.name} 
                                className="w-full h-full object-contain p-2"
                                onError={() => setImageErrors(prev => ({ ...prev, [company._id]: true }))}
                              />
                            ) : (
                              <span className="text-blue-greeny font-black text-sm tracking-tighter uppercase">
                                {getInitials(company.name)}
                              </span>
                            )}
                          </div>
                          <div>
                            {/* ✅ REMOVED 'italic' - FONT IS NOW STRAIGHT */}
                            <p className="font-heading font-black text-text-dark text-base leading-tight uppercase tracking-tight">{company.name}</p>
                            <span className="text-[10px] text-text-light font-bold uppercase tracking-widest">Global Partner</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-10 py-6">
                        <a
                          href={`https://${company.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-text-light hover:text-blue-greeny font-bold text-sm transition-colors group/link"
                        >
                          <Globe size={16} className="text-text-light/40 group-hover/link:text-blue-greeny" />
                          {company.website || "not-available.io"}
                          <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </a>
                      </td>

                      <td className="px-10 py-6 text-center">
                        <button
                          onClick={() => setStatusAlert({ show: true, companyId: company._id, currentStatus: company.status, isUpdating: false })}
                          className={`relative inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all overflow-hidden ${
                            company.status === "Active"
                              ? "bg-blue-greeny/10 text-blue-greeny hover:bg-blue-greeny/20"
                              : "bg-text-dark/5 text-text-light hover:bg-text-dark/10"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${company.status === "Active" ? "bg-blue-greeny animate-pulse" : "bg-text-light/40"}`}></span>
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
          <div className="absolute inset-0 bg-text-dark/60 backdrop-blur-sm"></div>
          <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200 border border-blue-greeny/5">
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${statusAlert.currentStatus === "Active" ? "bg-orange-50 text-orange-500" : "bg-blue-greeny/10 text-blue-greeny"}`}>
              <AlertTriangle size={32} />
            </div>
            {/* ✅ REMOVED 'italic' - FONT IS NOW STRAIGHT */}
            <h3 className="text-xl font-heading font-black text-text-dark mb-2 uppercase tracking-tight">Confirm Update</h3>
            <p className="text-sm text-text-light font-bold leading-relaxed mb-8">
              Update partner status to <span className="text-text-dark font-black">{statusAlert.currentStatus === "Active" ? "INACTIVE" : "ACTIVE"}</span>?
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setStatusAlert({ show: false, companyId: null, currentStatus: "", isUpdating: false })}
                className="py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-text-light hover:bg-teeny-greeny transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmStatusChange}
                disabled={statusAlert.isUpdating}
                className={`py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all flex items-center justify-center gap-2 ${statusAlert.currentStatus === "Active" ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20" : "bg-blue-greeny hover:bg-blue-greeny-dark shadow-blue-greeny/20"}`}
              >
                {statusAlert.isUpdating ? <Loader2 className="animate-spin" size={16} /> : "YES, UPDATE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-text-dark/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-blue-greeny/5">
            <div className="flex justify-between items-center mb-8">
              <div>
                {/* ✅ REMOVED 'italic' - FONT IS NOW STRAIGHT */}
                <h2 className="text-2xl font-heading font-black text-text-dark uppercase">Add Partner</h2>
                <p className="text-xs text-text-light font-bold uppercase mt-1 tracking-widest">Ecosystem Integration</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-teeny-greeny flex items-center justify-center text-text-light hover:bg-orange-50 hover:text-orange-500 transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={addCompany} className="space-y-6">
              <input
                type="text"
                placeholder="Company Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-teeny-greeny/30 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-greeny/20 font-bold text-sm outline-none text-text-dark"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Logo URL (Optional)"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full bg-teeny-greeny/30 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-greeny/20 font-bold text-sm outline-none text-text-dark"
                />
                <input
                  type="text"
                  placeholder="Website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-teeny-greeny/30 border-none rounded-2xl p-4 focus:ring-2 focus:ring-blue-greeny/20 font-bold text-sm outline-none text-text-dark"
                />
              </div>
              <button type="submit" className="w-full bg-text-dark text-white py-5 rounded-2xl font-black text-sm hover:bg-blue-greeny shadow-xl shadow-blue-greeny/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
                <ShieldCheck size={20} /> INITIALIZE PARTNERSHIP
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCompanies;