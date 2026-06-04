const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Patient = require("../models/Patient");
const Caregiver = require("../models/Caregiver");
const Reminder = require("../models/Reminder");
const ConversationLog = require("../models/ConversationLog");
const DistressEvent = require("../models/DistressEvent");

router.use(authMiddleware);

router.post("/patients", async (req, res) => {
  try {
    const { name, age, cognitiveStage, familyMembers, preferences, aiTone, emergencyContact } = req.body;

    const patient = await Patient.create({
      name,
      age,
      cognitiveStage: cognitiveStage || "mild",
      familyMembers: familyMembers || [],
      preferences: preferences || [],
      aiTone: aiTone || "warm",
      emergencyContact,
      caregiverId: req.caregiver._id,
      dailySchedule: [
        { time: "07:00", activity: "Wake up and morning routine" },
        { time: "08:00", activity: "Breakfast" },
        { time: "09:00", activity: "Morning medicine" },
        { time: "10:30", activity: "Light exercise or walk" },
        { time: "13:00", activity: "Lunch" },
        { time: "14:00", activity: "Rest / nap time" },
        { time: "16:00", activity: "Family photos and memory activity" },
        { time: "18:00", activity: "Dinner" },
        { time: "20:00", activity: "Evening medicine" },
        { time: "21:30", activity: "Bedtime routine" },
      ],
    });

    await Caregiver.findByIdAndUpdate(req.caregiver._id, {
      $push: { patientIds: patient._id },
    });

    res.status(201).json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/patients", async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.caregiver._id);
    const patients = await Patient.find({ _id: { $in: caregiver.patientIds } });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/patients/:id", async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      caregiverId: req.caregiver._id,
    });
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/patients/:id", async (req, res) => {
  try {
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, caregiverId: req.caregiver._id },
      req.body,
      { new: true }
    );
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/patients/:id/schedule", async (req, res) => {
  try {
    const { schedule } = req.body;
    const patient = await Patient.findOneAndUpdate(
      { _id: req.params.id, caregiverId: req.caregiver._id },
      { dailySchedule: schedule },
      { new: true }
    );
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/patients/:id/message", async (req, res) => {
  try {
    const { message } = req.body;
    const io = req.app.get("io");
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Not found" });

    io.to(`patient_${req.params.id}`).emit("caregiver_message", {
      message,
      from: req.caregiver.name,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/patients/:id/reminders", async (req, res) => {
  try {
    const reminders = await Reminder.find({ patientId: req.params.id }).sort({ time: 1 });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/patients/:id/reminders", async (req, res) => {
  try {
    const { time, message, type, days } = req.body;
    const reminder = await Reminder.create({
      patientId: req.params.id,
      time,
      message,
      type: type || "other",
      days: days || ["mon","tue","wed","thu","fri","sat","sun"],
    });
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/reminders/:id", async (req, res) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/reminders/:id", async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/patients/:id/logs", async (req, res) => {
  try {
    const logs = await ConversationLog.find({ patientId: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/patients/:id/distress", async (req, res) => {
  try {
    const events = await DistressEvent.find({ patientId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/distress/:id/acknowledge", async (req, res) => {
  try {
    const event = await DistressEvent.findByIdAndUpdate(
      req.params.id,
      {
        acknowledged: true,
        acknowledgedAt: new Date(),
        acknowledgedBy: req.caregiver.name,
        notes: req.body.notes,
      },
      { new: true }
    );
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
