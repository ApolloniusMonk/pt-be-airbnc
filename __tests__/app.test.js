const request = require("supertest");
const app = require("../app");
const seed = require("../db/seed");
const {
  propertyTypesData,
  usersData,
  propertiesData,
  reviewsData,
  imagesData,
} = require("../db/data/test");
const db = require("../db/db-connection-pool");

beforeEach(async () => {
  await seed(
    propertyTypesData,
    usersData,
    propertiesData,
    reviewsData,
    imagesData
  );
});

afterAll(() => {
  db.end();
});

describe("app", () => {
  test("404 path not found", async () => {
    const { body } = await request(app).get("/invalid/path").expect(404);

    expect(body.msg).toBe("Path not found.");
  });
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
  describe("GET api/properties/?property_type=<property type>", () => {
    test("responds with status of 200", async () => {
      const { body } = await request(app)
        .get("/api/properties/?property_type=Apartment")
        .expect(200);
    });
    test("responds with properties that match property type that has been passed", async () => {
      const expectedApartments = propertiesData.filter(
        (p) => p.property_type === "Apartment"
      );

      const { body } = await request(app)
        .get("/api/properties/?property_type=Apartment")
        .expect(200);
      expect(body.properties).toHaveLength(expectedApartments.length);
      body.properties.forEach((property) => {
        expect(property.property_type).toBe("Apartment");
      });
    });
  });
});
