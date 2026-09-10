import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import { ROUTES } from "../routes/routes";
import ChangePasswordModal from "./ChangePasswordModal";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

/* ================= ADMIN INITIALS MAP ================= */
const ADMIN_INITIALS_MAP = {
  "ajjangid660@gmail.com": "AJ",
  "pratikkhode1122@gmail.com": "PK",
  "mastervedant05@gmail.com": "VP",
  "ovpatil1121@gmail.com": "OP",
  "sumitvyadav47@gmail.com": "SY"
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [isChartReady, setIsChartReady] = useState(false);

  // 🔥 NEW STATE: NOTIFICATIONS logic
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  // 1️⃣ State Initialization
  const [stats, setStats] = useState({
    totalStudents: 0,
    verifiedStudents: 0,
    blockedStudents: 0,
    recentStudents: [],
    placementTrends: [],
    appTracking: [],
    logs: [],
    pendingQueries: 0,

    // 🔥 AI INTERVIEW ANALYTICS
    totalInterviews: 0,
    averageInterviewScore: 0,
    weakStudents: 0,
    strongStudents: 0,

    // 🔥 NEW MODULE ANALYTICS
    totalResumes: 0,
    totalAptitudeTests: 0,
    totalGDParticipants: 0,
    totalAiGD: 0, 
    totalLiveGD: 0, 
    totalCompanyModules: 0,
  });

  const token = localStorage.getItem("token");
  let adminEmail = "Admin";
  
  if (token) {
    try {
      const decoded = jwtDecode(token);
      adminEmail = decoded.email || "Admin"; 
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }

  const adminInitials = ADMIN_INITIALS_MAP[adminEmail?.toLowerCase()] || adminEmail?.charAt(0).toUpperCase();

  // 🟢 MAIN DASHBOARD STATS
  const fetchDashboardStats = async () => {
    try {
      const res = await api.get("/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // REQUIREMENT UPDATE: Backend se aane wale totalAiGD aur totalLiveGD ko stats mein map karna
      setStats((prev) => ({
        ...prev,
        ...res.data,
        totalAiGD: res.data.totalAiGD || 0,
        totalLiveGD: res.data.totalLiveGD || 0
      }));
    } catch (err) {
      console.error("Dashboard stats fetch failed");
    }
  };

  // 🔥 NEW: FETCH NOTIFICATIONS logic
  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await api.get("/admin/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    } finally {
      setNotifLoading(false);
    }
  };

  // 🔥 NEW: MARK NOTIFICATION AS READ logic
  const markAsRead = async (id) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking read");
    }
  };

  // 🔥 NEW: CLEAR ALL NOTIFICATIONS logic (REPLACES VIEW ALL)
  const handleClearNotifications = async () => {
    try {
      if (!window.confirm("Are you sure you want to clear all notifications?")) return;
      
      // REQUIREMENT UPDATE: Backend controller (deleteMany) ko trigger karna
      await api.delete("/admin/notifications/clear");
      
      // UI Update: Notification list ko khali karna kyunki backend se delete ho gayi hain
      setNotifications([]);
      setIsNotifOpen(false);
      
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  // 🟢 ANALYTICS STATS
  const fetchFullAnalytics = async () => {
    try {
      const res = await api.get("/admin/interviews/analytics/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res?.data?.data || {}; 

      setStats((prev) => ({
        ...prev,
        totalInterviews: data.totalInterviews || 0,
        averageInterviewScore: data.averageScore || 0,
        weakStudents: data.weakStudents || 0,
        strongStudents: data.strongStudents || 0,
      }));

    } catch (err) {
      console.error("Analytics fetch failed", err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchFullAnalytics(); 
    fetchNotifications(); // 🔥 Initial load

    const timer = setTimeout(() => setIsChartReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      setActionLoading(true);
      await api.post("/auth/logout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Backend logout failed");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/login");
      setActionLoading(false);
    }
  };

  /* ✅ HANDLE PROFILE PICTURE CHANGE */
  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBlockToggle = async (id, isBlocked) => {
    try {
      setActionLoading(true);
      const confirmAction = window.confirm(isBlocked ? "Unblock this student?" : "Block this student?");
      if (!confirmAction) return;
      await api.patch(`/admin/students/${id}/${isBlocked ? "unblock" : "block"}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Student ${isBlocked ? "unblocked" : "blocked"} successfully`);
      await fetchDashboardStats();
    } catch (err) {
      console.error("Block/Unblock failed");
    } finally {
      setActionLoading(false);
    }
  };

  const COLORS = ['#5cbdb9', '#fbbf24', '#f87171', '#60a5fa'];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  /* =========================================
      🔥 REQUIREMENT: PLACEMENT TRACKING LOGIC 
  ========================================= */
  const [placementTab, setPlacementTab] = useState("overview"); // "overview" or "tracking"
  const [placementData, setPlacementData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchPlacementAnalytics = async () => {
    try {
      const res = await api.get("/admin/placements/analytics");
      if (res.data.success) setPlacementData(res.data.data);
    } catch (err) { console.error("Placement fetch failed"); }
  };

  useEffect(() => { if (placementTab === "tracking") fetchPlacementAnalytics(); }, [placementTab]);

  const filteredPlacements = placementData.filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || item.studentEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (userId, appId, newStatus) => {
    try {
      setActionLoading(true);
      await api.patch("/admin/placements/update-status", { userId, applicationId: appId, newStatus });
      fetchPlacementAnalytics();
      fetchDashboardStats();
    } catch (err) { alert("Status update failed"); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="flex h-screen bg-teeny-greeny font-sans text-text-dark">
      {/* SIDEBAR */}
      <aside className="w-64 bg-teeny-greeny border-r border-blue-greeny/10 flex flex-col p-6 overflow-y-auto text-nowrap">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-blue-greeny rounded-xl flex items-center justify-center shadow-lg shadow-blue-greeny/20 rotate-3 transition-transform hover:rotate-0">
            <i className="fas fa-shield-alt text-white text-lg"></i>
          </div>
          <span className="text-2xl font-heading font-black tracking-tight text-text-dark">
            Admin<span className="text-blue-greeny">Panel</span>
          </span>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="text-[10px] font-black text-text-light uppercase tracking-[0.2em] mb-4 px-2">Main Menu</p>
          
          <SidebarItem 
            icon="fas fa-th-large" 
            label="Dashboard" 
            active={placementTab === "overview"} 
            onClick={() => setPlacementTab("overview")} 
          />
          <SidebarItem 
            icon="fas fa-user-graduate" 
            label="Students" 
            onClick={() => navigate(ROUTES.ADMIN_STUDENTS)} 
          />
          <SidebarItem
            icon="fas fa-building"
            label="Companies"
            onClick={() => navigate(ROUTES.ADMIN_COMPANIES)}
          />
          <SidebarItem
            icon="fas fa-robot"
            label="AI Interviews"
            onClick={() => navigate("/admin/interviews")}
          />

          <SidebarItem 
            icon="fas fa-chart-line" 
            label="Placement Tracking" 
            active={placementTab === "tracking"}
            onClick={() => setPlacementTab("tracking")}
          />
          <SidebarItem icon="fas fa-headset" label="Helpdesk" onClick={() => navigate("/admin/helpdesk")} />

          <p className="text-[10px] font-black text-text-light uppercase tracking-[0.2em] mt-8 mb-4 px-2">Security & System</p>
          <SidebarItem icon="fas fa-history" label="Activity Logs" onClick={() => navigate("/admin/activity-logs")} />
          <SidebarItem icon="fas fa-key" label="Change Password" onClick={() => setShowChangePassword(true)} />
        </nav>

        <button onClick={handleLogout} className="mt-10 flex items-center gap-3 p-3 text-text-light hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-black text-xs uppercase tracking-widest border-t border-blue-greeny/10 pt-6">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-teeny-greeny border-b border-blue-greeny/10 h-20 flex items-center justify-between px-8 sticky top-0 z-[100]">
          <h2 className="text-2xl font-heading font-black text-text-dark uppercase">
            {placementTab === "overview" ? "Dashboard Overview" : "Placement Tracking Intelligence"}
          </h2>
          
          <div className="flex items-center gap-6">
            
            {/* 🔥 NOTIFICATION CENTER BELL ICON (PROFESSIONAL SQUARE LARGE LAYOUT) */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2.5 text-text-light hover:text-blue-greeny transition-all bg-white rounded-xl border border-blue-greeny/10 shadow-sm"
              >
                <i className="fas fa-bell text-lg"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-4 w-[450px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-20 animate-in zoom-in-95 duration-200">
                    <div className="p-7 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                      <div>
                        <p className="text-[14px] font-bold text-slate-800 uppercase tracking-wider">System Notifications</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Pending Actions: {unreadCount}</p>
                      </div>
                      <span className="bg-blue-greeny/10 text-blue-greeny text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Live Monitor</span>
                    </div>

                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar-thin">
                      {notifications.length === 0 ? (
                        <div className="p-16 text-center text-xs text-text-light font-bold italic uppercase tracking-widest opacity-60">No recent notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n._id} 
                            onClick={() => { markAsRead(n._id); if(n.link) navigate(n.link); setIsNotifOpen(false); }}
                            className={`p-7 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-all ${!n.isRead ? 'bg-blue-greeny/[0.04]' : ''}`}
                          >
                            <div className="flex items-start gap-5">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-white ${n.type === 'critical' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                <i className={`fas ${n.type === 'query' ? 'fa-question-circle' : n.type === 'user_signup' ? 'fa-user-plus' : 'fa-info-circle'} text-lg`}></i>
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <p className="text-[13px] font-bold text-slate-800 leading-tight uppercase tracking-tight">{n.title}</p>
                                  {!n.isRead && <span className="w-2.5 h-2.5 bg-blue-greeny rounded-full border-2 border-white shadow-sm"></span>}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">{n.message}</p>
                                <div className="flex items-center gap-2 mt-4 opacity-40">
                                   <i className="far fa-clock text-[9px]"></i>
                                   <p className="text-[9px] font-black uppercase">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* 🔥 UPDATED: CLEAR ALL BUTTON (PROFESSIONAL LOOK) */}
                    <button 
                       onClick={handleClearNotifications}
                       className="block w-full p-5 text-center text-[11px] font-black text-red-500 uppercase tracking-[0.2em] hover:bg-red-50 transition-all border-t border-slate-50 active:bg-red-100"
                    >
                      Clear All Notifications
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-4 bg-white p-1.5 pl-4 rounded-2xl border border-blue-greeny/10 shadow-sm cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-[11px] font-black text-text-dark leading-none mb-1">{adminEmail}</p>
                  <span className="bg-blue-greeny/10 text-blue-greeny text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                    Super Admin
                  </span>
                </div>

                <div className="relative w-10 h-10 bg-gradient-to-tr from-blue-greeny to-blue-greeny rounded-xl flex items-center justify-center text-white font-black shadow-lg overflow-hidden group-hover:rotate-2 transition-transform">
                  {profilePic ? (
                    <img src={profilePic} alt="Admin" className="w-full h-full object-cover" />
                  ) : adminInitials}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <i className={`fas fa-chevron-down text-[10px] text-text-light mr-2 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}></i>
              </div>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-4 w-64 bg-white rounded-[2rem] shadow-2xl border border-blue-greeny/10 p-6 z-20 animate-in slide-in-from-top-2 duration-300">
                    <div className="text-center mb-6">
                      <div 
                        onClick={() => fileInputRef.current.click()}
                        className="w-20 h-20 mx-auto bg-teeny-greeny rounded-[1.5rem] mb-3 flex items-center justify-center cursor-pointer hover:bg-white transition-all relative group/upload"
                      >
                        {profilePic ? (
                          <img src={profilePic} alt="Admin" className="w-full h-full object-cover rounded-[1.5rem]" />
                        ) : (
                          <i className="fas fa-camera text-text-light text-xl"></i>
                        )}
                        <div className="absolute inset-0 bg-black/40 rounded-[1.5rem] opacity-0 group-hover/upload:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[10px] text-white font-bold uppercase">Update</span>
                        </div>
                      </div>
                      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleProfilePicChange} />
                      <p className="text-xs font-black text-text-dark">{adminEmail}</p>
                      <p className="text-[9px] text-blue-greeny font-black uppercase tracking-[0.2em] mt-1">Administrator</p>
                    </div>

                    <div className="space-y-1">
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-teeny-greeny transition-colors text-text-dark font-black text-[11px] uppercase tracking-wider">
                        <i className="fas fa-user-circle text-blue-greeny"></i> My Profile
                      </button>
                      <button onClick={() => setShowChangePassword(true)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-teeny-greeny transition-colors text-text-dark font-black text-[11px] uppercase tracking-wider">
                        <i className="fas fa-key text-text-light"></i> Change Password
                      </button>
                      <hr className="border-blue-greeny/10 my-2" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-red-500 font-black text-[11px] uppercase tracking-wider">
                        <i className="fas fa-sign-out-alt"></i> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {placementTab === "overview" ? (
          <div className="p-8 space-y-8">
            {/* Section 1: Core User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon="fas fa-users" label="Total Students" value={stats.totalStudents} color="bg-white" iconColor="text-teal-500" />
              <StatCard icon="fas fa-question-circle" label="Pending Queries" value={stats.pendingQueries} color="bg-white" iconColor="text-orange-500" />
              <StatCard icon="fas fa-user-slash" label="Blocked Students" value={stats.blockedStudents} color="bg-white" iconColor="text-red-500" />
              <StatCard icon="fas fa-user-tie" label="Total Placed" value="892" color="bg-white" iconColor="text-blue-500" />
            </div>

            {/* Section 2: Interview & Placement Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon="fas fa-video"
                label="Total Interviews"
                value={stats.totalInterviews}
                color="bg-white"
                iconColor="text-purple-500"
              />
              <StatCard 
                icon="fas fa-chart-bar"
                label="Avg. Interview Score"
                value={`${stats.averageInterviewScore || 0}%`}
                color="bg-white"
                iconColor="text-indigo-500"
              />
              <StatCard 
                icon="fas fa-exclamation-triangle"
                label="Weak Students"
                value={stats.weakStudents}
                color="bg-white"
                iconColor="text-red-500"
              />
              <StatCard 
                icon="fas fa-rocket"
                label="Strong Students"
                value={stats.strongStudents}
                color="bg-white"
                iconColor="text-green-500"
              />
            </div>

            {/* 🔥 Section 3: REQUIREMENT UPDATED CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                icon="fas fa-file-invoice"
                label="Resume Scanned"
                value={stats.totalResumes}
                color="bg-white"
                iconColor="text-blue-600"
              />
              <StatCard 
                icon="fas fa-brain"
                label="Aptitude Tests"
                value={stats.totalAptitudeTests}
                color="bg-white"
                iconColor="text-orange-600"
              />
              {/* REQUIREMENT UPDATE: real count display using stats variables */}
              <StatCard 
                icon="fas fa-robot"
                label="Ai GD"
                value={stats.totalAiGD}
                color="bg-white"
                iconColor="text-pink-600"
              />
              <StatCard 
                icon="fas fa-users"
                label="Live GD"
                value={stats.totalLiveGD}
                color="bg-white"
                iconColor="text-purple-600"
              />
              <StatCard 
                icon="fas fa-building"
                label="Company Test"
                value={stats.totalCompanyModules}
                color="bg-white"
                iconColor="text-indigo-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-[2rem] border border-blue-greeny/10 shadow-xl transition-all min-h-[350px]">
                <h3 className="text-xl font-heading font-black text-text-dark uppercase mb-6">Placement Trends (Live)</h3>
                <div className="h-64">
                  {isChartReady && stats.placementTrends?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <LineChart data={stats.placementTrends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="_id" tick={{fontSize: 12, fontWeight: 'bold'}} />
                        <YAxis tick={{fontSize: 12, fontWeight: 'bold'}} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#5cbdb9" strokeWidth={4} dot={{r: 5, fill: '#5cbdb9'}} activeDot={{r: 8}} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-full text-text-light font-bold italic">Loading charts...</div>}
                </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-blue-greeny/10 shadow-xl transition-all min-h-[350px]">
                <h3 className="text-xl font-heading font-black text-text-dark uppercase mb-6">Application Status Tracking</h3>
                <div className="h-64">
                  {isChartReady && stats.appTracking?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <BarChart data={stats.appTracking}>
                        <XAxis dataKey="_id" tick={{fontSize: 10, fontWeight: 'bold'}} />
                        <Tooltip cursor={{fill: '#f8fafc'}} />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                          {stats.appTracking.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-full text-text-light font-bold italic">Loading charts...</div>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 pb-10">
              <div className="bg-white rounded-[2rem] border border-blue-greeny/10 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-blue-greeny/10 flex items-center justify-between">
                  <h3 className="text-xl font-heading font-black text-text-dark uppercase">Recent Registrations</h3>
                  <button onClick={() => navigate(ROUTES.ADMIN_STUDENTS)} className="text-xs font-black text-white bg-blue-greeny px-6 py-3 rounded-xl hover:shadow-lg shadow-blue-greeny/20 transition-all uppercase tracking-widest">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-teeny-greeny text-[10px] uppercase font-black text-text-light tracking-[0.2em]">
                      <tr>
                        <th className="px-10 py-6">Email</th>
                        <th className="px-10 py-6">Status</th>
                        <th className="px-10 py-6">Joined</th>
                        <th className="px-10 py-6 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-greeny/5 text-sm">
                      {stats.recentStudents.map((student) => (
                        <tr key={student._id} className="group hover:bg-teeny-greeny/30 transition-colors">
                          <td className="px-10 py-6 font-black text-text-dark whitespace-nowrap">{student.email}</td>
                          <td className="px-10 py-6 whitespace-nowrap">
                            <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              student.isBlocked ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-500 border border-green-100'
                            }`}>
                              {student.isBlocked ? 'Blocked' : 'Verified'}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-text-light font-bold whitespace-nowrap">
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex items-center justify-center gap-3">
                              <button 
                                disabled={actionLoading}
                                onClick={() => handleBlockToggle(student._id, student.isBlocked)} 
                                className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                                  student.isBlocked ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                } ${actionLoading ? 'opacity-50' : ''}`}
                              >
                                {student.isBlocked ? 'Unblock' : 'Block'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* 🔥 REQUIREMENT: PROFESSIONAL PLACEMENT TRACKING SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-blue-greeny/10 shadow-2xl">
                <div className="flex justify-between items-center mb-10">
                   <div>
                     <h3 className="text-xl font-heading font-black text-text-dark uppercase">Hiring Funnel Analytics</h3>
                     <p className="text-[10px] text-text-light font-bold uppercase tracking-widest mt-1">Practice vs Real Applications</p>
                   </div>
                   <div className="w-12 h-12 bg-blue-greeny/10 rounded-2xl flex items-center justify-center">
                      <i className="fas fa-chart-pie text-blue-greeny"></i>
                   </div>
                </div>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.topCompanies} layout="vertical">
                         <XAxis type="number" hide />
                         <YAxis dataKey="_id" type="category" tick={{fontSize: 10, fontWeight: 'black'}} width={100} />
                         <Tooltip cursor={{fill: '#f8fafc'}} />
                         <Bar dataKey="count" fill="#5cbdb9" radius={[0, 10, 10, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-blue-greeny/10 shadow-2xl flex flex-col justify-between">
                <div className="text-center py-6">
                  <p className="text-[10px] font-black text-blue-greeny uppercase tracking-[0.3em] mb-4">Total Demand</p>
                  <h4 className="text-6xl font-black text-text-dark">{placementData.length}</h4>
                  <p className="text-xs font-bold text-text-light mt-2 uppercase">Active Applications</p>
                </div>
                <div className="bg-teeny-greeny p-6 rounded-3xl border border-blue-greeny/5">
                   <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                      <span>Conversion Rate</span>
                      <span className="text-blue-greeny">68%</span>
                   </div>
                   <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                      <div className="h-full bg-blue-greeny" style={{width: '68%'}}></div>
                   </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-blue-greeny/10 shadow-2xl overflow-hidden">
               <div className="p-8 border-b border-blue-greeny/10 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-blue-greeny/10 flex items-center justify-center">
                       <i className="fas fa-list-ul text-blue-greeny"></i>
                    </div>
                    <h3 className="text-xl font-heading font-black text-text-dark uppercase">Placement Live Ledger</h3>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                       <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-text-light text-xs"></i>
                       <input 
                         type="text" placeholder="Search Email or Student..." 
                         className="w-full pl-10 pr-4 py-3 bg-white border border-blue-greeny/10 rounded-xl text-xs font-bold focus:ring-2 ring-blue-greeny/20 outline-none"
                         value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                       />
                    </div>
                    <select 
                      className="bg-white border border-blue-greeny/10 px-4 py-3 rounded-xl text-xs font-black uppercase outline-none cursor-pointer"
                      value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All Status</option>
                      <option value="Applied">Applied</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-teeny-greeny text-[10px] uppercase font-black text-text-light tracking-[0.2em]">
                      <tr>
                        <th className="px-8 py-6">Student & Milestones</th>
                        <th className="px-8 py-6">Company & Role</th>
                        <th className="px-8 py-6 text-center">Application Status</th>
                        <th className="px-8 py-6 text-center">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-greeny/5">
                      {filteredPlacements.map((item) => (
                        <tr key={item.applicationId} className="group hover:bg-teeny-greeny/20 transition-colors">
                          <td className="px-8 py-6">
                            <p className="text-xs font-black text-text-dark uppercase">{item.studentName}</p>
                            <div className="flex gap-3 mt-2">
                               <span className="text-[9px] font-black text-blue-greeny bg-blue-greeny/5 px-2 py-0.5 rounded">GD: {item.gdCount}</span>
                               <span className="text-[9px] font-black text-orange-500 bg-orange-500/5 px-2 py-0.5 rounded">APT: {item.aptitudeTests}</span>
                               <span className="text-[9px] font-black text-purple-500 bg-purple-500/5 px-2 py-0.5 rounded">RES: {item.latestResumeScore}%</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-xs font-black text-text-dark uppercase">{item.companyName}</p>
                            <p className="text-[10px] text-text-light font-bold">{item.jobRole}</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              item.status === 'Selected' ? 'bg-green-50 text-green-500 border-green-100' : 
                              item.status === 'Rejected' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-500 border-blue-100'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => handleStatusChange(item.userId, item.applicationId, "Selected")}
                                className="w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm" title="Mark Selected"
                              >
                                <i className="fas fa-check text-[10px]"></i>
                              </button>
                              <button 
                                onClick={() => handleStatusChange(item.userId, item.applicationId, "Rejected")}
                                className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm" title="Mark Rejected"
                              >
                                <i className="fas fa-times text-[10px]"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPlacements.length === 0 && <div className="p-20 text-center text-xs font-black text-text-light uppercase tracking-widest opacity-40">No Placement records found</div>}
               </div>
            </div>
          </div>
        )}
      </main>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};

/* --- SUB COMPONENTS --- */
const SidebarItem = ({ icon, label, active = false, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
    active ? 'bg-blue-greeny/20 text-blue-greeny border-l-4 border-blue-greeny shadow-sm' : 'text-text-light hover:bg-white hover:text-blue-greeny'
  }`}>
    <i className={`${icon} w-5 text-center`}></i>
    {label}
  </div>
);

const StatCard = ({ icon, label, value, color, iconColor }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-blue-greeny/10 shadow-xl flex items-start justify-between transition-transform hover:scale-[1.02] cursor-default">
    <div>
      <div className={`w-14 h-14 ${color} ${iconColor} rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-blue-greeny/5`}>
        <i className={`${icon} text-2xl`}></i>
      </div>
      <h4 className="text-3xl font-heading font-black text-text-dark">{value}</h4>
      <p className="text-[10px] font-black text-text-light mt-2 uppercase tracking-[0.2em]">{label}</p>
    </div>
  </div>
);

export default AdminDashboard;