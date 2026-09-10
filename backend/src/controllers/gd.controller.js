const GD_Room = require("../models/gdRoom.model");
const mongoose = require("mongoose"); // 🔥 FIX: Added mongoose to check valid ObjectIds
// 🔥 Added evaluateUserPerformance for Feature 4
const { generateBotReplies, evaluateUserPerformance } = require("../services/gd.service");

// 🔥 NEW COLLECTIONS IMPORTS
const AiGD = require("../models/AiGD");
const LiveGD = require("../models/LiveGD");

/* =========================================================
    REST API LOGIC (For Dashboard History etc.)
========================================================= */

const getGDSessions = async (req, res) => {
  try {
    const sessions = await GD_Room.find({ status: "completed" }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error) {
    console.error("Error fetching GD sessions:", error.message);
    res.status(500).json({ success: false, message: "Server Error while fetching GD history" });
  }
};

const getGDSessionById = async (req, res) => {
  try {
    const session = await GD_Room.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "GD Session not found" });
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error("Error fetching GD session by ID:", error.message);
    res.status(500).json({ success: false, message: "Invalid Session ID or Server Error" });
  }
};

/* =========================================================
    SOCKET.IO REAL-TIME LOGIC (Moved from server.js)
========================================================= */

const activeRooms = new Map();
let ioInstance; // Global variable to store io inside the controller

async function triggerAIGeneration(roomId, userMessage = "") {
  const room = activeRooms.get(roomId);
  if (!room || room.type !== "AI") return;

  if (room.autoReplyTimer) {
    clearTimeout(room.autoReplyTimer);
    room.autoReplyTimer = null;
  }

  const transcript = room.messages.slice(-6).map(m => `${m.user}: ${m.message}`).join("\n");
  
  try {
    // 🔥 FEATURE 3: Passing difficulty level to generateBotReplies logic
    const aiData = await generateBotReplies(room.topic, userMessage, transcript, room.difficulty || "Medium");

    if (aiData.moderatorInterrupt) {
      room.messageQueue.push({ user: "Moderator", message: aiData.moderatorInterrupt });
    }
    
    if (aiData.replies && aiData.replies.length > 0) {
      aiData.replies.forEach(reply => {
        room.messageQueue.push({ user: reply.botName, message: reply.message });
      });
    } else {
      room.messageQueue.push({ user: "Anita", message: "That's a point to consider. Let's explore this further." });
    }

    sendNextFromQueue(roomId);

  } catch (err) {
    console.error("AI Generation Error:", err.message);
    room.messageQueue.push({ 
      user: "Vikram", 
      message: "I think we should refocus on the core objective of this discussion." 
    });
    sendNextFromQueue(roomId);
  }
}

function sendNextFromQueue(roomId) {
  const room = activeRooms.get(roomId);
  if (!room) return;

  if (room.autoReplyTimer) {
    clearTimeout(room.autoReplyTimer);
    room.autoReplyTimer = null;
  }

  if (room.type === "AI" && room.messageQueue && room.messageQueue.length > 0) {
    const nextMsg = room.messageQueue.shift();
    room.currentSpeaker = nextMsg.user;
    room.messages.push(nextMsg);
    
    if (ioInstance) {
      ioInstance.to(roomId).emit("newMessage", nextMsg);
    }
    
  } else {
    room.currentSpeaker = "You";
    
    room.autoReplyTimer = setTimeout(() => {
      triggerAIGeneration(roomId, "(The user remained silent. Please continue the discussion.)");
    }, 20000); 
  }
}

// Ye function server.js call karega aur apna `io` yahan pass karega
const setupGDSockets = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("User connected to GD Socket:", socket.id);

    socket.on("joinRoom", async ({ roomId, topic, type, userName, difficulty }) => {
      socket.join(roomId);

      if (!activeRooms.has(roomId)) {
        activeRooms.set(roomId, {
          topic,
          type, 
          difficulty: difficulty || "Medium", // 🔥 FEATURE 3: Saving difficulty
          messages: [],
          participants: [], 
          messageQueue: [],
          autoReplyTimer: null,
          currentSpeaker: null
        });
      }

      const room = activeRooms.get(roomId);
      const userDisplayName = userName || `User_${socket.id.substring(0, 4)}`;
      room.participants.push({ id: socket.id, name: userDisplayName });

      io.to(roomId).emit("roomUpdated", { 
        participantCount: room.participants.length,
        participants: room.participants,
        topic: room.topic 
      });

      io.to(roomId).emit("participantList", room.participants.map(p => p.id));
      io.to(roomId).emit("participantCount", room.participants.length);

      if (type === "AI" && room.messages.length === 0) {
        triggerAIGeneration(roomId, "Start the discussion with an opening statement.");
      }
    });

    socket.on("sendMessage", async (data) => {
      const { roomId, user, message, topic, fillerCount } = data;
      const room = activeRooms.get(roomId);
      if (!room) return;

      const msg = { user, message, senderId: socket.id, timestamp: new Date() };
      room.messages.push(msg);
      io.to(roomId).emit("newMessage", msg);

      // 🔥 CRITICAL FIX: Only update DB if roomId is valid (prevents Mongoose CastError)
      if (mongoose.Types.ObjectId.isValid(roomId)) {
        GD_Room.findByIdAndUpdate(roomId, { $push: { messages: msg } }).catch(err => console.log("DB Error:", err));
      }

      if (room.type === "AI") {
        if (room.autoReplyTimer) {
          clearTimeout(room.autoReplyTimer);
          room.autoReplyTimer = null;
        }
        triggerAIGeneration(roomId, message);
      }
    });

    socket.on("userSpeaking", (roomId) => {
      const room = activeRooms.get(roomId);
      if (room && room.autoReplyTimer) {
        clearTimeout(room.autoReplyTimer);
        room.autoReplyTimer = null;
        console.log(`Paused AI timer for room ${roomId} because user took the floor.`);
      }
    });

    socket.on("speechFinished", (roomId) => {
      const room = activeRooms.get(roomId);
      if (room && room.type === "AI") {
        sendNextFromQueue(roomId);
      }
    });

    socket.on("endGD", (roomId) => {
      const room = activeRooms.get(roomId);
      if (room) {
        if (room.autoReplyTimer) clearTimeout(room.autoReplyTimer);
        io.to(roomId).emit("gdResult", { status: "completed" });
        activeRooms.delete(roomId);
      }
    });

    socket.on("saveFinalGD", async (data) => {
      const { roomId, stats, transcript, userEmail, userName } = data;
      try {
        // 🔥 FEATURE 4: AI Evaluation with dynamic transcript
        const fullTranscriptText = transcript.map(m => `${m.user}: ${m.message}`).join("\n");
        const roomContext = activeRooms.get(roomId);
        
        console.log(`Generating AI evaluation for room: ${roomId}...`);
        const aiEvaluation = await evaluateUserPerformance(roomContext?.topic || "Discussion", fullTranscriptText);
        
        // Merge AI results (Score, Feedback, Metrics AND Highlights)
        const finalDataToSave = {
           ...stats,
           score: aiEvaluation.overallReadiness || stats.score || 0,
           aiFeedback: aiEvaluation.feedback || "Good effort in today's discussion.",
           detailedMetrics: aiEvaluation.metrics || { communication: 70, criticalThinking: 70, confidence: 70 },
           highlights: aiEvaluation.highlights || [] // 🔥 Highlights added here
        };

        // 🔥 REQUIREMENT UPDATE: SAVE TO SPECIFIC COLLECTIONS (AI GD OR LIVE GD)
        const gdMode = roomContext?.type || data.type || "AI";
        const payload = {
          studentEmail: userEmail || "Not Provided",
          studentName: userName || "Student",
          roomId: roomId,
          topic: roomContext?.topic || "Discussion",
          score: finalDataToSave.score,
          joinedAt: new Date()
        };

        if (gdMode === "AI") {
          await AiGD.create(payload);
        } else {
          await LiveGD.create(payload);
        }

        // 🔥 CRITICAL FIX: Save correctly based on ID type
        if (mongoose.Types.ObjectId.isValid(roomId)) {
          await GD_Room.findByIdAndUpdate(roomId, {
            $set: { 
              finalStats: finalDataToSave, 
              messages: transcript, 
              status: "completed" 
            }
          });
        } else {
          // Room ID frontend se random text tha (e.g. "R-1234"), so create a new document
          await GD_Room.create({
            topic: roomContext?.topic || "Discussion",
            type: roomContext?.type || "AI",
            difficulty: roomContext?.difficulty || "Medium",
            messages: transcript,
            finalStats: finalDataToSave,
            status: "completed"
          });
        }

        // 🔥 Emit back to user so they see the real AI score and highlights on report screen
        socket.emit("finalAIScore", finalDataToSave);

        console.log(`✅ GD Session ${roomId} successfully saved with score: ${finalDataToSave.score}%`);
      } catch (err) {
        console.error("Error in saveFinalGD:", err.message);
      }
    });

    socket.on("disconnect", () => {
      activeRooms.forEach((room, roomId) => {
        room.participants = room.participants.filter(p => p.id !== socket.id);
        
        io.to(roomId).emit("roomUpdated", { 
          participantCount: room.participants.length,
          participants: room.participants 
        });
        io.to(roomId).emit("participantCount", room.participants.length);

        if (room.participants.length === 0) {
          if (room.autoReplyTimer) clearTimeout(room.autoReplyTimer);
          activeRooms.delete(roomId);
        }
      });
    });
  });
};

module.exports = {
  getGDSessions,
  getGDSessionById,
  setupGDSockets 
};