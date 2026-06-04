const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const ConversationLog = require("../models/ConversationLog");
const DistressEvent = require("../models/DistressEvent");
const { getAIResponse, extractFacts } = require("../services/aiService");
const { analyzeDistress } = require("../services/distressDetector");

router.post("/chat", async (req, res) => {
  try {
    const { patientId, message, sessionId } = req.body;
    if (!patientId || !message) {
      return res.status(400).json({ error: "patientId and message required" });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    let log = null;
    if (sessionId) {
      log = await ConversationLog.findById(sessionId);
    }
    if (!log) {
      log = await ConversationLog.create({ patientId, messages: [] });
    }

    log.messages.push({ role: "patient", content: message });

    const { score, isDistressed, triggers } = analyzeDistress(message, log.messages);
    if (score > log.distressScore) log.distressScore = score;


    if (isDistressed) {
      const io = req.app.get("io");
      const distressEvent = await DistressEvent.create({
        patientId,
        triggerType: triggers[0] || "confusion_keyword",
        messageSnippet: message.slice(0, 200),
        distressScore: score,
      });
      io.to(`caregiver_${patientId}`).emit("distress_alert", {
        patientId,
        patientName: patient.name,
        score,
        triggers,
        message: message.slice(0, 100),
        timestamp: new Date().toISOString(),
        eventId: distressEvent._id,
      });
    }

    const aiText = await getAIResponse(patient, log.messages, message, isDistressed);


    log.messages.push({ role: "ai", content: aiText });
    await log.save();

    res.json({
      reply: aiText,
      sessionId: log._id,
      isDistressed,
      distressScore: score,
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "AI service error" });
  }
});


router.post("/end-session", async (req, res) => {
  try {
    const { patientId, sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: "sessionId required" });

    const log = await ConversationLog.findById(sessionId);
    if (!log) return res.status(404).json({ error: "Session not found" });

    log.endTime = new Date();

    const patient = await Patient.findById(patientId);
    if (patient && log.messages.length > 2) {
      const facts = await extractFacts(patient.name, log.messages);
      log.extractedFacts = facts;

      if (facts.length > 0) {
        const newFacts = facts.map((f) => ({ fact: f }));
        patient.storedFacts.push(...newFacts);
    
        if (patient.storedFacts.length > 50) {
          patient.storedFacts = patient.storedFacts.slice(-50);
        }
        await patient.save();
      }
    }

    await log.save();
    res.json({ success: true, factsExtracted: log.extractedFacts?.length || 0 });
  } catch (err) {
    console.error("End session error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
