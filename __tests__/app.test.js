const request = require("supertest");
const app = require("../app");
const seed = require("../db/seed");
const {
  propertyTypesData,
  usersData,
  propertiesData,
  reviewsData,
} = require("../db/data/test");
const db = require("../db/db-connection-pool");

beforeEach(async () => {
  await seed(propertyTypesData, usersData, propertiesData, reviewsData);
});

afterAll(() => {
  db.end();
});

describe("app", () => {
  describe("GET api/properties", () => {
    test("responds with status of 200", async () => {
      await request(app).get("/api/properties").expect(200);
    });
  });
  test("responds with an array on the key of properties", async () => {
    const { body } = await request(app).get("/api/properties");

    expect(Array.isArray(body.properties)).toBe(true);
  });
  test("respnds with correct number of properties", async () => {
    const { body } = await request(app).get("/api/properties");

    expect(body.properties).toHaveLength(propertiesData.length);
  });
  test("each property has correct keys", async () => {
    const { body } = await request(app).get("/api/properties");

    body.properties.forEach((property) => {
      expect(property).toHaveProperty("property_id");
      expect(property).toHaveProperty("property_name");
      expect(property).toHaveProperty("location");
      expect(property).toHaveProperty("price_per_night");
      expect(property).toHaveProperty("host");
    });
  });
});
