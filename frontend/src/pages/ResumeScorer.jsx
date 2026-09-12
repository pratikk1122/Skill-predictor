import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import MobileBottomNav from "../components/MobileBottomNav";
import BoundedInput from "../components/common/BoundedInput";
import LoadingTelemetry from "../components/common/LoadingTelemetry";
import { ScoreCardSkeleton } from "../components/common/Skeleton";
import PrivacyBadge from "../components/common/PrivacyBadge";
import useCooldown from "../hooks/useCooldown";
import { sanitizeFileName } from "../utils/sanitize";
import { 
  FileText, UploadCloud, ArrowLeft, Download, Share2, 
  Check, RefreshCw, CheckCircle2, AlertCircle, Sparkles, 
  Target, ShieldCheck 
} from "lucide-react";

const ResumeScorer = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [targetJob, setTargetJob] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [copiedSummary, setCopiedSummary] = useState(false);

  const { isCoolingDown, trigger: triggerWithCooldown } = useCooldown(2000);

  const downloadAnnotatedPDF = async () => {
    if (!result || !fileBase64) return;
    setIsGeneratingPDF(true);
    try {
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

      const response = await axios.post(
        `${API_URL}/resume-intelligence/download-annotated`,
        {
          redlineErrors: result.redlineErrors,
          fileBuffer: fileBase64,
          fileName: fileName
        },
        { 
          responseType: "blob",
          headers: {
            "Authorization": `Bearer ${token}`
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

  const copyShareableSummary = async () => {
    if (!result) return;
    const summaryText = `🎯 **SkillPredictor ATS Performance Report**
📁 File: ${fileName || "Resume"}
📊 **Overall ATS Score:** ${result.overallScore}% (${result.overallScore >= 75 ? "Strong Candidate" : "Needs Optimization"})
👁️ **Recruiter First Impression:** ${result.recruiterSimulation?.firstImpressionScore || "N/A"}/10

📈 **Score Breakdown:**
${result.breakdown ? Object.entries(result.breakdown).map(([k, v]) => `• ${k}: ${v}%`).join("\n") : "• Analysis complete"}

💡 **Top Strategic Suggestion:**
"${result.suggestions?.[0] || "Optimize keyword frequency for your target role."}"

🔒 Verified via SkillPredictor AI Telemetry`;

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      alert("Failed to copy summary to clipboard.");
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

    const safeName = sanitizeFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileBase64(event.target.result.split(",")[1]);
    };
    reader.readAsDataURL(file);

    setError("");
    setFileName(safeName);
    setIsScanning(true);

    try {
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
            "Authorization": `Bearer ${token}`
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
      setError(err.response?.data?.message || "Analysis request failed or timed out. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 selection:bg-teal-500/20 pb-28 md:pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-teal-600/20 rotate-3">
                <FileText size={20} />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Skill<span className="text-teal-600 dark:text-teal-400">Predictor</span> ATS Scorer
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Enterprise ATS analysis, recruiter simulation, and redline annotations.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {result && (
              <>
                <button
                  type="button"
                  onClick={copyShareableSummary}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                  {copiedSummary ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                  <span>{copiedSummary ? "Copied to Clipboard!" : "Copy Summary"}</span>
                </button>

                <button
                  type="button"
                  onClick={triggerWithCooldown(downloadAnnotatedPDF)}
                  disabled={isGeneratingPDF || isCoolingDown}
                  className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-teal-600/20 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <Download size={14} className={isGeneratingPDF ? "animate-bounce" : ""} />
                  <span>{isGeneratingPDF ? "Compiling PDF..." : "Download Annotated Resume"}</span>
                </button>
              </>
            )}

            <Link
              to="/student"
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-teal-400 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={14} />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 p-4 sm:p-5 rounded-r-2xl mb-8 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-bold">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError("")}
              className="px-3 py-1 bg-white dark:bg-slate-800 text-xs font-bold rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* UPLOAD & INPUT DECK */}
        {!result && !isScanning && (
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.5rem] border border-slate-200/80 dark:border-slate-800 p-8 sm:p-14 text-center shadow-xl">
            <div className="w-20 h-20 bg-teal-50 dark:bg-teal-950/40 rounded-3xl flex items-center justify-center mx-auto mb-6 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/40">
              <UploadCloud className="w-10 h-10" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
              Analyze Your Resume Potential
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-lg mx-auto text-xs sm:text-sm font-medium leading-relaxed">
              Upload your document to generate an in-depth ATS match score, recruiter eye-tracking simulation, and actionable redline corrections.
            </p>

            {/* Bounded Target Role Input */}
            <div className="max-w-md mx-auto mb-8 text-left bg-slate-50/60 dark:bg-slate-800/40 p-4 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
              <BoundedInput
                id="target-role-input"
                label="Target Company / Role (Optional)"
                placeholder="e.g. Google SDE 1, Amazon Fullstack Intern, TCS Digital"
                value={targetJob}
                onChange={(val) => setTargetJob(val)}
                maxChars={120}
                minChars={0}
                maxWords={15}
                helperText="Customizes keyword matching to your dream role."
              />
            </div>

            <input type="file" id="resume-upload" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx" />
            <label
              htmlFor="resume-upload"
              className="inline-flex items-center gap-3 px-10 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold uppercase tracking-wider text-xs sm:text-sm shadow-xl shadow-teal-600/20 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <FileText size={18} />
              <span>Select Document (PDF/DOCX)</span>
            </label>
            <div className="mt-8 flex justify-center gap-6 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">
              <span>PDF Supported</span> • <span>DOCX Supported</span> • <span>Max 10MB</span>
            </div>
          </div>
        )}

        {/* LOADING TELEMETRY STATE */}
        {isScanning && (
          <div className="py-8">
            <LoadingTelemetry
              title="Neural ATS Ingestion Running"
              subtitle={`Cross-referencing ${fileName || 'resume'} against enterprise keyword databases`}
            />
            <div className="mt-8">
              <ScoreCardSkeleton />
            </div>
          </div>
        )}

        {/* RESULTS SECTIONS */}
        {result && !isScanning && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Redline Errors Section */}
            {result.redlineErrors && result.redlineErrors.length > 0 && (
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-rose-200/80 dark:border-rose-900/50 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>Spelling & Grammar Redlines ({result.redlineErrors.length})</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-800">
                    Included in Annotated PDF
                  </span>
                </div>
                <div className="grid gap-3">
                  {result.redlineErrors.map((error, idx) => (
                    <div key={idx} className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Detected: <span className="text-rose-600 dark:text-rose-400 underline decoration-wavy decoration-rose-400 font-bold">{error.original}</span>
                        </p>
                        <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-1">
                          Correction: {error.correction}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono bg-rose-200/60 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded uppercase">
                        {error.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Score & Breakdown Cards */}
            <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* ATS Performance Gauge */}
              <div className="lg:col-span-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
                <span className="text-teal-600 dark:text-teal-400 font-bold uppercase tracking-widest text-[10px] mb-4">
                  ATS Match Rating
                </span>
                <div className="text-7xl sm:text-8xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                  {result.overallScore}<span className="text-teal-600 dark:text-teal-400 text-4xl">%</span>
                </div>
                <div className={`px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider border ${
                  result.overallScore >= 75 
                    ? "border-teal-500 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300" 
                    : "border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                }`}>
                  {result.overallScore >= 75 ? "Strong Candidate" : "Needs Optimization"}
                </div>
                <p className="text-[11px] text-slate-400 mt-6 font-medium">
                  File: {fileName}
                </p>
              </div>

              {/* Skill Analytics Breakdown */}
              <div className="lg:col-span-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="text-sm font-bold mb-6 text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Target size={16} className="text-teal-600 dark:text-teal-400" />
                  <span>Category Breakdown</span>
                </h3>
                <div className="grid gap-5">
                  {result.breakdown && Object.entries(result.breakdown).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">{value}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/40 dark:border-slate-700/40">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-1000" 
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recruiter Impression & Risk Factors */}
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <Sparkles size={16} className="text-teal-600 dark:text-teal-400" />
                  <span>Recruiter 6-Second Simulation</span>
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl font-black text-teal-600 dark:text-teal-400">
                    {result.recruiterSimulation?.firstImpressionScore}
                    <span className="text-xl text-slate-400">/10</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider leading-tight">
                    Eye-Tracking<br/>Impact Rating
                  </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium leading-relaxed">
                  {result.recruiterSimulation?.recruiterAttentionSummary}
                </div>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <AlertCircle size={16} className="text-amber-500" />
                  <span>Detected Risk Factors</span>
                </h3>
                <div className="space-y-3">
                  {result.riskAnalysis && Object.entries(result.riskAnalysis).map(([key, value]) => (
                    <div key={key} className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-900/40">
                      <span className="text-[9px] font-mono font-bold uppercase text-amber-700 dark:text-amber-300 tracking-wider block mb-0.5">
                        {key}
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 text-xs font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Critical Mistakes & Strategic Suggestions */}
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border-t-4 border-t-rose-500 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-bold mb-6 text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-500" />
                  <span>Critical Omissions</span>
                </h3>
                <div className="space-y-3">
                  {result.mistakes?.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-100 dark:border-slate-700/50">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border-t-4 border-t-teal-500 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <h3 className="text-xs font-bold mb-6 text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles size={16} className="text-teal-500" />
                  <span>Strategic Suggestions</span>
                </h3>
                <div className="space-y-3">
                  {result.suggestions?.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start p-3.5 bg-teal-50/40 dark:bg-teal-950/20 rounded-2xl text-slate-700 dark:text-slate-200 text-xs font-medium border border-teal-100 dark:border-teal-900/40">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* High-Priority ATS Keywords Section */}
            {result.missingKeywords && result.missingKeywords.length > 0 && (
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Target size={16} className="text-teal-600 dark:text-teal-400" />
                      <span>Recommended Industry Keywords To Add</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Incorporate these standard skills into your bullets to maximize automated keyword screen pass rates.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800">
                    {result.missingKeywords.length} Keywords Missing
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((keyword, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs rounded-xl border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="text-teal-600 dark:text-teal-400 font-bold">+</span> {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons & Privacy Badge */}
            <div className="flex flex-col items-center pt-8 pb-12 space-y-6">
              <div className="flex flex-wrap justify-center items-center gap-4">
                <button
                  type="button"
                  onClick={() => { setResult(null); setFileName(""); setError(""); setFileBase64(""); }}
                  className="flex items-center gap-2 px-8 py-3.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-wider text-xs transition-all shadow-md active:scale-95"
                >
                  <RefreshCw size={14} />
                  <span>Analyze Another Document</span>
                </button>

                <button
                  type="button"
                  onClick={copyShareableSummary}
                  className="flex items-center gap-2 px-8 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold uppercase tracking-wider text-xs transition-all shadow-sm active:scale-95 hover:border-teal-400"
                >
                  {copiedSummary ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                  <span>{copiedSummary ? "Copied!" : "Share Summary"}</span>
                </button>
              </div>

              <PrivacyBadge />
            </div>

          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default ResumeScorer;