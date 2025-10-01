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
    console.log(body);

    expect(Array.isArray(body.properties)).toBe(true);
  });
  test("respnds with correct number of properties", async () => {
    const { body } = await request(app).get("/api/properties");

    expect(body.properties).toHaveLength(propertiesData.length);
  });
  test("each property has correct keys", async () => {
    const { body } = await request(app).get("/api/properties");

    expect(body.properties[0].property_id).toBe(1);
    expect(body.properties[0].property_name).toBe(
      "Modern Apartment in City Center"
    );
    expect(body.properties[0].location).toBe("London, UK");
    expect(body.properties[0].price_per_night).toBe(120.0);
    expect(body.properties[0].host).toBe("Alice Johnson");
  });
});
