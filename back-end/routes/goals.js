import express from "express";
import { goals, getNextId } from "../utils/mockData.js";

const router = express.Router();

/**
 * GET /api/goals/user/:userId
 * Returns all goals for a specific user
 */
router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required"
    });
  }

  const userGoals = goals.filter(g => g.userId == userId);

  return res.json({
    success: true,
    count: userGoals.length,
    data: userGoals
  });
});

/**
 * POST /api/goals
 * Creates a new goal
 */
router.post("/", (req, res) => {
  const { userId, goal, progress = 0 } = req.body;

  if (!userId || !goal) {
    return res.status(400).json({
      success: false,
      message: "userId and goal are required fields"
    });
  }

  const newGoal = {
    id: getNextId(goals),
    userId,
    goal,
    progress
  };

  goals.push(newGoal);

  return res.status(201).json({
    success: true,
    message: "Goal created successfully",
    data: newGoal
  });
});

/**
 * PUT /api/goals/:id
 * Updates the progress of a goal
 */
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { progress } = req.body;

  if (progress === undefined) {
    return res.status(400).json({
      success: false,
      message: "Progress value is required"
    });
  }

  const goal = goals.find(g => g.id == id);

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: "Goal not found"
    });
  }

  goal.progress = progress;

  return res.json({
    success: true,
    message: "Goal updated successfully",
    data: goal
  });
});

/**
 * DELETE /api/goals/:id
 * Deletes a goal
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  const index = goals.findIndex(g => g.id == id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Goal not found"
    });
  }

  goals.splice(index, 1);

  return res.json({
    success: true,
    message: "Goal deleted successfully"
  });
});

export default router;
