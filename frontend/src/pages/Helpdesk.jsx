import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../services/api";

const Helpdesk = () => {
    const navigate = useNavigate();
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [actionLoading, setActionLoading] = useState(null); 
    const [analytics, setAnalytics] = useState({ totalQueries: 0, aiResolved: 0, pending: 0, efficiency: 0 });
    const [activeTab, setActiveTab] = useState("All");

    const fetchQueries = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/queries");
            setQueries(res.data);
            
            const analyticsRes = await api.get("/admin/helpdesk-analytics");
            setAnalytics(analyticsRes.data);
        } catch (err) {
            console.error("Failed to fetch queries:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueries();
    }, []);

    const handleResolve = async (userId, queryId, customReply = null) => {
        try {
            setActionLoading(queryId);
            await api.patch(`/admin/queries/${userId}/${queryId}/resolve`, { customReply });
            alert("Query resolved successfully!");
            await fetchQueries();
        } catch (err) {
            console.error("Resolve error:", err);
            alert("Failed to resolve query");
        } finally {
            setActionLoading(null);
        }
    };

    const handleGetAISuggestion = async (queryId, content) => {
        try {
            setActionLoading(queryId);
            const res = await api.post("/admin/queries/suggest", { queryContent: content });
            const confirmed = window.confirm(`AI Suggestion:\n\n"${res.data.suggestion}"\n\nWould you like to send this as a final resolution?`);
            if (confirmed) {
                const target = queries.find(q => q.queryId === queryId);
                await handleResolve(target.userId, queryId, res.data.suggestion);
            }
        } catch (err) {
            alert("Could not generate suggestion at this moment.");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredQueries = queries.filter(q => {
        const matchesSearch = (q.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                            (q.queryContent?.toLowerCase() || "").includes(searchTerm.toLowerCase());
        
        if (activeTab === "Pending") return matchesSearch && q.status !== "Resolved";
        if (activeTab === "AI Resolved") return matchesSearch && q.resolvedBy === "AI";
        return matchesSearch;
    });

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <main className="flex-1 overflow-y-auto p-8">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight">
                            Smart Helpdesk 2.0
                        </h2>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">
                            AI-Powered Issue Management System
                        </p>
                    </div>

                    {/* 🔥 ADDED BACK TO DASHBOARD BUTTON */}
                    <button
                        onClick={() => navigate("/admin/dashboard")}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-blue-greeny hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        <i className="fas fa-arrow-left"></i>
                        Back to Dashboard
                    </button>
                </div>

                {/* ANALYTICS MINI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: "Total Queries", val: analytics.totalQueries, icon: "fa-comments", color: "text-blue-500", bg: "bg-blue-50" },
                        { label: "AI Handled", val: analytics.aiResolved, icon: "fa-robot", color: "text-teal-500", bg: "bg-teal-50" },
                        { label: "Manual Action", val: analytics.pending, icon: "fa-clock", color: "text-orange-500", bg: "bg-orange-50" },
                        { label: "AI Efficiency", val: `${analytics.efficiency}%`, icon: "fa-bolt", color: "text-purple-500", bg: "bg-purple-50" }
                    ].map((card, i) => (
                        <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center text-xl`}>
                                <i className={`fas ${card.icon}`}></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{card.label}</p>
                                <h4 className="text-2xl font-black text-slate-800 leading-none">{card.val}</h4>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FILTERS & SEARCH */}
                <div className="bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-xl mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full md:w-auto">
                        {["All", "Pending", "AI Resolved"].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                                    activeTab === tab ? 'bg-white text-blue-greeny shadow-md' : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative flex-1 w-full group">
                        <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-greeny transition-colors"></i>
                        <input
                            type="text"
                            placeholder="Filter by email or query text..."
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-[1.5rem] text-sm font-medium focus:ring-2 focus:ring-blue-greeny/20 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* TABLE SECTION */}
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.25em] border-b border-slate-100">
                                <tr>
                                    <th className="px-10 py-7">Student Info</th>
                                    <th className="px-10 py-7">Inquiry Details</th>
                                    <th className="px-10 py-7">Timeline</th>
                                    <th className="px-10 py-7">Resolution Method</th>
                                    <th className="px-10 py-7 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-50 text-sm">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-32">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-blue-greeny border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Fetching Queries...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredQueries.length > 0 ? (
                                    filteredQueries.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/80 transition-all group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-500 text-xs">
                                                        {item.studentName?.charAt(0) || "S"}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-800 leading-none mb-1">{item.studentName || "Student"}</p>
                                                        <p className="text-[11px] text-slate-400 font-medium">{item.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-10 py-8">
                                                <div className="max-w-xs">
                                                    <p className="text-slate-600 font-medium leading-relaxed line-clamp-2">
                                                        "{item.queryContent}"
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <i className="far fa-clock text-xs"></i>
                                                    <span className="text-[11px] font-bold">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-10 py-8">
                                                {item.status === 'Resolved' ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit ${
                                                            item.resolvedBy === "AI" 
                                                            ? "bg-teal-50 text-teal-600 border-teal-100" 
                                                            : "bg-blue-50 text-blue-600 border-blue-100"
                                                        }`}>
                                                            {item.resolvedBy === "AI" ? "✨ AI Resolved" : "👤 Admin Resolved"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-400 border border-slate-200">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-10 py-8 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {item.status !== 'Resolved' ? (
                                                        <>
                                                            <button
                                                                disabled={actionLoading === item.queryId}
                                                                onClick={() => handleGetAISuggestion(item.queryId, item.queryContent)}
                                                                className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-500 hover:text-white transition-all shadow-sm flex items-center justify-center disabled:opacity-50"
                                                                title="AI Draft Suggestion"
                                                            >
                                                                <i className="fas fa-magic"></i>
                                                            </button>
                                                            <button
                                                                disabled={actionLoading === item.queryId}
                                                                onClick={() => handleResolve(item.userId, item.queryId)}
                                                                className="px-5 py-2.5 bg-blue-greeny text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-greeny-dark shadow-lg shadow-blue-greeny/20 active:scale-95 disabled:opacity-50"
                                                            >
                                                                {actionLoading === item.queryId ? '...' : 'Resolve'}
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs font-black text-slate-200 uppercase tracking-widest italic">Archived</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-32 text-slate-300 font-bold uppercase tracking-[0.2em] text-xs">
                                            No matching inquiries found
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

export default Helpdesk;