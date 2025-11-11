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
});
