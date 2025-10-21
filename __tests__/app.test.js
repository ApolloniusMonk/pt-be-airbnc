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

    describe("api/properties?property_type=<property type>", () => {
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

    describe("api/properties?maxprice=<max cost per night> and ?minprice=<min cost per night>", () => {
      test("responds with status of 200", async () => {
        const { body } = await request(app)
          .get("/api/properties?maxprice=200")
          .expect(200);
      });
      test("responds with properties where the price_per_night is less than or equal to maxprice", async () => {
        const maxprice = 200;

        const expected = propertiesData.filter(
          (p) => p.price_per_night <= maxprice
        );
        const { body } = await request(app)
          .get(`/api/properties?maxprice=${maxprice}`)
          .expect(200);

        expect(body.properties).toHaveLength(expected.length);

        body.properties.forEach((property) => {
          expect(Number(property.price_per_night)).toBeLessThanOrEqual(
            maxprice
          );
        });
      });
      test("responds with properties where the price_per_night is more than or equal to minprice", async () => {
        const minprice = 150;

        const expected = propertiesData.filter(
          (p) => p.price_per_night >= minprice
        );
        const { body } = await request(app)
          .get(`/api/properties?minprice=${minprice}`)
          .expect(200);

        expect(body.properties).toHaveLength(expected.length);

        body.properties.forEach((property) => {
          expect(Number(property.price_per_night)).toBeGreaterThanOrEqual(
            minprice
          );
        });
      });
      describe("Sad path for /api/properties", () => {
        test("responds with 400 and error message when minprice or maxprice is not a number", async () => {
          const { body } = await request(app)
            .get("/api/properties?minprice=abc")
            .expect(400);

          expect(body.msg).toBe("Invalid query parameter.");
        });

        test("responds with 404 and error message when property type does not exist", async () => {
          const { body } = await request(app)
            .get("/api/properties?property_type=castle")
            .expect(404);
        });
      });
    });

    describe("api/properties - sorting and ordering ", () => {
       test("sorts by cost per night ascending by default order parameter", async () => {
        const { body } = await request(app).get("/api/properties?sort=cost_per_night&order=ascending").expect(200);
        const prices= body.properties.map(p => Number (p.price_per_night));
        for(let i = 0; i < prices.length -1; i++) {
          expect(prices[i] <= prices[i+1]).toBe(true)
        }
       })

       test("sort by cost per night descending", async () => {
        const { body } = await request(app).get("/api/properties?sort=cost_per_night&order=descending").expect(200);
        const prices= body.properties.map(p => Number (p.price_per_night));
        for(let i = 0; i < prices.length -1; i++) {
          expect(prices[i] <= prices[i+1]).toBe(false)
        }
       })
       
       test("sorts by popularity (favourite_count) descending when requested", async () => {
        const { body } = await request(app).get("/api/properties?sort=popularity&order=descending").expect(200);
        const favs = body.properties.map(p => Number(p.favourite_count || 0));
        for(let i = 0; i < favs.length -1; i++) {
          expect(favs[i] >= [favs[i+1]]).toBe(true);
        }
       })

       test("400if invalid sort value", async () => {
        const { body } = await request(app).get("/api/properties?sort=invalid").expect(400);
        expect(body.msg).toBe("Invalid sort query.")
       })

       test("400 if invalid order value", async () => {
        const { body } = await request(app).get("/api/properties?sort=cost_per_night&order=notvalid").expect(400);
        expect(body.msg).toBe("Invalid order query.")
       })
  });

  describe("GET /api/properties/:id", () => {
    let propertyId;
   

    beforeEach(async () => {
      const { rows } = await db.query(
        "SELECT property_id FROM properties LIMIT 1;"
      );
      propertyId = rows[0].property_id;
    });
    //////// HAPPY PATH //////////
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

    describe("GET /api/properties/:id?user_id=<id>", () => {
      let userIdWhoFavourited;
      let userIdWhoDidNotFavourite;

      beforeEach(async () => {
        const { rows: favouriters } = await db.query("SELECT guest_id FROM favourites WHERE property_id = $1 LIMIT 1;", [propertyId]

        );
        userIdWhoFavourited = favouriters.length ? favouriters[0].guest_id : null

        const { rows: users } = await db.query("SELECT user_id FROM users;");
        const otherUser = users.find((u) => u.user_id !== userIdWhoFavourited);
        userIdWhoDidNotFavourite = otherUser ? otherUser.user_id : null;
        });

        test("responds with favourited: true if user id belongs to a user who has favourite this property", async () => {
          if (!userIdWhoFavourited) return;

          const { body } =  await request(app).get(`/api/properties/${propertyId}?user_id=${userIdWhoFavourited}`).expect(200)
          expect(body.property).toHaveProperty("favourited", true); 
        })
        test("responds with favourited: false if user id belongs to a user who has not favourite this property", async () => {
          if (!userIdWhoDidNotFavourite) return;

          const { body } =  await request(app).get(`/api/properties/${propertyId}?user_id=${userIdWhoDidNotFavourite}`).expect(200)
          expect(body.property).toHaveProperty("favourited", false)
        })
      
      })
  

    describe("Sad path for /api/properties/:id", () => {
      test("responds with 404 and error message 'Property with id <id> not found.' when id does not exist", async () => {
        const { body } = await request(app)
          .get("/api/properties/999999")
          .expect(404);

        expect(body.msg).toBe("Property with id 999999 not found.");
      });
      test("responds with 400 if user_id is not a number", async  () => {
          const { body } = await request(app).get(`/api/properties/${propertyId}?user_id=abc`).expect(400)

          expect(body.msg).toBe("Invalid user_id parameter.")
        })
    });
  })
})
  describe("GET /api/properties/:id/reviews", () => {
    let propertyId;
    let response;

    beforeEach(async () => {
      const { rows } = await db.query(
        "SELECT property_id FROM properties LIMIT 1;"
      );
      propertyId = rows[0].property_id;
      response = await request(app).get(
        `/api/properties/${propertyId}/reviews`
      );
    });

    test("responds with status 200", () => {
      expect(response.status).toBe(200);
    });

    test("responds with an object containing a 'reviews' key", () => {
      expect(response.body).toHaveProperty("reviews");
    });

    test("'reviews' is an array", () => {
      expect(Array.isArray(response.body.reviews)).toBe(true);
    });

    test("responds with an 'average_rating' key", () => {
      expect(response.body).toHaveProperty("average_rating");
    });

    test("reviews are ordered from latest to oldest by created at", () => {
      const reviews = response.body.reviews;

      if (reviews.length > 1) {
        for (let i = 0; i < reviews.length - 1; i++) {
          const currentDate = new Date(reviews[i].created_at);
          const nextDate = new Date(reviews[i + 1].created_at);

          expect(currentDate >= nextDate).toBe(true);
        }
      }
    });
    describe("Sad path for /api/properties/:id/reviews", () => {
      test("responds with 404 and error message if property id does not exist", async () => {
        const { body } = await request(app)
          .get("/api/properties/999999/reviews")
          .expect(404);

        expect(body.msg).toBe("No reviews found for property id 999999.");
      });
    });
});
  describe("GET /api/users/:id", () => {
    let userId;

    beforeEach(async () => {
      const { rows } = await db.query("SELECT user_id FROM users LIMIT 1;");
      userId = rows[0].user_id;
  })

  test("200: Returns user object with expected keys", async () => {
    const { body } = await request(app).get(`/api/users/${userId}`).expect(200);
    expect(body).toHaveProperty("user");
    const u = body.user;
    expect(u).toHaveProperty("user_id");
    expect(u).toHaveProperty("first_name");
    expect(u).toHaveProperty("surname");
    expect(u).toHaveProperty("email");
    expect(u).toHaveProperty("phone_number");
    expect(u).toHaveProperty("avatar");
    expect(u).toHaveProperty("created_at");
  });
  test("404 when user id does not exist", async () => {
    const { body } = await request(app).get("/api/users/999999").expect(404);
    expect(body.msg).toBe("User with id 999999 not found.")
  })
  })
  describe("POST /api/properties/:id/reviews", () => {
    let propertyId;
    let aGuestId;

    beforeEach(async () => {
      const { rows: p } = await db.query("SELECT property_id FROM properties LIMIT 1");
      propertyId = p[0].property_id;
      const { rows: u } = await db.query("SELECT user_id FROM users WHERE is_host = false LIMIT 1");
      aGuestId = u[0].user_id; 
    });
    test("201: inserts and returns the created review", async () => {
      const payload = {guest_id: aGuestId, rating: 4, comment: "Nice place"};
      const { body } = await request(app).post(`/api/properties/${propertyId}/reviews`).send(payload).expect(201)

      expect(body).toHaveProperty("review_id");
      expect(body.property_id).toBe(propertyId);
      expect(body.rating).toBe(payload.rating);
      expect(body.comment).toBe(payload.comment);
      expect(new Date(body.created_at)).toBeInstanceOf(Date)
    });

    test("404: missing required fields", async () => {
      const { body } = await request(app).post(`/api/properties/${propertyId}/reviews`).send({ rating: 5}).expect(400);
      expect(body.msg).toBe("Missing required fields.")
    });

    test("404: property id does not exist", async () => {
    const payload = { guest_id: aGuestId, rating: 4, comment: "Nice" };
    const { body } = await request(app)
      .post("/api/properties/999999/reviews")
      .send(payload)
      .expect(404);
    expect(body.msg).toBe("Property with id 999999 not found.");
    });

    test("400: rating not a number or out of range", async () => {
    const payload = { guest_id: aGuestId, rating: "bad", comment: "x" };
    const { body } = await request(app)
      .post(`/api/properties/${propertyId}/reviews`)
      .send(payload)
      .expect(400);
    expect(body.msg).toBe("Invalid rating.");
    });
  });
  describe("DELETE /api/reviews/:id", () => {
  let reviewId;
  beforeEach(async () => {
    const { rows } = await db.query("SELECT review_id FROM reviews LIMIT 1;");
    reviewId = rows[0].review_id;
  });

  test("204: deletes the review and returns no content", async () => {
    await request(app).delete(`/api/reviews/${reviewId}`).expect(204);
    const { rows } = await db.query("SELECT * FROM reviews WHERE review_id = $1", [reviewId]);
    expect(rows.length).toBe(0);
  });

  test("404: if review id does not exist", async () => {
    const { body } = await request(app).delete("/api/reviews/999999").expect(404);
    expect(body.msg).toBe("Review with ID 999999 not found.");
  });
});

})

