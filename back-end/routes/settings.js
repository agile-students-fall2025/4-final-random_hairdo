// routes/settings.js
import express from "express";
const router = express.Router();

// ✅ Placeholder route for now
router.get("/", (req, res) => {
  res.json({ message: "Settings route connected successfully!" });
});

export default router;
