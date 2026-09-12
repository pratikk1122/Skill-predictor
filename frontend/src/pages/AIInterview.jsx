import React, { useState, useRef } from "react";
import api from "../services/api";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import MobileBottomNav from "../components/MobileBottomNav";
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
  Zap,
  Share2,
  Check
} from "lucide-react";

const AIInterview = () => {
  const navigate = useNavigate();
  const { isCoolingDown, trigger: triggerWithCooldown } = useCooldown(1500);

  const [file, setFile] = useState(null);
  const [difficulty, setDifficulty] = useState("medium"); // Added for Difficulty logic
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
      alert("Speech recognition not supported.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer(transcript);
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
      alert("Upload resume first.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("difficulty", difficulty); // Requirement: Sending difficulty to API

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
      alert("Failed to start interview.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBMIT ANSWER ================= */
  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      alert("Provide answer.");
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
      alert("Error submitting answer.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= PDF REPORT GENERATOR ================= */
  const downloadReport = () => {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(18);
    doc.text("AI Interview Report", 10, y);
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
          `Scores → Technical: ${item.feedback.technical_score} | Communication: ${item.feedback.communication_score} | Confidence: ${item.feedback.confidence_score}`,
          10,
          y
        );
        y += 8;

        if (item.feedback.improvement?.length) {
          item.feedback.improvement.forEach((imp) => {
            doc.text(
              `Improvement (${imp.category}): ${imp.description}`,
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
      <div className="min-h-screen bg-teeny-greeny p-6 md:p-10 font-sans text-text-dark">
        <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-[2.5rem] border border-blue-greeny/5 p-8 md:p-12 animate-in zoom-in-95 duration-300">
          
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-20 h-20 bg-blue-greeny/10 text-blue-greeny rounded-3xl flex items-center justify-center mb-6 shadow-inner">
               <Award size={40} />
            </div>
            <h1 className="text-4xl font-heading font-black uppercase tracking-tight mb-2">
              Interview Achieved
            </h1>
            <p className="text-text-light font-bold uppercase tracking-widest text-xs">AI Performance Evaluation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-teeny-greeny/30 rounded-[2rem] p-8 text-center border border-blue-greeny/10">
              <div className="text-7xl font-heading font-black text-blue-greeny">
                {overallScore}%
              </div>
              <p className="text-text-light font-black uppercase tracking-[0.2em] text-[10px] mt-4">
                Global Proficiency Score
              </p>
            </div>

            <div className="flex flex-col justify-center space-y-4">
               <button
                onClick={downloadReport}
                className="w-full bg-blue-greeny text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-greeny-dark transition-all shadow-lg shadow-blue-greeny/20 flex items-center justify-center gap-3"
              >
                <Download size={20} strokeWidth={3} /> Download PDF Report
              </button>
              <button
                onClick={() => navigate("/student/dashboard")}
                className="w-full bg-text-dark text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all flex items-center justify-center gap-3"
              >
                <ArrowLeft size={20} strokeWidth={3} /> Return Dashboard
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-heading font-black mb-8 uppercase tracking-tight border-l-8 border-blue-greeny pl-4">
            Detailed Analytics
          </h2>

          <div className="space-y-8">
            {transcript.map((item, index) => (
              <div key={index} className="group border border-blue-greeny/5 rounded-[2rem] p-8 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all duration-300">
                <p className="font-heading font-black text-blue-greeny mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                  <CheckCircle2 size={18} /> Question {index + 1}
                </p>
                <p className="text-lg font-bold text-text-dark mb-6 leading-relaxed">
                  {item.question}
                </p>
                
                <div className="bg-white rounded-2xl p-6 border border-blue-greeny/5 mb-6 shadow-sm">
                   <p className="text-xs font-black text-text-light uppercase tracking-widest mb-2">Your response</p>
                   <p className="text-text-dark font-medium">"{item.answer}"</p>
                </div>

                {item.feedback && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-blue-greeny/10 text-center">
                        <p className="text-[10px] font-black text-text-light uppercase tracking-widest">Technical</p>
                        <p className="text-xl font-black text-blue-greeny">{item.feedback.technical_score}/10</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-blue-greeny/10 text-center">
                        <p className="text-[10px] font-black text-text-light uppercase tracking-widest">Communication</p>
                        <p className="text-xl font-black text-purple-500">{item.feedback.communication_score}/10</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-blue-greeny/10 text-center">
                        <p className="text-[10px] font-black text-text-light uppercase tracking-widest">Confidence</p>
                        <p className="text-xl font-black text-orange-500">{item.feedback.confidence_score}/10</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 📱 Mobile Bottom Navigation Bar */}
        <MobileBottomNav />
      </div>
    );
  }

  /* ================= INTERVIEW UI ================= */
  return (
    <div className="min-h-screen bg-teeny-greeny p-6 md:p-10 pb-28 md:pb-10 font-sans text-text-dark">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-[2.5rem] border border-blue-greeny/5 p-8 md:p-12 animate-in slide-in-from-bottom-4 duration-500">

        {!sessionId ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-greeny rounded-3xl flex items-center justify-center mb-8 shadow-lg shadow-blue-greeny/20 rotate-3">
               <FileCheck size={40} className="text-white" />
            </div>
            
            <h1 className="text-4xl font-heading font-black mb-2 uppercase tracking-tight text-center">
              AI Mock Interview
            </h1>
            <p className="text-text-light font-bold uppercase tracking-widest text-[10px] mb-12">Simulate real-world technical rounds</p>

            {/* Resume Upload Section */}
            <div className="w-full max-w-sm mb-8">
                <label className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-teeny-greeny rounded-[2rem] cursor-pointer hover:bg-teeny-greeny/30 transition-all group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-12 h-12 text-blue-greeny mb-4 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-black text-text-dark uppercase tracking-widest text-center px-4">
                            {file ? file.name : "Select Resume"}
                        </p>
                        <p className="text-[10px] text-text-light font-bold uppercase mt-2">PDF or DOCX only</p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} />
                </label>
            </div>

            {/* --- PROFESSIONAL DIFFICULTY SELECTOR --- */}
            <div className="w-full max-w-sm mb-10">
              <label className="text-[11px] font-black text-text-light uppercase tracking-[0.2em] mb-4 block text-center">
                Select Experience Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["easy", "medium", "hard"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border-2 flex items-center justify-center gap-1 ${
                      difficulty === level
                        ? "bg-blue-greeny border-blue-greeny text-white shadow-lg shadow-blue-greeny/30 scale-105"
                        : "bg-white border-teeny-greeny text-text-light hover:border-blue-greeny/30"
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
              className="w-full max-w-sm bg-teal-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} strokeWidth={3} />
                  Analyzing Profile...
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} strokeWidth={3} /> START SESSION
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-heading font-black uppercase tracking-tight border-l-4 border-teal-600 pl-3">
                  Live Session
                </h2>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-full border border-rose-100 dark:border-rose-900/50">
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
                      {listening ? "Recording Active" : "Microphone Ready"}
                    </span>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-6 sm:p-8 rounded-[2rem] mb-8 border border-slate-200/80 dark:border-slate-700/80 flex justify-between items-start gap-4 shadow-inner relative overflow-hidden group">
              <p className="text-base sm:text-xl font-bold text-slate-800 dark:text-slate-100 leading-relaxed relative z-10">
                  {currentQuestion}
              </p>
              <button 
                type="button"
                onClick={() => speakQuestion(currentQuestion)}
                title="Replay Audio Question"
                className="w-11 h-11 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-teal-600 dark:text-teal-400 shadow-sm hover:shadow-md transition-all relative z-10 shrink-0 active:scale-95"
              >
                <Volume2 size={22} />
              </button>
            </div>

            <div className="mb-8">
                <BoundedInput
                  id="interview-answer-input"
                  as="textarea"
                  rows={5}
                  label="Your Response (Spoken or Typed)"
                  placeholder="Analyze the question and provide your structured response here..."
                  value={answer}
                  onChange={(val) => setAnswer(val)}
                  maxChars={1200}
                  minChars={10}
                  maxWords={200}
                  helperText="Speak via microphone or type your answer."
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {!listening ? (
                <button
                  type="button"
                  onClick={startListening}
                  className="flex-1 bg-white dark:bg-slate-800 border border-teal-500/30 text-teal-700 dark:text-teal-300 px-6 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-3 hover:bg-teal-50 dark:hover:bg-slate-700/60 transition-all active:scale-95 shadow-sm"
                >
                  <Mic size={18} /> Start Voice Dictation
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopListening}
                  className="flex-1 bg-rose-600 text-white px-6 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-3 animate-pulse transition-all shadow-lg shadow-rose-200 dark:shadow-none active:scale-95"
                >
                  <MicOff size={18} /> Stop Dictation
                </button>
              )}

              <button
                type="button"
                onClick={triggerWithCooldown(handleSubmitAnswer)}
                disabled={loading || isCoolingDown}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-6 py-4 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-teal-600/20 disabled:opacity-50 active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "SUBMIT RESPONSE"}
              </button>
            </div>
          </div>
        )}

        {/* Transparent Privacy & Data Security Badge */}
        <div className="flex justify-center mt-10">
          <PrivacyBadge />
        </div>
      </div>

      {/* 📱 Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

export default AIInterview;