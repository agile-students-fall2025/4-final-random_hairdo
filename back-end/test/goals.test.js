// test/goals.test.js
import request from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";
import app from "../app.js";
import dotenv from "dotenv";
import { User, Goal } from "../db.js";

dotenv.config();

let token; // JWT token for auth
let createdGoalId; // store created goal id for update/delete tests

describe("Goals API", () => {
  before(async () => {
    try {
      // Connect to test DB
      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGODB_UNIT_TEST_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB test database");
      }

      // Clear old test goals
      await Goal.deleteMany({});

      // Delete test user if exists
      await User.deleteOne({ email: "testuser@nyu.edu" });

      // Register test user with NYU email as required by validation
      const registerRes = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "testuser@nyu.edu",
          password: "TestPass123!@#",
          username: "testuser123", // Add if your model requires it
        });

      // Log the response for debugging
      if (registerRes.status !== 201) {
        console.error("Registration failed:", registerRes.status);
        console.error("Response body:", registerRes.body);
        throw new Error(`Registration failed: ${JSON.stringify(registerRes.body)}`);
      }

      expect(registerRes.status).to.equal(201);

      // Login to get token
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ 
          email: "testuser@nyu.edu", 
          password: "TestPass123!@#" 
        });

      if (loginRes.status !== 200) {
        console.error("Login failed:", loginRes.status);
        console.error("Response body:", loginRes.body);
        throw new Error(`Failed to login test user: ${loginRes.status}`);
      }

      // Extract token - check different possible locations
      token = loginRes.body.data?.token || loginRes.body.token || loginRes.body.data;
      
      if (!token) {
        console.error("Token not found in response:", loginRes.body);
        throw new Error("Token not found in login response");
      }
      
      console.log("Token extracted successfully");
    } catch (error) {
      console.error("Setup error:", error);
      throw error;
    }
  });

  it("should return an empty array if user has no goals", async () => {
    const res = await request(app)
      .get("/api/goals")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array").that.is.empty;
  });

  it("should create a new goal", async () => {
    const res = await request(app)
      .post("/api/goals")
      .set("Authorization", `Bearer ${token}`)
      .send({ goal: "Swim 1 mile" });

    expect(res.status).to.equal(201);
    expect(res.body.goal).to.equal("Swim 1 mile");
    expect(res.body.progress).to.equal(0);

    createdGoalId = res.body._id;
  });

  it("should update a goal's progress", async () => {
    const res = await request(app)
      .put(`/api/goals/${createdGoalId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ progress: 50 });

    expect(res.status).to.equal(200);
    expect(res.body.progress).to.equal(50);
  });

  it("should return 404 when updating a non-existent goal", async () => {
    const res = await request(app)
      .put("/api/goals/999999999999999999999999")
      .set("Authorization", `Bearer ${token}`)
      .send({ progress: 20 });

    expect(res.status).to.equal(404);
  });

  it("should delete a goal", async () => {
    const res = await request(app)
      .delete(`/api/goals/${createdGoalId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal("Goal deleted successfully");
  });

  it("should return 404 when deleting a non-existent goal", async () => {
    const res = await request(app)
      .delete("/api/goals/999999999999999999999999")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(404);
  });

  it("should deny access without a token", async () => {
    const res = await request(app).get("/api/goals");
    expect(res.status).to.equal(401);
  });

  it("should deny access with an invalid token", async () => {
    const res = await request(app)
      .get("/api/goals")
      .set("Authorization", "Bearer INVALIDTOKEN");

    expect(res.status).to.equal(401);
  });

  after(async () => {
    await mongoose.connection.close();
    console.log("Disconnected from test MongoDB");
  });
});