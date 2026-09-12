import React, { useState, useRef } from "react";
import api from "../services/api";
import { jsPDF } from "jspdf";
import { useNavigate, Link } from "react-router-dom";
import MobileBottomNav from "../components/MobileBottomNav";
import {
  UploadCloud,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  ArrowLeft,
  FileCheck,
  Award,
  CheckCircle2,
  Download,
  Zap,
  Radio,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Terminal
} from "lucide-react";

const AIInterview = () => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [transcript, setTranscript] = useState([]);

  const recognitionRef = useRef(null);

  /* ================= TEXT TO SPEECH ================= */
  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
  };

  /* ================= SPEECH TO TEXT ================= */
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your response.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const recordedTranscript = event.results[0][0].transcript;
      setAnswer((prev) => (prev ? `${prev} ${recordedTranscript}` : recordedTranscript));
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  /* ================= START INTERVIEW ================= */
  const handleStartInterview = async () => {
    if (!file) {
      alert("Please upload your resume to generate customized interview questions.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("difficulty", difficulty);

      const response = await api.post("/interview/start", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setSessionId(response.data.sessionId);
      setCurrentQuestion(response.data.question);

      speakQuestion(response.data.question);
    } catch {
      alert("Failed to initiate interview session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBMIT ANSWER ================= */
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please provide a spoken or typed response before submitting.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/interview/answer",
        { sessionId, answer },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.completed) {
        setCompleted(true);
        setOverallScore(response.data.overallScore);
        setTranscript(response.data.transcript);
        return;
      }

      setCurrentQuestion(response.data.nextQuestion);
      setAnswer("");

      speakQuestion(response.data.nextQuestion);
    } catch {
      alert("Error transmitting answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PDF REPORT GENERATOR ================= */
  const downloadReport = () => {
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(20);
    doc.text("SkillPredictor AI Interview Report", 10, y);
    y += 10;

    doc.setFontSize(14);
    doc.text(`Candidate Overall Proficiency: ${overallScore}%`, 10, y);
    y += 12;

    transcript.forEach((item, index) => {
      doc.setFontSize(12);
      doc.text(`Q${index + 1}: ${item.question}`, 10, y);
      y += 8;

      doc.setFontSize(10);
      doc.text(`Answer: ${item.answer || "No response recorded"}`, 10, y);
      y += 8;

      if (item.feedback) {
        doc.text(
          `Scores -> Technical: ${item.feedback.technical_score}/10 | Communication: ${item.feedback.communication_score}/10 | Confidence: ${item.feedback.confidence_score}/10`,
          10,
          y
        );
        y += 8;

        if (item.feedback.improvement?.length) {
          item.feedback.improvement.forEach((imp) => {
            doc.text(
              `Suggestion (${imp.category}): ${imp.description}`,
              10,
              y
            );
            y += 7;
          });
        }
      }

      y += 6;

      if (y > 265) {
        doc.addPage();
        y = 15;
      }
    });

    doc.save("SkillPredictor_Interview_Report.pdf");
  };

  /* ================= FINAL REPORT / DEBRIEF UI ================= */
  if (completed) {
    return (
      <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-sky-400 selection:text-slate-950 p-4 sm:p-6 md:p-10 pb-28 md:pb-12 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-tech-grid opacity-60 pointer-events-none z-0"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          
          {/* Header */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#090d16] mb-8 text-center">
            <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#090d16]">
              <Award size={28} className="text-slate-950" />
            </div>
            <span className="font-mono text-xs font-black text-sky-600 uppercase tracking-widest block mb-1">
              // INTERVIEW DEBRIEF COMPLETED
            </span>
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 mb-2">
              Performance Telemetry Dossier
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              Review your technical accuracy, vocal clarity, and strategic improvement areas.
            </p>
          </div>

          {/* Score Hero & Action Deck */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-950 text-white border-2 border-slate-900 rounded-2xl p-8 text-center shadow-[4px_4px_0px_0px_#0ea5e9] flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-tech-grid-dark opacity-20 pointer-events-none"></div>
              <span className="font-mono text-xs font-black text-sky-400 uppercase tracking-widest mb-3">
                GLOBAL INTERVIEW ACCURACY
              </span>
              <div className="text-7xl sm:text-8xl font-black tracking-tighter text-white font-sans mb-3">
                {overallScore}<span className="text-sky-400 text-4xl">%</span>
              </div>
              <span className="font-mono text-xs font-black uppercase px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
                AI CALIBRATED STANDARD
              </span>
            </div>

            <div className="flex flex-col justify-center space-y-4">
              <button
                onClick={downloadReport}
                className="w-full bg-sky-400 hover:bg-sky-300 text-slate-950 p-5 rounded-xl font-black uppercase tracking-wider text-xs sm:text-sm border-2 border-slate-900 shadow-[4px_4px_0px_0px_#090d16] flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <Download size={18} />
                <span>Export Dossier (PDF)</span>
              </button>
              
              <button
                onClick={() => navigate("/student")}
                className="w-full bg-white hover:bg-slate-50 text-slate-900 p-5 rounded-xl font-black uppercase tracking-wider text-xs sm:text-sm border-2 border-slate-900 shadow-[4px_4px_0px_0px_#090d16] flex items-center justify-center gap-3 transition-all active:scale-95"
              >
                <ArrowLeft size={18} />
                <span>Return to Command Deck</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Transcripts */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <Terminal size={16} className="text-sky-600" />
                <span>// DETAILED QUESTION TELEMETRY</span>
              </h2>
              <span className="font-mono text-xs font-bold text-slate-400">
                {transcript.length} ROUNDS RECORDED
              </span>
            </div>

            {transcript.map((item, index) => (
              <div key={index} className="bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_0px_#090d16]">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-black text-sky-600 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                    ROUND 0{index + 1}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    EVALUATED
                  </span>
                </div>

                <p className="text-sm sm:text-base font-black text-slate-900 mb-4 leading-relaxed">
                  {item.question}
                </p>
                
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                  <p className="font-mono text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                    CANDIDATE RESPONSE RECORD:
                  </p>
                  <p className="text-xs sm:text-sm text-slate-800 font-medium italic">
                    "{item.answer || "No response"}"
                  </p>
                </div>

                {item.feedback && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-xl border-2 border-slate-200 text-center">
                      <p className="font-mono text-[9px] font-black uppercase text-slate-400">Technical</p>
                      <p className="text-lg font-black text-slate-900 mt-0.5">{item.feedback.technical_score}/10</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border-2 border-slate-200 text-center">
                      <p className="font-mono text-[9px] font-black uppercase text-slate-400">Communication</p>
                      <p className="text-lg font-black text-sky-600 mt-0.5">{item.feedback.communication_score}/10</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border-2 border-slate-200 text-center">
                      <p className="font-mono text-[9px] font-black uppercase text-slate-400">Confidence</p>
                      <p className="text-lg font-black text-emerald-600 mt-0.5">{item.feedback.confidence_score}/10</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <MobileBottomNav />
      </div>
    );
  }

  /* ================= ACTIVE INTERVIEW / SETUP UI ================= */
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-slate-900 selection:bg-sky-400 selection:text-slate-950 p-4 sm:p-6 md:p-10 pb-28 md:pb-12 relative">
      <div className="absolute top-0 left-0 w-full h-full bg-tech-grid opacity-60 pointer-events-none z-0"></div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Studio Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white border-2 border-slate-900 rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_0px_#090d16]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">
                PROTOCOL 02 // NEURAL AUDIO SIMULATOR
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black uppercase tracking-tight text-slate-900">
              AI Mock Interview Studio
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">
              Simulate technical and HR interviews with speech-to-text dialogue analysis.
            </p>
          </div>
          
          <Link
            to="/student"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-900 rounded-xl text-xs font-black uppercase tracking-wider text-slate-900 hover:bg-slate-50 shadow-[2px_2px_0px_0px_#090d16] active:scale-95 transition-all"
          >
            <ArrowLeft size={14} />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* SETUP SCREEN */}
        {!sessionId ? (
          <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-12 md:p-16 text-center shadow-[6px_6px_0px_0px_#090d16] flex flex-col items-center">
            
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-500 rounded-2xl flex items-center justify-center mb-6 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#090d16]">
              <Radio size={32} className="text-slate-950 animate-pulse" />
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 mb-2">
              Initialize Interview Studio
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-md mb-8">
              Upload your resume so our AI neural engine can generate adaptive interview questions tailored directly to your skills.
            </p>

            {/* Resume Upload Box */}
            <div className="w-full max-w-md mb-8">
              <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-sky-500 hover:bg-sky-50/30 transition-all group bg-slate-50">
                <div className="flex flex-col items-center justify-center p-4">
                  <UploadCloud className="w-10 h-10 text-sky-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider text-center">
                    {file ? file.name : "Choose Resume (PDF or DOCX)"}
                  </p>
                  <p className="font-mono text-[10px] text-slate-400 uppercase mt-1">
                    {file ? "File Loaded • Ready to Ingest" : "Click to Browse Local Document"}
                  </p>
                </div>
                <input type="file" className="hidden" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} />
              </label>
            </div>

            {/* Difficulty Selector Chips */}
            <div className="w-full max-w-md mb-10 text-left">
              <span className="block font-mono text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2 text-center">
                // SELECT CHALLENGE MATRIX
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { level: "easy", label: "WARM-UP" },
                  { level: "medium", label: "STANDARD" },
                  { level: "hard", label: "EXTREME" }
                ].map(({ level, label }) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-3 rounded-xl font-mono text-[10px] font-black uppercase tracking-wider transition-all border-2 flex items-center justify-center gap-1 ${
                      difficulty === level
                        ? "bg-slate-950 border-slate-950 text-sky-400 shadow-[3px_3px_0px_0px_#0ea5e9]"
                        : "bg-white border-slate-300 text-slate-600 hover:border-slate-800"
                    }`}
                  >
                    {difficulty === level && <Zap size={12} fill="currentColor" />}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartInterview}
              disabled={loading}
              className="w-full max-w-md bg-sky-400 hover:bg-sky-300 text-slate-950 py-4 sm:py-5 rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm border-2 border-slate-900 shadow-[4px_4px_0px_0px_#090d16] hover:shadow-[6px_6px_0px_0px_#0ea5e9] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>CALIBRATING QUESTIONS...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>LAUNCH INTERVIEW SESSION</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* ACTIVE INTERVIEW STUDIO */
          <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-10 shadow-[6px_6px_0px_0px_#090d16]">
            
            {/* Live Indicator Bar */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
                <span className="font-mono text-xs font-black uppercase tracking-wider text-rose-600">
                  LIVE INTERVIEW ACTIVE
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                  SPEECH ENGINE READY
                </span>
              </div>
            </div>

            {/* Question Prompt Terminal */}
            <div className="bg-slate-950 text-white rounded-2xl p-6 sm:p-8 mb-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0ea5e9] relative overflow-hidden">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest text-sky-400 block mb-2">
                    // QUESTION DECK
                  </span>
                  <p className="text-base sm:text-xl font-bold leading-relaxed">
                    {currentQuestion}
                  </p>
                </div>
                <button 
                  onClick={() => speakQuestion(currentQuestion)}
                  title="Replay Audio Prompt"
                  className="w-11 h-11 bg-slate-900 border border-slate-700 hover:border-sky-400 rounded-xl flex items-center justify-center text-sky-400 hover:text-white shrink-0 transition-colors"
                >
                  <Volume2 size={20} />
                </button>
              </div>
            </div>

            {/* Answer Input Deck */}
            <div className="mb-6">
              <label className="block font-mono text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
                // CANDIDATE_RESPONSE_BUFFER (DICTATE OR TYPE)
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Structure your thoughts clearly. Use the dictation button below to speak directly, or type your response here..."
                className="w-full h-48 bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 sm:p-6 text-xs sm:text-sm font-medium text-slate-900 focus:border-sky-500 focus:bg-white outline-none transition-all resize-none shadow-inner"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!listening ? (
                <button
                  onClick={startListening}
                  className="flex-1 bg-white border-2 border-slate-900 hover:bg-slate-50 text-slate-900 py-4 rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2.5 shadow-[3px_3px_0px_0px_#090d16] active:scale-95 transition-all"
                >
                  <Mic size={16} className="text-sky-600" />
                  <span>Start Vocal Dictation</span>
                </button>
              ) : (
                <button
                  onClick={stopListening}
                  className="flex-1 bg-rose-600 text-white py-4 rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2.5 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#090d16] animate-pulse active:scale-95 transition-all"
                >
                  <MicOff size={16} />
                  <span>Recording Audio... Click to Stop</span>
                </button>
              )}

              <button
                onClick={handleSubmitAnswer}
                disabled={loading}
                className="flex-1 bg-sky-400 hover:bg-sky-300 text-slate-950 py-4 rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2.5 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#090d16] hover:shadow-[4px_4px_0px_0px_#0ea5e9] transition-all disabled:opacity-50 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>ANALYZING ANSWER...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Response</span>
                    <ArrowUpRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default AIInterview;