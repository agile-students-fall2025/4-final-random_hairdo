import express from "express";
const router = express.Router();

// Example route
router.get("/", (req, res) => {
  res.json({ success: true, message: "All users endpoint works!" });
});

export default router; // ✅ REQUIRED
