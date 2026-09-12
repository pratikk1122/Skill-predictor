import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import MobileBottomNav from "../components/MobileBottomNav";
import { 
  FileText, UploadCloud, ArrowLeft, Download, RefreshCw, 
  CheckCircle2, AlertTriangle, XCircle, Lightbulb, Target, 
  Zap, ShieldCheck, Sparkles, ArrowUpRight
} from "lucide-react";

const ResumeScorer = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [targetJob, setTargetJob] = useState("");
  const [fileBase64, setFileBase64] = useState("");

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

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileBase64(event.target.result.split(",")[1]);
    };
    reader.readAsDataURL(file);

    setError("");
    setFileName(file.name);
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
      setError(err.response?.data?.message || "Server Error. Please try again later.");
    } finally {
      setIsScanning(false);
    }
  };

  const quickRoles = [
    "Fullstack Developer",
    "Frontend React Engineer",
    "Backend Node.js SDE",
    "Data Analyst / Scientist",
    "TCS Digital / Infosys DSE"
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-sky-400 selection:text-slate-950 pb-28 md:pb-12 relative">
      {/* Subtle Grid Backdrop */}
      <div className="absolute top-0 left-0 w-full h-full bg-tech-grid opacity-60 pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10 relative z-10">
        
        {/* ================= HEADER SECTION ================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white border-2 border-slate-900 rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#090d16]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">
                PROTOCOL 01 // NEURAL ATS PARSER v3.2
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
              ATS Resume Intelligence
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
              Calibrate your CV against enterprise applicant tracking systems with instant scoring.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            {result && (
              <button
                onClick={downloadAnnotatedPDF}
                disabled={isGeneratingPDF}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 border-2 border-slate-900 rounded-xl text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#090d16] active:scale-95 disabled:opacity-50 transition-all"
              >
                <Download size={14} className={isGeneratingPDF ? "animate-bounce" : ""} />
                <span>{isGeneratingPDF ? "Compiling PDF..." : "Export Annotated PDF"}</span>
              </button>
            )}

            <Link
              to="/student"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-900 rounded-xl text-xs font-black uppercase tracking-wider text-slate-900 hover:bg-slate-50 shadow-[2px_2px_0px_0px_#090d16] active:scale-95 transition-all"
            >
              <ArrowLeft size={14} />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-rose-50 border-2 border-rose-500 text-rose-900 p-4 rounded-xl mb-6 shadow-[3px_3px_0px_0px_#e11d48] flex items-center gap-3 font-bold text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= INGESTION / UPLOAD DECK ================= */}
        {!result && !isScanning && (
          <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-12 md:p-16 text-center shadow-[6px_6px_0px_0px_#090d16]">
            
            {/* Steps indicator */}
            <div className="flex justify-center items-center gap-2 sm:gap-4 mb-8 font-mono text-[10px] sm:text-xs font-black uppercase text-slate-400">
              <span className="text-sky-600 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">01 UPLOAD CV</span>
              <span>→</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-600">02 TARGET ROLE</span>
              <span>→</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-600">03 ATS TELEMETRY</span>
            </div>

            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-sky-600 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0ea5e9]">
              <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">
              Ingest Document For Deep Scan
            </h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto text-xs sm:text-sm font-medium">
              Upload your PDF or DOCX file to initiate an ATS compliance breakdown, keyword reconciliation, and annotated corrections.
            </p>

            {/* Target Role Specification Deck */}
            <div className="max-w-xl mx-auto mb-8 text-left bg-slate-50 p-5 rounded-2xl border-2 border-slate-900 shadow-inner">
              <label htmlFor="target-job-input" className="block font-mono text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2">
                // TARGET_ENTERPRISE_ROLE <span className="text-slate-400 font-normal">(OPTIONAL FOR KEYWORD ALIGNMENT)</span>
              </label>
              <input
                id="target-job-input"
                type="text"
                value={targetJob}
                onChange={(e) => setTargetJob(e.target.value)}
                placeholder="e.g. Google SDE 1, Amazon Fullstack Intern, TCS Digital Developer"
                className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-all shadow-sm"
              />
              
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[9px] font-black text-slate-400 uppercase mr-1">Suggested:</span>
                {quickRoles.map((role, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setTargetJob(role)}
                    className="font-mono text-[9px] font-bold bg-white text-slate-700 border border-slate-300 px-2 py-0.5 rounded hover:border-sky-500 hover:text-sky-600 transition-colors"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <input type="file" id="resume-upload" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx" />
            <label
              htmlFor="resume-upload"
              className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black uppercase tracking-widest text-xs sm:text-sm rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#090d16] hover:shadow-[6px_6px_0px_0px_#0ea5e9] cursor-pointer transition-all active:scale-95"
            >
              <FileText size={18} />
              <span>Select Resume File</span>
            </label>

            <div className="mt-8 flex justify-center items-center gap-4 sm:gap-6 font-mono text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>✓ PDF FORMAT</span>
              <span>•</span>
              <span>✓ DOCX FORMAT</span>
              <span>•</span>
              <span>✓ OCR VERIFIED</span>
            </div>
          </div>
        )}

        {/* ================= SCANNING / TELEMETRY RUNNING ================= */}
        {isScanning && (
          <div className="bg-white rounded-3xl p-16 sm:p-24 text-center border-2 border-slate-900 shadow-[6px_6px_0px_0px_#090d16]">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-400 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#090d16] flex items-center justify-center mx-auto mb-8 animate-spin">
              <Zap className="text-slate-950 fill-current w-8 h-8" />
            </div>
            <span className="font-mono text-xs font-black text-sky-600 uppercase tracking-widest block mb-2">
              // TELEMETRY RUNNING
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">
              Executing Neural ATS Cross-Reference...
            </h2>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-wider">
              Target: {fileName} • Cross-referencing industry keyword matrices
            </p>
          </div>
        )}

        {/* ================= RESULTS TELEMETRY DASHBOARD ================= */}
        {result && !isScanning && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Top Grid: ATS Score & Skill Breakdown */}
            <div className="grid lg:grid-cols-3 gap-6">
              
              {/* Score Gauge Card */}
              <div className="lg:col-span-1 bg-slate-950 rounded-2xl p-8 text-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_#0ea5e9] flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-tech-grid-dark opacity-30 pointer-events-none"></div>
                <span className="font-mono text-xs font-black text-sky-400 uppercase tracking-widest mb-6">
                  // ATS COMPLIANCE RATING
                </span>
                
                <div className="text-7xl sm:text-8xl font-black mb-4 tracking-tighter text-white font-sans">
                  {result.overallScore}<span className="text-sky-400 text-4xl">%</span>
                </div>

                <div className={`px-4 py-1.5 rounded-lg font-mono font-black text-[11px] uppercase tracking-wider border-2 ${
                  result.overallScore >= 75 
                    ? "border-emerald-400 bg-emerald-950 text-emerald-300" 
                    : "border-amber-400 bg-amber-950 text-amber-300"
                }`}>
                  {result.overallScore >= 75 ? "HIGH RECRUITER READINESS" : "OPTIMIZATION REQUIRED"}
                </div>
                
                <p className="text-slate-400 text-xs mt-6 font-medium">
                  {fileName ? `File: ${fileName}` : "Target Profile Loaded"}
                </p>
              </div>

              {/* Skill Analytics Breakdown */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border-2 border-slate-900 shadow-[4px_4px_0px_0px_#090d16]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-mono text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                    <Target size={16} className="text-sky-600" />
                    <span>// SKILL & FORMAT TELEMETRY</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">4 KEY VECTORS</span>
                </div>
                
                <div className="grid gap-5">
                  {result.breakdown && Object.entries(result.breakdown).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-black text-xs uppercase tracking-tight text-slate-800">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <span className="font-mono font-black text-sky-600 text-xs">{value}%</span>
                      </div>
                      <div className="h-3.5 bg-slate-100 rounded-lg p-0.5 border border-slate-300">
                        <div 
                          className="h-full bg-slate-900 rounded-md transition-all duration-700" 
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Redlines Grammar & Spelling Corrections */}
            {result.redlineErrors && result.redlineErrors.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-rose-500 shadow-[4px_4px_0px_0px_#f43f5e]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-mono text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                    <XCircle size={16} />
                    <span>// DETECTED GRAMMAR & SYNTAX REDLINES ({result.redlineErrors.length})</span>
                  </h3>
                  <span className="font-mono text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                    CORRECTIONS ATTACHED
                  </span>
                </div>

                <div className="grid gap-3">
                  {result.redlineErrors.map((err, idx) => (
                    <div key={idx} className="p-4 bg-rose-50/50 rounded-xl border border-rose-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          Original: <span className="text-rose-600 underline decoration-wavy decoration-rose-400 font-black">{err.original}</span>
                        </p>
                        <p className="text-xs font-black text-emerald-700 mt-1">
                          Correction: {err.correction}
                        </p>
                      </div>
                      <span className="font-mono text-[9px] bg-rose-500 text-white px-2.5 py-1 rounded font-black uppercase">
                        {err.type || "ERROR"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Middle Grid: Recruiter Impression & Risk Factors */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Recruiter Impression */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#090d16]">
                <h3 className="font-mono text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Sparkles size={16} className="text-sky-600" />
                  <span>// RECRUITER 6-SECOND SIMULATION</span>
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl font-black text-slate-900">
                    {result.recruiterSimulation?.firstImpressionScore}
                    <span className="text-xl text-slate-400">/10</span>
                  </div>
                  <div className="font-mono text-[10px] font-black uppercase text-slate-500 tracking-wider">
                    Recruiter Eye-Tracking Rating
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs sm:text-sm leading-relaxed">
                  {result.recruiterSimulation?.recruiterAttentionSummary}
                </div>
              </div>

              {/* Risk Factors */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#090d16]">
                <h3 className="font-mono text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span>// DETECTED RISK VECTORS</span>
                </h3>
                <div className="space-y-3">
                  {result.riskAnalysis && Object.entries(result.riskAnalysis).map(([key, value]) => (
                    <div key={key} className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                      <span className="font-mono text-[9px] font-black uppercase text-amber-800 tracking-wider block mb-0.5">
                        {key}
                      </span>
                      <p className="text-slate-800 text-xs font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Critical Mistakes & Strategic Suggestions */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Critical Mistakes */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#090d16]">
                <h3 className="font-mono text-xs font-black text-rose-600 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <XCircle size={16} />
                  <span>// CRITICAL OMISSIONS</span>
                </h3>
                <div className="space-y-3">
                  {result.mistakes?.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start p-3.5 bg-slate-50 rounded-xl text-slate-800 text-xs font-bold border border-slate-200">
                      <span className="font-mono text-rose-500 font-black mt-0.5">0{i + 1}</span>
                      <p className="leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Suggestions */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#090d16]">
                <h3 className="font-mono text-xs font-black text-sky-600 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Lightbulb size={16} />
                  <span>// STRATEGIC REFINEMENTS</span>
                </h3>
                <div className="space-y-3">
                  {result.suggestions?.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start p-3.5 bg-sky-50/50 rounded-xl text-slate-800 text-xs font-bold border border-sky-200">
                      <span className="font-mono text-sky-600 font-black mt-0.5">0{i + 1}</span>
                      <p className="leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ATS Target Role Keyword Matching Section */}
            {result.missingKeywords && result.missingKeywords.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#090d16]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-mono text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                      <Target size={16} className="text-sky-600" />
                      <span>// HIGH-PRIORITY ATS KEYWORDS TO INSERT</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Integrate these missing industry-standard skills into your experience bullets to maximize ATS parsing scores.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto font-mono text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white px-3 py-1 rounded-lg">
                    {result.missingKeywords.length} MISSING
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((keyword, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 bg-slate-50 text-slate-800 font-mono font-bold text-xs rounded-lg border-2 border-slate-300 inline-flex items-center gap-1.5"
                    >
                      <span className="text-sky-600">+</span> {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions Deck */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 pb-12">
              <button
                onClick={() => { setResult(null); setFileName(""); setError(""); setFileBase64(""); }}
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0ea5e9] transition-all active:scale-95"
              >
                <RefreshCw size={16} />
                <span>Scan Another Document</span>
              </button>

              {fileBase64 && (
                <button
                  onClick={downloadAnnotatedPDF}
                  disabled={isGeneratingPDF}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-sky-400 hover:bg-sky-300 text-slate-950 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs border-2 border-slate-900 shadow-[4px_4px_0px_0px_#090d16] transition-all active:scale-95 disabled:opacity-50"
                >
                  <Download size={16} />
                  <span>{isGeneratingPDF ? "Compiling PDF..." : "Export Annotated Resume"}</span>
                </button>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default ResumeScorer;