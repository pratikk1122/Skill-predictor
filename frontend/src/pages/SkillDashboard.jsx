import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../services/api';

const SkillDashboard = () => {
  const navigate = useNavigate(); // 🔥 Added to handle navigation safely
  const [statsData, setStatsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;
        
        const user = JSON.parse(storedUser);
        const userId = user._id || user.id;

        const res = await api.post('/ai/skill-stats', { userId });
        if (res.data.success) {
          setStatsData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          {/* 🔥 FIXED: Now explicitly routes back to Company Prep */}
          <button 
            onClick={() => navigate('/company-prep')} 
            className="w-11 h-11 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-500 hover:text-[#5cbdb9] transition-all border border-slate-100"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Skill <span className="text-[#5cbdb9]">Radar</span>
            </h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Your real-time aptitude performance across top tech giants.</p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="w-12 h-12 border-4 border-[#5cbdb9]/30 border-t-[#5cbdb9] rounded-full animate-spin"></div>
            </div>
          ) : statsData.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 bg-[#5cbdb9]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-chart-pie text-3xl text-[#5cbdb9]"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Data Yet!</h3>
              <p className="text-slate-500 mb-8">Take a few company aptitude tests to generate your performance radar.</p>
              <button 
                onClick={() => navigate('/company-prep')} 
                className="bg-[#5cbdb9] text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest hover:bg-[#4aa8a4] shadow-lg shadow-[#5cbdb9]/30 transition-all"
              >
                Start Practicing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              
              {/* Radar Chart Section */}
              <div className="h-[400px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={statsData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Radar 
                      name="Accuracy %" 
                      dataKey="A" 
                      stroke="#5cbdb9" 
                      strokeWidth={3}
                      fill="#5cbdb9" 
                      fillOpacity={0.4} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Stats Breakdown Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6">Company Breakdown</h3>
                {statsData.map((stat, i) => (
                  <div key={i} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex justify-between items-center hover:border-[#5cbdb9]/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[#5cbdb9]">
                        <i className="fas fa-building text-sm"></i>
                      </div>
                      <span className="font-bold text-slate-700">{stat.subject}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-black ${stat.A >= 70 ? 'text-emerald-500' : stat.A >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                        {stat.A}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillDashboard;