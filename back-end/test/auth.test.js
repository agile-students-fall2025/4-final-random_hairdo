import request from "supertest";
import { expect } from "chai";
import app from "../app.js";

describe("Auth API", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "TestUser", email: "test@nyu.edu", password: "abc123" });

    expect(res.status).to.equal(201); // ✅ Register should return 201
    expect(res.body.success).to.be.true;
  });

  it("should login successfully with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@nyu.edu", password: "abc123" });

    expect(res.status).to.equal(200); // ✅ Login should return 200
    expect(res.body.success).to.be.true;
  });
});
