import request from "supertest";
import { expect } from "chai";
import app from "../app.js";

describe("Goals API", () => {
  it("should get goals for a specific user", async () => {
    const res = await request(app).get("/api/goals/user/1");
    expect(res.status).to.equal(200);
    expect(res.body.success).to.be.true;
  });

  it("should create a new goal", async () => {
    const res = await request(app)
      .post("/api/goals")
      .send({ userId: 1, goal: "Swim 1 mile", progress: 0 });

    expect(res.status).to.equal(201);
    expect(res.body.success).to.be.true;
  });

  // NEW TESTS START HERE
  it("should return empty array for a user with no goals", async () => {
    const res = await request(app).get("/api/goals/user/9999");
    expect(res.status).to.equal(200);
    expect(res.body.data).to.be.an("array").that.is.empty;
  });

  it("should update a goal's progress", async () => {
    const create = await request(app)
      .post("/api/goals")
      .send({ userId: 1, goal: "Test update", progress: 10 });

    const goalId = create.body.data.id;

    const update = await request(app)
      .put(`/api/goals/${goalId}`)
      .send({ progress: 50 });

    expect(update.status).to.equal(200);
    expect(update.body.data.progress).to.equal(50);
  });

  it("should return 404 when updating a non-existent goal", async () => {
    const res = await request(app)
      .put("/api/goals/99999")
      .send({ progress: 20 });

    expect(res.status).to.equal(404);
  });

  it("should delete a goal", async () => {
    const create = await request(app)
      .post("/api/goals")
      .send({ userId: 2, goal: "To delete", progress: 0 });

    const goalId = create.body.data.id;

    const del = await request(app).delete(`/api/goals/${goalId}`);

    expect(del.status).to.equal(200);
    expect(del.body.message).to.equal("Goal deleted successfully");
  });

  it("should return 404 when deleting non-existent goal", async () => {
    const res = await request(app).delete("/api/goals/99999");
    expect(res.status).to.equal(404);
  });
});
