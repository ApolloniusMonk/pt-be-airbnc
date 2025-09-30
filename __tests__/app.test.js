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
  await seed(reviewsData, propertiesData, usersData, propertyTypesData);
});

afterAll(() => {
  db.end();
});

describe("app", () => {
  describe("GET api/properties", () => {
    test("responds with status of 200", async () => {
      const response = await request(app).get("/api/properties").expect(200);
    });
  });
});
