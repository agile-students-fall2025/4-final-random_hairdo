import express from "express";
import { goals, getNextId } from "../utils/mockData.js";

const router = express.Router();

// GET /api/goals/user/:userId
router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;
  const userGoals = goals.filter(g => g.userId == userId);
  res.json({ success: true, data: userGoals });
});

// POST /api/goals
router.post("/", (req, res) => {
  const { userId, goal, progress = 0 } = req.body;
  const newGoal = { id: getNextId(goals), userId, goal, progress };
  goals.push(newGoal);
  res.status(201).json({ success: true, data: newGoal });
});

// PUT /api/goals/:id
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;
  const goal = goals.find(g => g.id == id);
  if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });
  goal.progress = progress ?? goal.progress;
  res.json({ success: true, data: goal });
});

// DELETE /api/goals/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = goals.findIndex(g => g.id == id);
  if (index === -1) return res.status(404).json({ success: false, message: "Goal not found" });
  goals.splice(index, 1);
  res.json({ success: true, message: "Goal deleted successfully" });
});

export default router;
