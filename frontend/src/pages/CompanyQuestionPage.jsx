import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { ROUTES } from "../routes/routes"; 

const CompanyQuestionPage = () => {
  const { companyName } = useParams();
  const navigate = useNavigate(); 
  
  // 🔥 AI GENERATION & SYSTEM STATES
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Initializing secure environment...");
  const [error, setError] = useState(null);
  const [needsHardReset, setNeedsHardReset] = useState(false);

  // 🔥 PROFESSIONAL ASSESSMENT STATES
  const [questionsBank, setQuestionsBank] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [maxReachedIndex, setMaxReachedIndex] = useState(0); 
  
  const [showPreSubmitReview, setShowPreSubmitReview] = useState(false);
  const [showPostSubmitReview, setShowPostSubmitReview] = useState(false);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [finalScoreStats, setFinalScoreStats] = useState({ score: 0, attempted: 0, accuracy: 0 });
  const MAX_QUESTIONS = 20; 

  // 🔥 ANTI-CHEATING STATE
  const [warnings, setWarnings] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const MAX_WARNINGS = 3;

  const formattedCompany = companyName.charAt(0).toUpperCase() + companyName.slice(1);

  // ================= PROCTORING LOGIC =================
  const handleCheatDetected = useCallback(() => {
    setWarnings(prev => {
      const newCount = prev + 1;
      if (newCount >= MAX_WARNINGS) setIsTerminated(true);
      else alert(`⚠️ PROCTOR WARNING (${newCount}/${MAX_WARNINGS})\n\nPlease do not switch tabs, minimize the window, or leave the test area.`);
      return newCount;
    });
  }, []);

  useEffect(() => {
    if (isTestComplete || isTerminated || questionsBank.length === 0) return;
    const handleVisibilityChange = () => { if (document.hidden) handleCheatDetected(); };
    const handleWindowBlur = () => handleCheatDetected();
    const handleContextMenu = (e) => e.preventDefault();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [isTestComplete, isTerminated, questionsBank.length, handleCheatDetected]);


  // ================= DYNAMIC QUESTION FETCHING =================
  const fetchNewQuestion = async () => {
    setLoading(true);
    setLoadingText(`Generating Question ${currentIndex + 1}...`);
    setError(null);
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser || storedUser === "undefined") throw new Error("Session corrupted");
      const userId = JSON.parse(storedUser)._id || JSON.parse(storedUser).id; 

      const res = await api.post('/ai/generate-question', { userId, company: formattedCompany, difficulty: "Medium" });

      if (res.data.success) {
        setQuestionsBank(prev => [...prev, {
          raw: res.data.question,
          selectedOption: null,
          isFlagged: false, 
          evaluation: null 
        }]);
      } else throw new Error("Generation failed.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Connection failed.");
      if (err.response?.status === 401 || err.response?.status === 403) setNeedsHardReset(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentIndex === questionsBank.length && currentIndex < MAX_QUESTIONS) {
      fetchNewQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);


  // ================= USER ACTIONS =================
  const currentQ = questionsBank[currentIndex];

  const handleSelectOption = (opt) => {
    const updatedBank = [...questionsBank];
    updatedBank[currentIndex].selectedOption = opt;
    setQuestionsBank(updatedBank);
  };

  const clearSelection = () => {
    const updatedBank = [...questionsBank];
    updatedBank[currentIndex].selectedOption = null;
    setQuestionsBank(updatedBank);
  };

  const toggleFlag = () => {
    const updatedBank = [...questionsBank];
    updatedBank[currentIndex].isFlagged = !updatedBank[currentIndex].isFlagged;
    setQuestionsBank(updatedBank);
  };

  const handleNext = () => {
    if (currentIndex === MAX_QUESTIONS - 1) {
      setShowPreSubmitReview(true);
    } else {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (nextIndex > maxReachedIndex) setMaxReachedIndex(nextIndex);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const jumpToQuestion = (index) => {
    if (index <= maxReachedIndex) {
      setCurrentIndex(index);
      setShowPreSubmitReview(false);
    }
  };

  // ================= FINAL SUBMISSION LOGIC =================
  const handleFinalSubmit = async () => {
    setLoading(true);
    setLoadingText("Calculating Final Score & Evaluating Responses...");
    setShowPreSubmitReview(false);
    
    let attempted = 0;
    let score = 0;
    const userId = JSON.parse(localStorage.getItem("user")).id || JSON.parse(localStorage.getItem("user"))._id;
    const updatedBank = [...questionsBank];

    const evaluationPromises = updatedBank.map(async (q, index) => {
      if (q.selectedOption) {
        attempted++;
        const isCorrect = q.selectedOption === q.raw.correctAnswer;
        if (isCorrect) score++;

        try {
           const res = await api.post('/ai/evaluate-solution', {
            userId, userAnswer: q.selectedOption, correctAnswer: q.raw.correctAnswer, questionTitle: q.raw.title, company: formattedCompany
          });
          updatedBank[index].evaluation = res.data.evaluation;
        } catch(e) { 
           updatedBank[index].evaluation = { isCorrect, feedback: isCorrect ? "Mastered" : "Review needed" };
        }
      }
    });

    await Promise.all(evaluationPromises);

    setQuestionsBank(updatedBank);
    setFinalScoreStats({ attempted, score, accuracy: attempted > 0 ? Math.round((score / attempted) * 100) : 0 });
    setIsTestComplete(true);
    setLoading(false);
  };


  // ================= UI HELPERS =================
  const getPaletteColor = (index) => {
    if (index > maxReachedIndex) return "bg-slate-50 text-slate-300 border-slate-100 opacity-50 cursor-not-allowed border-dashed"; // Locked
    if (index === currentIndex && !showPreSubmitReview) return "bg-teal-50 text-teal-600 border-teal-400 ring-2 ring-teal-100 ring-offset-1"; // Active
    
    const q = questionsBank[index];
    if (!q) return "bg-white text-slate-400 border-slate-200 hover:border-slate-300"; 
    if (q.isFlagged) return "bg-amber-50 text-amber-600 border-amber-300 hover:bg-amber-100"; // Flagged
    if (q.selectedOption) return "bg-[#5cbdb9]/10 text-[#5cbdb9] border-[#5cbdb9]"; // Attempted
    return "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"; // Visited, Skipped
  };

  const getProgressPercentage = () => {
    const attempted = questionsBank.filter(q => q && q.selectedOption).length;
    return (attempted / MAX_QUESTIONS) * 100;
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] font-sans flex flex-col selection:bg-teal-500/20">
      
      {/* ================= TOP HEADER & PROGRESS BAR ================= */}
      <div className="bg-white sticky top-0 z-40 shadow-sm border-b border-slate-100">
        <div className="max-w-[1600px] w-full mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/company-prep')} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-500 hover:text-[#5cbdb9] transition-all border border-slate-200">
              <i className="fas fa-arrow-left"></i>
            </button>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {formattedCompany} <span className="text-[#5cbdb9]">Mock</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            {warnings > 0 && !isTerminated && !isTestComplete && (
              <span className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-red-200">
                Proctor Warning: {warnings}/{MAX_WARNINGS}
              </span>
            )}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Completion Progress</span>
              <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#5cbdb9] transition-all duration-500" style={{ width: `${getProgressPercentage()}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center p-6 sm:p-8">
        {/* Keeps the wide wrapper so the palette stays on the right */}
        <div className="max-w-[1600px] w-full flex flex-col lg:flex-row gap-8 lg:gap-10">
          
          {/* ================= LEFT COLUMN: MAIN CONTENT ================= */}
          <div className="flex-1 min-w-0">

            {loading ? (
              <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center h-[60vh]">
                <div className="w-12 h-12 border-4 border-[#5cbdb9]/30 border-t-[#5cbdb9] rounded-full animate-spin mb-6"></div>
                <p className="font-bold text-slate-500 text-lg">{loadingText}</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-10 rounded-[2.5rem] border border-red-100 text-center shadow-sm">
                <i className="fas fa-exclamation-circle text-4xl mb-4"></i>
                <p className="font-bold text-lg mb-4">{error}</p>
                {needsHardReset ? (
                  <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700">Force Reset Session</button>
                ) : (
                  <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700">Reload Page</button>
                )}
              </div>
            ) : isTerminated ? (
              <div className="bg-red-50 p-12 rounded-[2.5rem] shadow-sm border-2 border-red-200 text-center h-[60vh] flex flex-col items-center justify-center">
                <i className="fas fa-ban text-6xl text-red-500 mb-6"></i>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Test Terminated</h2>
                <p className="text-red-500 mb-8 font-bold">You exceeded the maximum number of proctor warnings.</p>
                <button onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)} className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 shadow-lg">Return to Dashboard</button>
              </div>
            ) : isTestComplete ? (
              
              // ================= FINAL SCORECARD & DETAILED REPORT =================
              showPostSubmitReview ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">Detailed Report</h2>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">AI Interviewer Feedback</p>
                    </div>
                    <button onClick={() => setShowPostSubmitReview(false)} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">
                      Back to Score
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {questionsBank.map((q, idx) => (
                      <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-start mb-6">
                          <h3 className="font-bold text-slate-800 text-lg"><span className="text-slate-400 mr-3">Q{idx + 1}.</span> {q.raw.question}</h3>
                          {q.selectedOption ? (
                            <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0 ${q.evaluation?.isCorrect ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                              {q.evaluation?.isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200 shrink-0">Skipped</span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {q.raw.options.map((opt, i) => {
                            let optClass = "p-4 rounded-2xl border-2 text-sm font-bold flex items-center gap-4 ";
                            if (opt === q.raw.correctAnswer) optClass += "bg-emerald-50 border-emerald-400 text-emerald-700";
                            else if (opt === q.selectedOption && opt !== q.raw.correctAnswer) optClass += "bg-red-50 border-red-400 text-red-700";
                            else optClass += "bg-slate-50 border-slate-100 text-slate-500";
                            
                            return (
                              <div key={i} className={optClass}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 ${opt === q.raw.correctAnswer ? 'border-emerald-500 bg-emerald-500 text-white' : opt === q.selectedOption ? 'border-red-500 bg-red-500 text-white' : 'border-slate-300'}`}>
                                  {(opt === q.raw.correctAnswer || opt === q.selectedOption) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                                <span className="text-sm leading-snug">{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="bg-slate-50 p-5 rounded-xl text-sm text-slate-600 border border-slate-200">
                          <span className="font-black text-[#5cbdb9] uppercase text-[10px] block mb-2">Interviewer Explanation</span>
                          <span className="leading-relaxed">{q.raw.explanation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 text-center animate-in zoom-in duration-500 h-[70vh] flex flex-col justify-center">
                  <div className="w-24 h-24 bg-[#5cbdb9]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="fas fa-trophy text-4xl text-[#5cbdb9]"></i>
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2">Assessment Complete</h2>
                  <p className="text-slate-500 mb-10 font-medium">Your results have been securely saved to your Skill Radar.</p>
                  
                  <div className="flex flex-wrap justify-center gap-6 mb-12">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 min-w-[140px]">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Attempted</p>
                      <p className="text-4xl font-black text-slate-700">{finalScoreStats.attempted}<span className="text-xl text-slate-300">/{MAX_QUESTIONS}</span></p>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 min-w-[140px]">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Correct Hits</p>
                      <p className="text-4xl font-black text-emerald-600">{finalScoreStats.score}</p>
                    </div>
                    <div className="bg-[#5cbdb9]/10 p-6 rounded-[2rem] border border-[#5cbdb9]/20 min-w-[140px]">
                      <p className="text-xs font-bold text-[#5cbdb9] uppercase tracking-widest mb-2">Accuracy</p>
                      <p className="text-4xl font-black text-[#5cbdb9]">{finalScoreStats.accuracy}%</p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button onClick={() => setShowPostSubmitReview(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 text-sm">
                      Detailed Report
                    </button>
                    <button onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)} className="bg-white text-slate-800 border-2 border-slate-200 px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:border-slate-300 hover:bg-slate-50 transition-all text-sm">
                      Dashboard
                    </button>
                  </div>
                </div>
              )

            ) : showPreSubmitReview ? (
              // ================= PRE-SUBMIT REVIEW BOARD =================
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in">
                <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Review Before Submission</h2>
                <p className="text-slate-500 mb-10 text-sm">Check your skipped or flagged questions before finalizing your exam.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 border-b border-slate-100 pb-10">
                  <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Answered</p>
                    <p className="text-2xl font-black text-[#5cbdb9]">{questionsBank.filter(q => q.selectedOption).length}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Skipped</p>
                    <p className="text-2xl font-black text-slate-500">{questionsBank.filter(q => !q.selectedOption).length}</p>
                  </div>
                  <div className="bg-amber-50 p-5 rounded-2xl text-center border border-amber-100">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Flagged</p>
                    <p className="text-2xl font-black text-amber-600">{questionsBank.filter(q => q.isFlagged).length}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  {questionsBank.map((q, i) => {
                    if (!q) return null;
                    const isSkipped = !q.selectedOption;
                    if (!isSkipped && !q.isFlagged) return null;

                    return (
                      <div key={i} className={`p-5 rounded-2xl border flex justify-between items-center ${isSkipped ? "bg-slate-50 border-slate-200 text-slate-600" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                        <div>
                          <span className="font-black mr-4">Question {i + 1}</span>
                          <span className="text-xs font-bold bg-white px-3 py-1 rounded-md shadow-sm border border-slate-100">{isSkipped ? "Unanswered" : "🚩 Flagged for Review"}</span>
                        </div>
                        <button onClick={() => jumpToQuestion(i)} className="px-5 py-2 bg-white rounded-xl shadow-sm border border-slate-200 text-xs font-bold hover:scale-105 transition-transform text-slate-700">
                          Jump to Q{i + 1}
                        </button>
                      </div>
                    );
                  })}
                  {questionsBank.filter(q => !q.selectedOption || q.isFlagged).length === 0 && (
                    <div className="p-6 bg-emerald-50 text-emerald-600 rounded-[1.5rem] border border-emerald-200 font-bold text-center text-sm">
                      <i className="fas fa-check-circle mr-2 text-xl mb-1 align-middle"></i> All questions answered and unflagged! You are ready to submit.
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setShowPreSubmitReview(false)} className="flex-1 bg-white text-slate-800 border-2 border-slate-200 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-sm">
                    Back to Test
                  </button>
                  <button onClick={handleFinalSubmit} className="flex-1 bg-[#5cbdb9] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#4aa8a4] transition-all shadow-xl shadow-[#5cbdb9]/30 text-sm">
                    Submit Final Test
                  </button>
                </div>
              </div>
            ) : currentQ && (
              // ================= ACTIVE QUESTION UI =================
              <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 select-none animate-in fade-in" onCopy={(e) => { e.preventDefault(); alert("Copying is disabled."); }}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-100 pb-6 gap-4">
                  <span className="bg-[#5cbdb9]/10 text-[#5cbdb9] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    Topic: {currentQ.raw.title}
                  </span>
                  <div className="flex gap-3">
                    {currentQ.selectedOption && (
                      <button onClick={clearSelection} className="text-xs font-bold text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors px-3 py-2">
                        Clear Response
                      </button>
                    )}
                    <button onClick={toggleFlag} className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-sm border ${currentQ.isFlagged ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                      <i className={`${currentQ.isFlagged ? "fas" : "far"} fa-flag`}></i> {currentQ.isFlagged ? "Flagged" : "Flag"}
                    </button>
                  </div>
                </div>
                
                {/* ⬅️ FONT SIZES REVERTED TO NORMAL HERE */}
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-8 leading-relaxed tracking-tight">
                  <span className="text-slate-400 mr-2">{currentIndex + 1}.</span>{currentQ.raw.question}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQ.raw.options.map((opt, i) => {
                    const isSelected = currentQ.selectedOption === opt;
                    return (
                      <button 
                        key={i} 
                        onClick={() => handleSelectOption(opt)} 
                        className={`p-5 rounded-[1.25rem] border-2 text-left font-bold transition-all flex items-start gap-4 group ${
                          isSelected ? 'border-[#5cbdb9] bg-[#5cbdb9]/5 text-[#4aa8a4] shadow-sm' : 'border-slate-100 bg-white hover:border-[#5cbdb9]/40 hover:shadow-md text-slate-600'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all mt-0.5 ${isSelected ? 'border-[#5cbdb9] bg-white' : 'border-slate-300 group-hover:border-[#5cbdb9]/60'}`}>
                           {isSelected && <div className="w-2.5 h-2.5 bg-[#5cbdb9] rounded-full"></div>}
                        </div>
                        <span className="text-sm leading-snug">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100">
                  <button onClick={handlePrev} disabled={currentIndex === 0} className={`px-6 py-3.5 rounded-xl font-black uppercase tracking-widest transition-all text-sm ${currentIndex === 0 ? 'bg-slate-50 text-slate-300 cursor-not-allowed opacity-50' : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                    ➔ Prev
                  </button>
                  
                  <button onClick={handleNext} className="px-8 py-3.5 bg-[#5cbdb9] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#4aa8a4] shadow-lg shadow-[#5cbdb9]/30 transition-all hover:-translate-y-1 text-sm">
                    {currentIndex === MAX_QUESTIONS - 1 ? "Review & Submit" : (currentQ.selectedOption ? "Save & Next ➔" : "Skip ➔")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: QUESTION PALETTE ================= */}
          {!isTestComplete && !isTerminated && !loading && !error && (
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 sticky top-24 relative overflow-hidden">
                
                {/* Clean top accent border */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#5cbdb9]"></div>

                <h3 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs flex items-center justify-between">
                  Question Palette
                  <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md text-[10px]">{currentIndex + 1} / {MAX_QUESTIONS}</span>
                </h3>
                
                {/* 🔥 FIXED GRID: Perfect squares, nicely centered */}
                <div className="grid grid-cols-5 gap-3 mb-8 place-items-center">
                  {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
                    <button 
                      key={i}
                      disabled={i > maxReachedIndex}
                      onClick={() => jumpToQuestion(i)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all border-2 flex items-center justify-center relative hover:scale-105 ${getPaletteColor(i)}`}
                    >
                      {i + 1}
                      {questionsBank[i]?.isFlagged && <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-500 rounded-full border-2 border-white shadow-sm"></div>}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 text-[11px] font-bold text-slate-500 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3"><div className="w-3.5 h-3.5 rounded-md border-2 border-[#5cbdb9] bg-[#5cbdb9]/10"></div> Answered</div>
                  <div className="flex items-center gap-3"><div className="w-3.5 h-3.5 rounded-md border-2 border-amber-300 bg-amber-50"></div> Flagged for Review</div>
                  <div className="flex items-center gap-3"><div className="w-3.5 h-3.5 rounded-md border-2 border-slate-300 bg-white"></div> Not Visited / Skipped</div>
                </div>

                {maxReachedIndex === MAX_QUESTIONS - 1 && !showPreSubmitReview && (
                  <button onClick={() => setShowPreSubmitReview(true)} className="w-full mt-6 bg-slate-900 text-white py-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 text-xs">
                    Finish Test
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyQuestionPage;