import express from "express";
import { users, getNextId } from "../utils/mockData.js";

const router = express.Router();

// 🧾 REGISTER: POST /api/auth/register
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  // Check if user exists
  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(409).json({ success: false, message: "User already exists" });
  }

  // Create new user
  const newUser = { id: getNextId(users), name, email, password };
  users.push(newUser);

  res.status(201).json({ success: true, data: newUser });
});

// 🔐 LOGIN: POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Check fields
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  // Match user
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  res.json({
    success: true,
    message: "Login successful",
    data: { id: user.id, name: user.name, email: user.email }
  });
});

export default router;
