const express = require("express");
const router = express.Router();

const GD_Room = require("../models/gdRoom.model");
const { generateBotReplies } = require("../services/gd.service");

// 🔥 NEW: Importing controller function for Dashboard History
const { getGDSessions } = require("../controllers/gd.controller");

/*
====================================================
🔥 GET GD HISTORY (Dashboard Data)
GET /api/gd/history
(Note: Placed at the top to prevent Express from treating "history" as an ID)
====================================================
*/
router.get("/history", getGDSessions);


/*
====================================================
1️⃣ CREATE GD ROOM
POST /api/gd/create
====================================================
*/

router.post("/create", async (req, res) => {

  try {

    const { topic, type } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const room = await GD_Room.create({
      topic,
      type: type || "AI",
      participants: [],
      messages: []
    });

    res.json({
      message: "GD Room created successfully",
      roomId: room._id,
      type: room.type
    });

  } catch (err) {

    console.error("Create GD Error:", err);

    res.status(500).json({
      error: "Failed to create GD room"
    });

  }

});



/*
====================================================
2️⃣ JOIN LIVE GD ROOM
POST /api/gd/join
====================================================
*/

router.post("/join", async (req, res) => {

  try {

    const { roomId, user } = req.body;

    const room = await GD_Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        error: "Room not found"
      });
    }

    if (room.type !== "LIVE") {
      return res.status(400).json({
        error: "This room is not a LIVE GD room"
      });
    }

    if (room.participants.length >= 6) {
      return res.status(400).json({
        error: "Room is full (max 6 participants)"
      });
    }

    room.participants.push(user);

    await room.save();

    res.json({
      message: "Joined GD room",
      participants: room.participants
    });

  } catch (err) {

    console.error("Join GD Error:", err);

    res.status(500).json({
      error: "Failed to join room"
    });

  }

});



/*
====================================================
3️⃣ SEND MESSAGE TO GD
POST /api/gd/:roomId/message
====================================================
*/

router.post("/:roomId/message", async (req, res) => {

  try {

    const { roomId } = req.params;

    const { message, intensity } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      });
    }

    const room = await GD_Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        error: "Room not found"
      });
    }


    /* ==========================
       SAVE USER MESSAGE
    ================================ */

    room.messages.push({
      user: "You",
      message
    });


    /* ==========================
       CREATE TRANSCRIPT
    ================================ */

    const transcript = room.messages
      .slice(-6)
      .map(m => `${m.user}: ${m.message}`)
      .join("\n");


    let aiReplies = null;


    /* ==========================
       AI RESPONSES (ONLY AI GD)
    ================================ */

    if (room.type === "AI") {

      try {

        aiReplies = await generateBotReplies(
          room.topic,
          transcript,
          intensity || "medium"
        );

      } catch (err) {

        console.error("AI generation error:", err);

        aiReplies = {
          rahul: "AI is replacing traditional roles rapidly.",
          anita: "AI is also creating new industries and opportunities."
        };

      }


      room.messages.push(
        { user: "Rahul", message: aiReplies.rahul },
        { user: "Anita", message: aiReplies.anita }
      );

    }


    await room.save();


    res.json({

      replies: room.type === "AI"
        ? [
            { bot: "Rahul", message: aiReplies.rahul },
            { bot: "Anita", message: aiReplies.anita }
          ]
        : []

    });

  } catch (err) {

    console.error("GD Message Error:", err);

    res.status(500).json({
      error: "GD message failed"
    });

  }

});



/*
====================================================
4️⃣ GET ROOM MESSAGES
GET /api/gd/:roomId
====================================================
*/

router.get("/:roomId", async (req, res) => {

  try {

    const room = await GD_Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        error: "Room not found"
      });
    }

    res.json({
      topic: room.topic,
      type: room.type,
      participants: room.participants,
      messages: room.messages
    });

  } catch (err) {

    console.error("Fetch GD Error:", err);

    res.status(500).json({
      error: "Failed to fetch GD room"
    });

  }

});


module.exports = router;