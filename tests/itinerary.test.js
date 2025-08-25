const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const Itinerary = require("../src/models/Itinerary"); 
const User = require("../src/models/User");
const { client: redisClient } = require("../src/config/redis");

jest.setTimeout(60000);

let mongoServer;
let authToken;
let testUserEmail;
let testItineraryId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  testUserEmail = `user${Date.now()}@test.com`;
  const user = await User.create({ username: "tester", email: testUserEmail, password: "123456" });
  authToken = "Bearer " + (user.generateJWT ? user.generateJWT() : ""); 
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  if (redisClient.isOpen) await redisClient.quit();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe("Itinerary API", () => {
  // Create Itinerary
  it("should create a new itinerary", async () => {
    const res = await request(app)
      .post("/api/itinerary")
      .set("Authorization", authToken)
      .send({
        title: "Test Trip",
        description: "Trip description",
        startDate: "2025-09-01",
        endDate: "2025-09-05",
        locations: ["Delhi", "Jaipur"],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    expect(res.body.title).toBe("Test Trip");
    testItineraryId = res.body._id; // save for later tests
  });
  // Get all itineraries
  it("should get all itineraries", async () => {
    // Add a test itinerary first
    await Itinerary.create({
      title: "Sample Trip",
      description: "Desc",
      startDate: "2025-09-01",
      endDate: "2025-09-03",
      locations: ["Mumbai"],
    });

    const res = await request(app)
      .get("/api/itinerary")
      .set("Authorization", authToken);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
  // Get single itinerary
  it("should get a single itinerary by ID", async () => {
    const itinerary = await Itinerary.create({
      title: "Single Trip",
      description: "Desc",
      startDate: "2025-09-01",
      endDate: "2025-09-03",
      locations: ["Goa"],
    });

    const res = await request(app)
      .get(`/api/itinerary/${itinerary._id}`)
      .set("Authorization", authToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", itinerary._id.toString());
  });
  // Update itinerary
  it("should update an itinerary", async () => {
    const itinerary = await Itinerary.create({
      title: "Old Trip",
      description: "Old Desc",
      startDate: "2025-09-01",
      endDate: "2025-09-03",
      locations: ["Pune"],
    });

    const res = await request(app)
      .put(`/api/itinerary/${itinerary._id}`)
      .set("Authorization", authToken)
      .send({ title: "Updated Trip", locations: ["Pune", "Lonavala"] });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated Trip");
    expect(res.body.locations).toContain("Lonavala");
  });
  // Delete itinerary
  it("should delete an itinerary", async () => {
    const itinerary = await Itinerary.create({
      title: "To Delete",
      description: "Desc",
      startDate: "2025-09-01",
      endDate: "2025-09-03",
      locations: ["Shimla"],
    });

    const res = await request(app)
      .delete(`/api/itinerary/${itinerary._id}`)
      .set("Authorization", authToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message");

    // Verify it is gone
    const check = await Itinerary.findById(itinerary._id);
    expect(check).toBeNull();
  });
});
