// tests/goals.test.js
import request from "supertest";
import { expect } from "chai";
import app from "../app.js";

let token; // JWT token for auth
let createdGoalId; // store created goal id for update/delete tests

describe("Goals API", () => {
  // ------------------------
  // Before all tests: log in
  // ------------------------
  before(async () => {
    // Login as test user
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "testuser@example.com", password: "TestPass123" });

    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;

    token = res.body.data.token;
  });

  // ------------------------
  // GET all goals (should be empty initially)
  // ------------------------
  it("should return an empty array if user has no goals", async () => {
    const res = await request(app)
      .get("/api/goals")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array").that.is.empty;
  });

  // ------------------------
  // CREATE a new goal
  // ------------------------
  it("should create a new goal", async () => {
    const res = await request(app)
      .post("/api/goals")
      .set("Authorization", `Bearer ${token}`)
      .send({ goal: "Swim 1 mile" });

    expect(res.status).to.equal(201);
    expect(res.body.goal).to.equal("Swim 1 mile");
    expect(res.body.progress).to.equal(0);

    createdGoalId = res.body._id; // store id for later tests
  });

  // ------------------------
  // UPDATE a goal
  // ------------------------
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

  // ------------------------
  // DELETE a goal
  // ------------------------
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

  // ------------------------
  // Unauthorized access
  // ------------------------
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
});
