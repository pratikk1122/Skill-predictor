import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import api from "../services/api";
import { ROUTES } from "../routes/routes";
import ChangePasswordModal from "./ChangePasswordModal";
import ThemeToggle from "../components/common/ThemeToggle";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import {
  LayoutDashboard, Users, Building2, Bot, TrendingUp, 
  Headphones, History, KeyRound, LogOut, Bell, Shield, 
  CheckCircle2, Clock, AlertTriangle, Search, FileText, 
  Brain, Video, Award, Check, X, Camera, ChevronDown, 
  Filter, Sparkles, UserCheck, UserX, HelpCircle, Menu
} from 'lucide-react';

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  // State Initialization
  const [stats, setStats] = useState({
    totalStudents: 0,
    verifiedStudents: 0,
    blockedStudents: 0,
    recentStudents: [],
    placementTrends: [],
    appTracking: [],
    logs: [],
    pendingQueries: 0,

    totalInterviews: 0,
    averageInterviewScore: 0,
    weakStudents: 0,
    strongStudents: 0,

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
    } catch {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }

  const adminInitials = ADMIN_INITIALS_MAP[adminEmail?.toLowerCase()] || adminEmail?.charAt(0).toUpperCase() || "A";

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get("/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setStats((prev) => ({
        ...prev,
        ...res.data,
        totalAiGD: res.data.totalAiGD || 0,
        totalLiveGD: res.data.totalLiveGD || 0
      }));
    } catch (err) {
      console.error("Dashboard stats fetch failed", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await api.get("/admin/notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setNotifLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications((prev) => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Mark as read failed", err);
    }
  };

  const handleClearNotifications = async () => {
    try {
      await api.delete("/admin/notifications/clear-all");
      setNotifications([]);
    } catch (err) {
      console.error("Clear notifications failed", err);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchNotifications();

    const timer = setTimeout(() => setIsChartReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      setActionLoading(true);
      await api.post("/auth/logout", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      // Ignore network errors
    } finally {
      localStorage.clear();
      navigate("/login");
      setActionLoading(false);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files?.[0];
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
      await fetchDashboardStats();
    } catch (err) {
      console.error("Block/Unblock failed", err);
    } finally {
      setActionLoading(false);
    }
  };

  const COLORS = ['#0d9488', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const [placementTab, setPlacementTab] = useState("overview");
  const [placementData, setPlacementData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchPlacementAnalytics = async () => {
    try {
      const res = await api.get("/admin/placements/analytics");
      if (res.data.success) setPlacementData(res.data.data);
    } catch (err) { 
      console.error("Placement fetch failed", err); 
    }
  };

  useEffect(() => { 
    if (placementTab === "tracking") fetchPlacementAnalytics(); 
  }, [placementTab]);

  const filteredPlacements = placementData.filter(item => {
    const matchesSearch = item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (userId, appId, newStatus) => {
    try {
      setActionLoading(true);
      await api.patch("/admin/placements/update-status", { userId, applicationId: appId, newStatus });
      fetchPlacementAnalytics();
      fetchDashboardStats();
    } catch { 
      alert("Status update failed"); 
    } finally { 
      setActionLoading(false); 
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity" 
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 
        border-r border-slate-200/80 dark:border-slate-800 flex flex-col p-5 
        overflow-y-auto shrink-0 shadow-2xl md:shadow-sm 
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Shield size={20} />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-800 dark:text-white leading-none">
                Admin<span className="text-teal-600 dark:text-teal-400">Portal</span>
              </span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Management Suite</p>
            </div>
          </div>

          {/* Close button visible only on mobile */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Main Navigation</p>
          
          <SidebarItem 
            icon={LayoutDashboard} 
            label="Overview" 
            active={placementTab === "overview"} 
            onClick={() => { setPlacementTab("overview"); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={Users} 
            label="Students" 
            onClick={() => { navigate(ROUTES.ADMIN_STUDENTS); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarItem
            icon={Building2}
            label="Companies"
            onClick={() => { navigate(ROUTES.ADMIN_COMPANIES); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarItem
            icon={Bot}
            label="AI Interviews"
            onClick={() => { navigate("/admin/interviews"); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={TrendingUp} 
            label="Placement Tracking" 
            active={placementTab === "tracking"}
            onClick={() => { setPlacementTab("tracking"); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={Headphones} 
            label="Helpdesk" 
            onClick={() => { navigate("/admin/helpdesk"); setIsMobileSidebarOpen(false); }} 
          />

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 mb-3 px-2">System & Security</p>
          <SidebarItem 
            icon={History} 
            label="Activity Logs" 
            onClick={() => { navigate("/admin/activity-logs"); setIsMobileSidebarOpen(false); }} 
          />
          <SidebarItem 
            icon={KeyRound} 
            label="Change Password" 
            onClick={() => { setShowChangePassword(true); setIsMobileSidebarOpen(false); }} 
          />
        </nav>

        <button 
          onClick={handleLogout} 
          className="mt-6 flex items-center gap-2.5 px-3.5 py-2.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all font-bold text-xs uppercase tracking-wider border-t border-slate-100 dark:border-slate-800 pt-4 group"
        >
          <LogOut size={16} className="group-hover:rotate-6 transition-transform" />
          <span>Logout Session</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Hamburger Drawer Trigger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
              aria-label="Open Admin Menu"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-xl font-black text-slate-800 dark:text-white tracking-tight truncate max-w-[150px] sm:max-w-none">
                {placementTab === "overview" ? "Executive Dashboard" : "Placement Tracking"}
              </h2>
              <p className="hidden sm:block text-xs text-slate-400 font-medium truncate">Real-time candidate metrics, interviews, and application ledgers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification Center Bell */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs active:scale-95"
                aria-label="View notifications"
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsNotifOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Notifications</p>
                        <p className="text-[10px] text-slate-400 font-medium">Unread updates: {unreadCount}</p>
                      </div>
                      <span className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                        Live Feed
                      </span>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-400 font-medium italic">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n._id} 
                            onClick={() => { markAsRead(n._id); if(n.link) navigate(n.link); setIsNotifOpen(false); }}
                            className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all ${!n.isRead ? 'bg-teal-50/30 dark:bg-teal-950/20' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                                <Sparkles size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{n.title}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[9px] text-slate-400 mt-2 flex items-center gap-1 font-mono">
                                  <Clock size={10} />
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <button 
                       onClick={handleClearNotifications}
                       className="block w-full p-3 text-center text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all border-t border-slate-100 dark:border-slate-800"
                    >
                      Clear All Notifications
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Profile Pill */}
            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 sm:gap-2.5 bg-white dark:bg-slate-800 p-1 pl-2 sm:pl-3 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-teal-400 transition-all"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none mb-0.5 truncate max-w-[120px]">{adminEmail}</p>
                  <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                    Super Admin
                  </span>
                </div>

                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-600 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs overflow-hidden shrink-0">
                  {profilePic ? (
                    <img src={profilePic} alt="Admin" className="w-full h-full object-cover" />
                  ) : adminInitials}
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180 text-teal-600' : ''}`} />
              </div>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute top-full right-0 mt-3 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div 
                        onClick={() => fileInputRef.current.click()}
                        className="w-14 h-14 mx-auto bg-teal-50 dark:bg-teal-950/60 rounded-xl mb-2 flex items-center justify-center cursor-pointer hover:bg-teal-100 transition-all relative group"
                      >
                        {profilePic ? (
                          <img src={profilePic} alt="Admin" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <Camera size={18} className="text-teal-600 dark:text-teal-400" />
                        )}
                      </div>
                      <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleProfilePicChange} />
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{adminEmail}</p>
                      <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">Administrator</p>
                    </div>

                    <div className="space-y-1">
                      <button 
                        onClick={() => { setShowChangePassword(true); setIsProfileOpen(false); }} 
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-semibold text-xs"
                      >
                        <KeyRound size={14} className="text-slate-400" /> Change Password
                      </button>
                      <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-rose-600 dark:text-rose-400 font-semibold text-xs"
                      >
                        <LogOut size={14} /> Logout Session
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {placementTab === "overview" ? (
          <div className="p-6 sm:p-8 space-y-8">
            {/* Section 1: Core User Stats */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Student & Query Metrics</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Students" value={stats.totalStudents} color="bg-blue-50 dark:bg-blue-950/60" iconColor="text-blue-600 dark:text-blue-400" />
                <StatCard icon={HelpCircle} label="Pending Queries" value={stats.pendingQueries} color="bg-amber-50 dark:bg-amber-950/60" iconColor="text-amber-600 dark:text-amber-400" />
                <StatCard icon={UserX} label="Blocked Students" value={stats.blockedStudents} color="bg-rose-50 dark:bg-rose-950/60" iconColor="text-rose-600 dark:text-rose-400" />
                <StatCard icon={UserCheck} label="Active Placed" value="892" color="bg-teal-50 dark:bg-teal-950/60" iconColor="text-teal-600 dark:text-teal-400" />
              </div>
            </div>

            {/* Section 2: Interview & Placement Performance */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Interview Intelligence</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Video} label="Total Interviews" value={stats.totalInterviews} color="bg-purple-50 dark:bg-purple-950/60" iconColor="text-purple-600 dark:text-purple-400" />
                <StatCard icon={TrendingUp} label="Avg. Interview Score" value={`${stats.averageInterviewScore || 0}%`} color="bg-indigo-50 dark:bg-indigo-950/60" iconColor="text-indigo-600 dark:text-indigo-400" />
                <StatCard icon={AlertTriangle} label="Students Needing Focus" value={stats.weakStudents} color="bg-rose-50 dark:bg-rose-950/60" iconColor="text-rose-600 dark:text-rose-400" />
                <StatCard icon={Sparkles} label="Top Tier Performers" value={stats.strongStudents} color="bg-emerald-50 dark:bg-emerald-950/60" iconColor="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            {/* Section 3: Module Activity */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Module Penetration</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard icon={FileText} label="Resumes Analyzed" value={stats.totalResumes} color="bg-blue-50 dark:bg-blue-950/60" iconColor="text-blue-600 dark:text-blue-400" />
                <StatCard icon={Brain} label="Aptitude Tests" value={stats.totalAptitudeTests} color="bg-amber-50 dark:bg-amber-950/60" iconColor="text-amber-600 dark:text-amber-400" />
                <StatCard icon={Bot} label="AI GD Sessions" value={stats.totalAiGD} color="bg-pink-50 dark:bg-pink-950/60" iconColor="text-pink-600 dark:text-pink-400" />
                <StatCard icon={Users} label="Peer GD Sessions" value={stats.totalLiveGD} color="bg-purple-50 dark:bg-purple-950/60" iconColor="text-purple-600 dark:text-purple-400" />
                <StatCard icon={Building2} label="Company Tests" value={stats.totalCompanyModules} color="bg-teal-50 dark:bg-teal-950/60" iconColor="text-teal-600 dark:text-teal-400" />
              </div>
            </div>

            {/* Section 4: Live Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm min-h-[350px]">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-teal-600 dark:text-teal-400" />
                  <span>Placement Application Trends</span>
                </h3>
                <div className="h-64">
                  {isChartReady && stats.placementTrends?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.placementTrends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="_id" tick={{fontSize: 11}} stroke="#64748b" />
                        <YAxis tick={{fontSize: 11}} stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                        <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={3} dot={{r: 4, fill: '#0d9488'}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs italic">No trend data available</div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm min-h-[350px]">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BarChart size={16} className="text-teal-600 dark:text-teal-400" />
                  <span>Application Status Distribution</span>
                </h3>
                <div className="h-64">
                  {isChartReady && stats.appTracking?.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.appTracking}>
                        <XAxis dataKey="_id" tick={{fontSize: 10}} stroke="#64748b" />
                        <YAxis tick={{fontSize: 11}} stroke="#64748b" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                          {stats.appTracking.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs italic">No status distribution available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 5: Recent Registrations Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Recent Registrations</h3>
                  <p className="text-xs text-slate-400">Newly registered students and active verification states</p>
                </div>
                <button 
                  onClick={() => navigate(ROUTES.ADMIN_STUDENTS)} 
                  className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
                >
                  View All Students
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Email</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5">Joined</th>
                      <th className="px-6 py-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {stats.recentStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-slate-800 dark:text-slate-200">{student.email}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            student.isBlocked 
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50' 
                              : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                          }`}>
                            {student.isBlocked ? 'Blocked' : 'Verified'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-400 font-medium">
                          {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <button 
                            disabled={actionLoading}
                            onClick={() => handleBlockToggle(student._id, student.isBlocked)} 
                            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all active:scale-95 ${
                              student.isBlocked 
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 hover:bg-emerald-100 border border-emerald-200' 
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 border border-rose-200'
                            } ${actionLoading ? 'opacity-50' : ''}`}
                          >
                            {student.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
            {/* PLACEMENT TRACKING SECTION */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
               <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Placement Live Ledger</h3>
                    <p className="text-xs text-slate-400">Manage student interview progress and milestone application status</p>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                       <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         type="text" placeholder="Filter by email or student..." 
                         className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500/20 outline-none text-slate-800 dark:text-slate-100"
                         value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                       />
                    </div>
                    <select 
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-semibold outline-none cursor-pointer text-slate-700 dark:text-slate-200"
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
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">Candidate & Modules</th>
                        <th className="px-6 py-3.5">Company & Role</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                        <th className="px-6 py-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                      {filteredPlacements.map((item) => (
                        <tr key={item.applicationId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-3.5">
                            <p className="font-bold text-slate-800 dark:text-slate-200 capitalize">{item.studentName}</p>
                            <div className="flex gap-2 mt-1.5">
                               <span className="text-[10px] font-bold text-teal-600 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">GD: {item.gdCount}</span>
                               <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">APT: {item.aptitudeTests}</span>
                               <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">RES: {item.latestResumeScore}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{item.companyName}</p>
                            <p className="text-[11px] text-slate-400">{item.jobRole}</p>
                          </td>
                          <td className="px-6 py-3.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              item.status === 'Selected' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                              item.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => handleStatusChange(item.userId, item.applicationId, "Selected")}
                                className="h-7 px-2.5 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all text-xs font-semibold" 
                                title="Mark Selected"
                              >
                                Select
                              </button>
                              <button 
                                onClick={() => handleStatusChange(item.userId, item.applicationId, "Rejected")}
                                className="h-7 px-2.5 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all text-xs font-semibold" 
                                title="Mark Rejected"
                              >
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredPlacements.length === 0 && (
                    <div className="p-12 text-center text-xs font-semibold text-slate-400">No matching placement records found</div>
                  )}
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
const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
  <div 
    onClick={onClick} 
    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
      active 
        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold border border-teal-100 dark:border-teal-900/40 shadow-xs' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-teal-600 dark:hover:text-teal-400'
    }`}
  >
    <Icon size={17} className={active ? "text-teal-600 dark:text-teal-400" : "text-slate-400"} />
    <span>{label}</span>
  </div>
);

const StatCard = ({ icon: Icon, label, value, color, iconColor }) => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-4 transition-all hover:shadow-md">
    <div className={`w-11 h-11 ${color} ${iconColor} rounded-xl flex items-center justify-center shrink-0`}>
      <Icon size={20} />
    </div>
    <div className="min-w-0">
      <h4 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight truncate">{value}</h4>
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 truncate mt-0.5">{label}</p>
    </div>
  </div>
);

export default AdminDashboard;