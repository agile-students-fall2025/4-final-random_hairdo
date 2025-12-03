import request from "supertest";
import { expect } from "chai";
import app from "../app.js";

describe("Auth API", () => {
  // Generate a unique email for this test run
  const randomEmail = `testuser_${Date.now()}@nyu.edu`;

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "TestUser", email: randomEmail, password: "abc123" });

    expect(res.status).to.equal(201); // Register should return 201
    expect(res.body.success).to.be.true;
    expect(res.body.data.email).to.equal(randomEmail);
  });

  it("should login successfully with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: randomEmail, password: "abc123" });

    expect(res.status).to.equal(200); // Login should return 200
    expect(res.body.success).to.be.true;
    expect(res.body.data.user.email).to.equal(randomEmail);
    expect(res.body.data).to.have.property("token");
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: randomEmail, password: "wrongpass" });

    expect(res.status).to.equal(401);
    expect(res.body.success).to.be.false;
    expect(res.body.message).to.equal("Invalid credentials");
  });
});
