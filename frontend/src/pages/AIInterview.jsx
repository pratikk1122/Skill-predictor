import React, { useState, useRef } from "react";
import api from "../services/api";
import { jsPDF } from "jspdf";
import { useNavigate, Link } from "react-router-dom";
import MobileBottomNav from "../components/MobileBottomNav";
import ThemeToggle from "../components/common/ThemeToggle";
import useCooldown from "../hooks/useCooldown";
import PrivacyBadge from "../components/common/PrivacyBadge";
import BoundedInput from "../components/common/BoundedInput";
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
  Zap
} from "lucide-react";

const AIInterview = () => {
  const navigate = useNavigate();
  const { isCoolingDown, trigger: triggerWithCooldown } = useCooldown(1500);

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
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const transcriptText = event.results[0][0].transcript;
      setAnswer(transcriptText);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  /* ================= START INTERVIEW ================= */
  const handleStartInterview = async () => {
    if (!file) {
      alert("Please upload your resume first.");
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
      alert("Failed to initialize interview session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBMIT ANSWER ================= */
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please provide an answer before submitting.");
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
      alert("Error submitting your response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PDF REPORT GENERATOR ================= */
  const downloadReport = () => {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(18);
    doc.text("AI Interview Performance Report", 10, y);
    y += 10;

    doc.setFontSize(14);
    doc.text(`Overall Score: ${overallScore}%`, 10, y);
    y += 10;

    transcript.forEach((item, index) => {
      doc.setFontSize(12);
      doc.text(`Q${index + 1}: ${item.question}`, 10, y);
      y += 8;

      doc.text(`Answer: ${item.answer || ""}`, 10, y);
      y += 8;

      if (item.feedback) {
        doc.text(
          `Scores: Technical: ${item.feedback.technical_score} | Communication: ${item.feedback.communication_score} | Confidence: ${item.feedback.confidence_score}`,
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
            y += 8;
          });
        }
      }

      y += 5;

      if (y > 270) {
        doc.addPage();
        y = 10;
      }
    });

    doc.save("AI_Interview_Report.pdf");
  };

  /* ================= FINAL REPORT UI ================= */
  if (completed) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-10 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 shadow-xl rounded-3xl sm:rounded-[2rem] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 animate-in zoom-in-95 duration-300">
          
          <div className="flex justify-between items-center mb-8">
            <Link
              to="/student"
              className="flex items-center gap-2 h-10 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all active:scale-95"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>
            <ThemeToggle />
          </div>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
               <Award size={32} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-1">
              Interview Evaluation Completed
            </h1>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Comprehensive AI Proficiency Scoring</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className="bg-teal-50/50 dark:bg-teal-950/30 rounded-2xl p-6 text-center border border-teal-100 dark:border-teal-900/40 flex flex-col justify-center">
              <div className="text-6xl font-black text-teal-600 dark:text-teal-400">
                {overallScore}%
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-3">
                Overall Competency Rating
              </p>
            </div>

            <div className="flex flex-col justify-center space-y-3">
               <button
                onClick={downloadReport}
                className="h-11 w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-xs transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 active:scale-95"
              >
                <Download size={16} /> Download PDF Report
              </button>
              <button
                onClick={() => navigate("/student")}
                className="h-11 w-full bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <ArrowLeft size={16} /> Return to Dashboard
              </button>
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider border-l-4 border-teal-600 pl-3">
            Question-by-Question Breakdown
          </h2>

          <div className="space-y-6">
            {transcript.map((item, index) => (
              <div key={index} className="border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-800/40">
                <p className="font-bold text-teal-600 dark:text-teal-400 mb-2 text-xs uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={16} /> Question {index + 1}
                </p>
                <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 mb-4 leading-relaxed">
                  {item.question}
                </p>
                
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/60 dark:border-slate-800 mb-4 shadow-sm">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Your response</p>
                   <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-normal">"{item.answer}"</p>
                </div>

                {item.feedback && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Technical</p>
                        <p className="text-lg font-black text-teal-600 dark:text-teal-400">{item.feedback.technical_score}/10</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Communication</p>
                        <p className="text-lg font-black text-purple-600 dark:text-purple-400">{item.feedback.communication_score}/10</p>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Confidence</p>
                        <p className="text-lg font-black text-amber-500 dark:text-amber-400">{item.feedback.confidence_score}/10</p>
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

  /* ================= INTERVIEW UI ================= */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-10 pb-28 md:pb-12 font-sans text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 shadow-xl rounded-3xl sm:rounded-[2rem] border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 animate-in slide-in-from-bottom-4 duration-400">

        {/* Top Header */}
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Link
            to="/student"
            className="flex items-center gap-2 h-10 px-3.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all active:scale-95"
          >
            <ArrowLeft size={14} />
            <span>Dashboard</span>
          </Link>
          <ThemeToggle />
        </div>

        {!sessionId ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
               <FileCheck size={32} />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-1 text-center">
              AI Mock Interview
            </h1>
            <p className="text-slate-400 font-medium text-xs mb-8 text-center">Simulate real-world technical and behavioral interview rounds</p>

            {/* Resume Upload Section */}
            <div className="w-full max-w-sm mb-6">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 hover:bg-teal-50/20 transition-all group">
                    <div className="flex flex-col items-center justify-center p-4">
                        <UploadCloud className="w-10 h-10 text-teal-600 dark:text-teal-400 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 text-center px-2">
                            {file ? file.name : "Select Resume"}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1">PDF or DOCX format</p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} />
                </label>
            </div>

            {/* Experience Level Selector */}
            <div className="w-full max-w-sm mb-8">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5 block text-center">
                Target Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["easy", "medium", "hard"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`h-10 rounded-xl font-semibold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-1.5 ${
                      difficulty === level
                        ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {difficulty === level && <Zap size={12} fill="currentColor" />}
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={triggerWithCooldown(handleStartInterview)}
              disabled={loading || isCoolingDown}
              className="w-full max-w-sm h-12 bg-teal-600 text-white rounded-xl font-semibold text-sm hover:bg-teal-700 transition-all shadow-md shadow-teal-600/20 flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Synthesizing Interview Profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Launch Interview Session</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight border-l-4 border-teal-600 pl-3">
                  Live Technical Round
                </h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 dark:bg-rose-950/40 rounded-full border border-rose-200/60 dark:border-rose-900/50">
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                      {listening ? "Dictation Active" : "Mic Standby"}
                    </span>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 sm:p-6 rounded-2xl mb-6 border border-slate-200/80 dark:border-slate-700/80 flex justify-between items-start gap-3 shadow-sm">
              <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                  {currentQuestion}
              </p>
              <button 
                type="button"
                onClick={() => speakQuestion(currentQuestion)}
                title="Replay Audio"
                className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm hover:shadow-md transition-all shrink-0 active:scale-95"
              >
                <Volume2 size={18} />
              </button>
            </div>

            <div className="mb-6">
                <BoundedInput
                  id="interview-answer-input"
                  as="textarea"
                  rows={5}
                  label="Your Response (Spoken or Typed)"
                  placeholder="Analyze the problem and articulate your response clearly..."
                  value={answer}
                  onChange={(val) => setAnswer(val)}
                  maxChars={1200}
                  minChars={10}
                  maxWords={200}
                  helperText="Use voice dictation or type your answer directly."
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {!listening ? (
                <button
                  type="button"
                  onClick={startListening}
                  className="flex-1 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all active:scale-95 shadow-sm"
                >
                  <Mic size={16} className="text-teal-600 dark:text-teal-400" /> 
                  <span>Start Voice Input</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopListening}
                  className="flex-1 h-11 bg-rose-600 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 animate-pulse transition-all shadow-md shadow-rose-600/20 active:scale-95"
                >
                  <MicOff size={16} /> 
                  <span>Stop Voice Input</span>
                </button>
              )}

              <button
                type="button"
                onClick={triggerWithCooldown(handleSubmitAnswer)}
                disabled={loading || isCoolingDown}
                className="flex-1 h-11 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-teal-600/20 disabled:opacity-50 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : "Submit Response"}
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-8">
          <PrivacyBadge />
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default AIInterview;