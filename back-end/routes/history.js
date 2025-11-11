// routes/history.js
import express from "express";
const router = express.Router();

// Temporary placeholder route so server doesn't crash
router.get("/", (req, res) => {
  res.json({ message: "History route connected successfully!" });
});

export default router;
