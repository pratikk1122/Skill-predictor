import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import MobileBottomNav from "../components/MobileBottomNav";

const ResumeScorer = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [targetJob, setTargetJob] = useState("");
  // ✅ New state to store original file buffer for annotation
  const [fileBase64, setFileBase64] = useState("");

  // ✅ NEW REQUIREMENT: Download Original Resume with Redlines Attached
  const downloadAnnotatedPDF = async () => {
    if (!result || !fileBase64) return;
    setIsGeneratingPDF(true);
    try {
      // ✅ FIX: Get token from localStorage for protected download route
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await axios.post(
        `${API_URL}/resume-intelligence/download-annotated`,
        {
          redlineErrors: result.redlineErrors,
          fileBuffer: fileBase64, // Sending original file for backend annotation
          fileName: fileName
        },
        { 
          responseType: "blob",
          headers: {
            "Authorization": `Bearer ${token}` // ✅ FIX: Added Auth Header
          }
        } 
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Annotated_${fileName}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download Error:", err);
      setError("Failed to download annotated PDF.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload only PDF or DOCX files.");
      return;
    }

    // ✅ Read file as Base64 to store original buffer for later annotation
    const reader = new FileReader();
    reader.onload = (event) => {
      setFileBase64(event.target.result.split(",")[1]);
    };
    reader.readAsDataURL(file);

    setError("");
    setFileName(file.name);
    setIsScanning(true);

    try {
      // ✅ FIX: Get token from localStorage
      const token = localStorage.getItem("token"); 
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", targetJob.trim() || "General Software Engineering Profile");

      const response = await axios.post(
        `${API_URL}/resume-intelligence/analyze`,
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}` // ✅ FIX: Added Auth Header so backend knows WHO uploaded it
          },
        }
      );

      if (response.data.success || response.status === 200) {
        setResult(response.data.data || response.data);
      } else {
        setError("Resume analysis failed. Please try again.");
      }
    } catch (err) {
      console.error("Analysis Error:", err.response?.data);
      setError(err.response?.data?.message || "Server Error. Please try again later.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-teeny-greeny font-sans text-text-dark selection:bg-blue-greeny/20 pb-28 md:pb-10">
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-blue-greeny rounded-xl flex items-center justify-center shadow-lg rotate-3">
                 <i className="fas fa-graduation-cap text-white text-xl"></i>
               </div>
               <h2 className="text-3xl font-heading font-black text-text-dark uppercase tracking-tight">
                 Skill<span className="text-blue-greeny">Predictor</span> Intelligence
               </h2>
            </div>
            <p className="text-xs text-text-light font-bold uppercase tracking-[0.2em] ml-1">
              Advanced ATS Score & Risk Analysis
            </p>
          </div>
          
          <div className="flex gap-4">
            {/* ✅ UPDATED: Download Annotated PDF Button */}
            {result && (
              <button
                onClick={downloadAnnotatedPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-6 py-3 bg-text-dark text-white rounded-xl text-xs font-black hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                <i className={`fas ${isGeneratingPDF ? "fa-spinner animate-spin" : "fa-file-signature"} text-blue-greeny`}></i>
                {isGeneratingPDF ? "Processing PDF..." : "Download Annotated Resume"}
              </button>
            )}

            <Link
              to="/student"
              className="flex items-center gap-2 px-6 py-3 bg-white border border-blue-greeny/20 rounded-xl text-xs font-black text-blue-greeny hover:bg-blue-greeny hover:text-white transition-all shadow-sm active:scale-95"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-white border-l-4 border-red-500 text-red-600 p-5 rounded-r-2xl mb-8 shadow-sm">
            <div className="flex items-center gap-3 font-bold">
              <i className="fas fa-exclamation-circle text-lg"></i>
              {error}
            </div>
          </div>
        )}

        {/* Upload Box */}
        {!result && !isScanning && (
          <div className="bg-white rounded-[2.5rem] border border-blue-greeny/10 p-12 md:p-24 text-center shadow-xl shadow-blue-greeny/5">
            <div className="w-24 h-24 bg-teeny-greeny rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-blue-greeny border border-blue-greeny/5">
              <i className="fas fa-cloud-upload-alt text-4xl"></i>
            </div>
            <h2 className="text-4xl font-heading font-black text-text-dark mb-4 uppercase">Analyze Your Potential</h2>
            <p className="text-text-light mb-8 max-w-lg mx-auto font-bold leading-relaxed">
              Upload your resume to receive a comprehensive ATS evaluation, recruiter simulation, and strategic improvement suggestions.
            </p>

            {/* 🎯 TARGET JOB ROLE / JD INPUT (OPTIONAL) */}
            <div className="max-w-md mx-auto mb-8 text-left bg-slate-50 p-5 rounded-2xl border border-slate-200/80 shadow-inner">
              <label htmlFor="target-job-input" className="block text-[11px] font-black uppercase tracking-wider text-slate-600 mb-2">
                🎯 Target Company / Role <span className="text-slate-400 font-normal">(Optional for ATS Match)</span>
              </label>
              <input
                id="target-job-input"
                type="text"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder="e.g. Infosys Java Developer, TCS Digital SDE, React Intern"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-greeny/30 focus:border-blue-greeny transition-all"
              />
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                Tip: Enter your dream job role to get customized keyword matching recommendations.
              </p>
            </div>

            <input type="file" id="resume-upload" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx" />
            <label
              htmlFor="resume-upload"
              className="bg-blue-greeny hover:bg-blue-greeny-dark text-white px-14 py-5 rounded-2xl font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-blue-greeny/20 inline-flex items-center gap-4 hover:scale-105 active:scale-95"
            >
              <i className="fas fa-file-pdf"></i> Select Document
            </label>
            <div className="mt-10 flex justify-center gap-8 text-[10px] font-black text-text-light uppercase tracking-[0.3em]">
              <span>PDF Ready</span> • <span>DOCX Ready</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isScanning && (
          <div className="bg-white rounded-[3rem] p-24 text-center shadow-xl border border-blue-greeny/10">
            <div className="flex justify-center mb-10">
              <div className="w-24 h-24 border-[10px] border-teeny-greeny border-t-blue-greeny rounded-full animate-spin"></div>
            </div>
            <h2 className="text-3xl font-heading font-black text-text-dark mb-4 uppercase tracking-tight">AI Engine Running...</h2>
            <p className="text-blue-greeny font-black tracking-[0.2em] uppercase text-xs">Cross-referencing industry standards</p>
          </div>
        )}

        {/* Results Sections */}
        {result && !isScanning && (
          <div className="space-y-10 animate-fadeIn">
            
            {/* Redline Highlights Section */}
            {result.redlineErrors && result.redlineErrors.length > 0 && (
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border-2 border-red-500/20">
                <h3 className="text-xs font-black mb-8 text-red-600 uppercase tracking-[0.2em] flex items-center gap-2">
                  <i className="fas fa-marker"></i> Spelling & Grammar Redlines
                </h3>
                <div className="grid gap-4">
                  {result.redlineErrors.map((error, idx) => (
                    <div key={idx} className="p-6 bg-red-50 rounded-2xl border border-red-100 group relative">
                      <p className="text-sm font-bold text-text-dark mb-2">
                        Detected: <span className="text-red-600 underline decoration-wavy decoration-red-400 font-black">{error.original}</span>
                      </p>
                      <p className="text-xs font-black text-blue-greeny uppercase tracking-widest">
                        Correction: {error.correction}
                      </p>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-[10px] bg-red-500 text-white px-3 py-1 rounded-full font-black uppercase">{error.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Score & Breakdown Card */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-text-dark rounded-[3rem] p-12 text-white shadow-2xl flex flex-col items-center justify-center text-center">
                <span className="text-blue-greeny font-black uppercase tracking-widest text-[10px] mb-8">ATS Performance</span>
                <div className="text-8xl font-heading font-black mb-4">
                  {result.overallScore}<span className="text-blue-greeny text-4xl">%</span>
                </div>
                <div className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border-2 ${result.overallScore >= 75 ? "border-blue-greeny text-blue-greeny" : "border-orange-500 text-orange-500"}`}>
                  {result.overallScore >= 75 ? "Strong Candidate" : "Needs Optimization"}
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-[3rem] p-12 border border-blue-greeny/10 shadow-sm">
                <h3 className="text-xl font-heading font-black mb-10 text-text-dark uppercase tracking-widest flex items-center gap-3">
                  <i className="fas fa-tasks text-blue-greeny"></i> Skill Analytics
                </h3>
                <div className="grid gap-8">
                  {result.breakdown && Object.entries(result.breakdown).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-black text-[10px] uppercase tracking-widest text-text-light">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-black text-blue-greeny text-sm">{value}%</span>
                      </div>
                      <div className="h-4 bg-teeny-greeny rounded-full p-1 shadow-inner border border-blue-greeny/5">
                        <div className="h-full bg-blue-greeny rounded-full transition-all duration-1000" style={{ width: `${value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-blue-greeny/5">
                <h3 className="text-xs font-black mb-8 flex items-center gap-3 text-text-dark uppercase tracking-[0.2em]">
                  <i className="fas fa-id-badge text-blue-greeny text-lg"></i> Recruiter Impression
                </h3>
                <div className="flex items-center gap-5 mb-8">
                  <div className="text-6xl font-heading font-black text-blue-greeny">{result.recruiterSimulation?.firstImpressionScore}</div>
                  <div className="text-text-light font-bold uppercase text-[10px] tracking-widest leading-tight">Impact<br/>Rating / 10</div>
                </div>
                <div className="p-8 bg-teeny-greeny rounded-[2rem] border border-blue-greeny/5 text-text-dark font-bold leading-relaxed">
                  {result.recruiterSimulation?.recruiterAttentionSummary}
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-blue-greeny/10 shadow-sm">
                <h3 className="text-xs font-black mb-8 flex items-center gap-3 text-text-dark uppercase tracking-[0.2em]">
                  <i className="fas fa-exclamation-triangle text-orange-500 text-lg"></i> Risk Factors
                </h3>
                <div className="space-y-6">
                  {result.riskAnalysis && Object.entries(result.riskAnalysis).map(([key, value]) => (
                    <div key={key} className="bg-teeny-greeny/50 p-4 rounded-2xl border border-blue-greeny/5">
                      <span className="text-[9px] font-black uppercase text-blue-greeny tracking-widest block mb-1">{key}</span>
                      <p className="text-text-dark text-sm font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Lists */}
            <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-8 border-red-500">
                  <h3 className="text-xs font-black mb-8 text-text-dark uppercase tracking-[0.2em] flex items-center gap-2">
                    <i className="fas fa-times-circle text-red-500"></i> Critical Mistakes
                  </h3>
                  <div className="space-y-4">
                    {result.mistakes?.map((item, i) => (
                      <div key={i} className="flex gap-4 items-center p-5 bg-slate-50 rounded-2xl text-text-dark text-sm font-bold border border-slate-100">
                        <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></div>
                        {item}
                      </div>
                    ))}
                  </div>
               </div>

               <div className="bg-white p-10 rounded-[3rem] shadow-xl border-t-8 border-blue-greeny">
                  <h3 className="text-xs font-black mb-8 text-text-dark uppercase tracking-[0.2em] flex items-center gap-2">
                    <i className="fas fa-lightbulb text-blue-greeny"></i> Strategic Suggestions
                  </h3>
                  <div className="space-y-4">
                    {result.suggestions?.map((item, i) => (
                      <div key={i} className="flex gap-4 items-center p-5 bg-teeny-greeny rounded-2xl text-text-dark text-sm font-bold border border-blue-greeny/10">
                        <div className="w-2 h-2 bg-blue-greeny rounded-full flex-shrink-0"></div>
                        {item}
                      </div>
                    ))}
                  </div>
               </div>
            </div>

            {/* 🎯 ATS Target Role Keyword Matching Section */}
            {result.missingKeywords && result.missingKeywords.length > 0 && (
              <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-xl border-2 border-teal-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-black text-teal-800 uppercase tracking-wider flex items-center gap-2">
                      <i className="fas fa-bullseye text-teal-600"></i> High-Priority ATS Keywords To Add
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Include these industry-standard skills in your projects or summary to significantly improve your recruiter screening score.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto text-[10px] font-black uppercase tracking-widest bg-teal-50 text-teal-700 px-3 py-1.5 rounded-xl border border-teal-200">
                    {result.missingKeywords.length} Keywords Missing
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {result.missingKeywords.map((keyword, i) => (
                    <span 
                      key={i} 
                      className="px-3.5 py-1.5 bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 font-bold text-xs rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-1.5"
                    >
                      <i className="fas fa-plus text-[9px] text-teal-600"></i> {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Reset Button */}
            <div className="flex flex-col items-center pt-16 pb-20">
              <button
                onClick={() => { setResult(null); setFileName(""); setError(""); setFileBase64(""); }}
                className="group flex items-center gap-4 bg-text-dark text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl"
              >
                <i className="fas fa-sync-alt group-hover:rotate-180 transition-transform duration-500 text-blue-greeny"></i>
                Analyze Another Resume
              </button>
              <div className="mt-8 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-greeny rounded-full animate-pulse"></div>
                <p className="text-text-light text-[10px] font-black uppercase tracking-[0.4em]">Intelligence Powered by SkillPredictor</p>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 📱 Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

export default ResumeScorer;