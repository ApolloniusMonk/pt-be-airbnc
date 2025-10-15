const request = require("supertest");
const app = require("../app");
const seed = require("../db/seed");
const {
  propertyTypesData,
  usersData,
  propertiesData,
  reviewsData,
  imagesData,
  favouritesData,
} = require("../db/data/test");
const db = require("../db/db-connection-pool");

beforeEach(async () => {
  await seed(
    propertyTypesData,
    usersData,
    propertiesData,
    reviewsData,
    imagesData,
    favouritesData
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
    describe("GET api/properties?property_type=<property type>", () => {
      test("responds with status of 200", async () => {
        const { body } = await request(app)
          .get("/api/properties?property_type=Apartment")
          .expect(200);
      });
      test("responds with properties that match property type that has been passed", async () => {
        const expectedApartments = propertiesData.filter(
          (p) => p.property_type === "Apartment"
        );

        const { body } = await request(app)
          .get("/api/properties?property_type=Apartment")
          .expect(200);
        expect(body.properties).toHaveLength(expectedApartments.length);
        body.properties.forEach((property) => {
          expect(property.property_type).toBe("Apartment");
        });
      });
    });
    describe("GET api/properties?maxprice=<max cost per night> and ?minprice=<min cost per night>", () => {
      test("responds with status of 200", async () => {
        const { body } = await request(app)
          .get("/api/properties?maxprice=200")
          .expect(200);
      });
      test("responds with properties where the price_per_night is less than or equal to maxprice", async () => {
        const maxPrice = 200;

        const expected = propertiesData.filter(
          (p) => p.price_per_night <= maxPrice
        );
        const { body } = await request(app)
          .get(`/api/properties?maxprice=${maxPrice}`)
          .expect(200);
        console.log({ body });
        expect(body.properties).toHaveLength(expected.length);

        body.properties.forEach((property) => {
          expect(Number(property.price_per_night)).toBeLessThanOrEqual(
            maxPrice
          );
        });
      });
      test("responds with properties where the price_per_night is more than or equal to minprice", async () => {
        const minPrice = 150;

        const expected = propertiesData.filter(
          (p) => p.price_per_night >= minPrice
        );
        const { body } = await request(app)
          .get(`/api/properties?minprice=${minPrice}`)
          .expect(200);

        expect(body.properties).toHaveLength(expected.length);

        body.properties.forEach((property) => {
          expect(Number(property.price_per_night)).toBeGreaterThanOrEqual(
            minPrice
          );
        });
      });

      describe("GET /api/properties/:id", () => {
        let propertyId;

        beforeEach(async () => {
          const { rows } = await db.query(
            "SELECT property_id FROM properties LIMIT 1;"
          );
          propertyId = rows[0].property_id;
        });

        test("responds with status 200 and a property object", async () => {
          const { body } = await request(app)
            .get(`/api/properties/${propertyId}`)
            .expect(200);

          expect(body).toHaveProperty("property");
          expect(typeof body.property).toBe("object");
        });

        test("returns the correct property data", async () => {
          const { body } = await request(app)
            .get(`/api/properties/${propertyId}`)
            .expect(200);

          const p = body.property;

          expect(propertyId[0]).toBe(propertyId.property_id);
          expect(propertyId[1]).toBe(propertyId.property_name);
          expect(propertyId[2]).toBe(propertyId.location);
          expect(Number(propertyId.price_per_night)).toBe(
            Number(propertyId.price_per_night)
          );
        });
        test("includes host name and avatar", async () => {
          const { body } = await request(app)
            .get(`/api/properties/${propertyId}`)
            .expect(200);

          const p = body.property;
          expect(p.host).toBeTruthy();
          expect(p.host_avatar).toBeTruthy();
        });
        test("include favourites count", async () => {
          const { body } = await request(app)
            .get(`/api/properties/${propertyId}`)
            .expect(200);
          const p = body.property;

          expect(Number(p.favourite_count)).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});
