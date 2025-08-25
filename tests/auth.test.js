const request = require("supertest");
const app = require("../src/app");
const mongoose = require("mongoose");
const redisClient = require("../src/config/redis"); 
jest.setTimeout(30000);

describe("Auth Tests", () => {
    afterAll(async () => {
      await mongoose.connection.close();
      if (redisClient.isOpen) {
        await redisClient.quit();
      }
    });

  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "test", email: "test@test.com", password: "123456" });

    expect(res.statusCode).toBe(201);
  });
});