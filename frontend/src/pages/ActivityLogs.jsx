import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Building2, Search, Clock, ShieldCheck, Activity } from "lucide-react";
import api from "../services/api";

const ActivityLogs = () => {
    const navigate = useNavigate();

    const [logs, setLogs] = useState([]);
    const [activeTab, setActiveTab] = useState("STUDENT");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/logs");
            setLogs(res.data);
        } catch (err) {
            console.error("Failed to fetch logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs
        .filter(log => log.type === activeTab)
        .filter(log =>
            (log.targetEmail?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (log.action?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (log.adminName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (log.details?.toLowerCase() || "").includes(searchTerm.toLowerCase())
        );

    const getActionColor = (action) => {
        if (action.includes("ADD") || action.includes("CREATE"))
            return "bg-teeny-greeny text-blue-greeny border-blue-greeny/20";
        if (action.includes("UPDATE") || action.includes("STATUS"))
            return "bg-blue-greeny/10 text-blue-greeny border-blue-greeny/20";
        if (action.includes("BLOCK") || action.includes("DELETE"))
            return "bg-red-50 text-red-500 border-red-100";
        return "bg-slate-50 text-text-light border-slate-100";
    };

    return (
        <div className="flex h-screen bg-teeny-greeny font-sans text-text-dark">

            {/* SIDEBAR */}
            <aside className="hidden md:flex w-72 bg-white border-r border-blue-greeny/5 flex-col p-8 overflow-y-auto shrink-0">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-blue-greeny rounded-xl flex items-center justify-center shadow-lg rotate-3">
                        <ShieldCheck className="text-white" size={20} />
                    </div>
                    {/* ✅ REMOVED 'italic' - FONT IS NOW STRAIGHT */}
                    <span className="text-xl font-heading font-black text-text-dark tracking-tight">
                        Audit<span className="text-blue-greeny">Trail</span>
                    </span>
                </div>

                <nav className="flex-1 space-y-2">
                    <p className="text-[10px] font-black text-text-light uppercase tracking-[0.2em] mb-4">Categories</p>

                    <button
                        onClick={() => setActiveTab("STUDENT")}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
                            activeTab === "STUDENT"
                                ? "bg-teeny-greeny text-blue-greeny border border-blue-greeny/20 shadow-sm"
                                : "text-text-light hover:bg-teeny-greeny/50"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Users size={16} /> Student Records
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab("COMPANY")}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
                            activeTab === "COMPANY"
                                ? "bg-blue-greeny text-white shadow-lg"
                                : "text-text-light hover:bg-teeny-greeny/50"
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <Building2 size={16} /> Partner Logs
                        </div>
                    </button>
                </nav>

                <button 
                    onClick={() => navigate("/admin/dashboard")}
                    className="mt-12 flex items-center gap-3 p-4 bg-teeny-greeny border border-blue-greeny/20 rounded-2xl text-blue-greeny hover:bg-blue-greeny hover:text-white transition-all font-black text-[11px] uppercase tracking-widest shadow-sm"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-10">
                {/* Mobile Navigation Controls */}
                <div className="md:hidden flex items-center justify-between gap-3 mb-6">
                    <button 
                        onClick={() => navigate("/admin/dashboard")}
                        className="flex items-center gap-2 px-3.5 py-2 bg-white border border-blue-greeny/20 rounded-xl text-blue-greeny font-black text-xs uppercase tracking-wider shadow-xs"
                    >
                        <ArrowLeft size={14} /> Back
                    </button>

                    <div className="flex bg-white p-1 rounded-xl border border-blue-greeny/10">
                        <button
                            onClick={() => setActiveTab("STUDENT")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                activeTab === "STUDENT" ? "bg-blue-greeny text-white" : "text-text-light"
                            }`}
                        >
                            Students
                        </button>
                        <button
                            onClick={() => setActiveTab("COMPANY")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                activeTab === "COMPANY" ? "bg-blue-greeny text-white" : "text-text-light"
                            }`}
                        >
                            Partners
                        </button>
                    </div>
                </div>

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12">
                    <div>
                        {/* ✅ REMOVED 'italic' - FONT IS NOW STRAIGHT */}
                        <h2 className="text-2xl sm:text-3xl font-heading font-black text-text-dark uppercase">
                            System Logs
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Clock size={14} className="text-text-light" />
                            <p className="text-xs text-text-light font-bold uppercase tracking-widest">
                                Real-time activity monitoring
                            </p>
                        </div>
                    </div>

                    <div className="relative w-full max-w-md group">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-light group-focus-within:text-blue-greeny transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by admin, action, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-blue-greeny/10 rounded-[2rem] outline-none text-sm font-medium shadow-sm focus:ring-2 focus:ring-blue-greeny/30 transition-all"
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-blue-greeny/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-teeny-greeny text-text-dark text-[10px] font-black uppercase tracking-[0.2em] border-b border-blue-greeny/5">
                                    <th className="px-10 py-6 text-center">Identity</th>
                                    <th className="px-10 py-6">Operation</th>
                                    <th className="px-10 py-6">Audit Details</th>
                                    <th className="px-10 py-6 text-right">Timestamp</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-blue-greeny/5">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan="4" className="px-10 py-8">
                                                <div className="h-4 bg-teeny-greeny rounded-full w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredLogs.length > 0 ? (
                                    filteredLogs.map(log => (
                                        <tr key={log._id} className="hover:bg-teeny-greeny/40 transition-colors">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-blue-greeny text-white rounded-full flex items-center justify-center font-black text-xs shadow-sm">
                                                        {log.adminName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        {/* ✅ REMOVED 'italic' - FONT IS NOW STRAIGHT */}
                                                        <span className="font-black text-text-dark text-sm uppercase">
                                                            {log.adminName}
                                                        </span>
                                                        <p className="text-[10px] text-text-light font-bold">
                                                            {log.adminEmail}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-10 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${getActionColor(log.action)}`}>
                                                    {log.action.replaceAll("_", " ")}
                                                </span>
                                            </td>

                                            <td className="px-10 py-6">
                                                {/* ✅ REMOVED 'italic' - FONT IS NOW STRAIGHT */}
                                                <p className="text-sm font-semibold text-text-dark border-l-4 border-blue-greeny/10 pl-4">
                                                    "{log.details}"
                                                </p>
                                            </td>

                                            <td className="px-10 py-6 text-right">
                                                <span className="text-xs font-black text-text-dark">
                                                    {new Date(log.timestamp).toLocaleDateString()}
                                                </span>
                                                <p className="text-[10px] text-text-light font-bold uppercase tracking-widest">
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </p>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-24">
                                            <div className="flex flex-col items-center opacity-40">
                                                <Activity size={64} className="text-blue-greeny" />
                                                <p className="mt-4 font-black uppercase tracking-[0.2em] text-xs text-text-light">
                                                    Zero audit records found
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default ActivityLogs;