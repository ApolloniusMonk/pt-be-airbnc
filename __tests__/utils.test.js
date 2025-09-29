const {
  addUserDefaults,
  formatProperties,
  formatReviews,
} = require("../db/utils");

describe("addUserDefaults", () => {
  test("returns an empty array when given no users", () => {
    expect(addUserDefaults()).toEqual([]);
  });
  test("adds an incrementing user_id starting at 1", () => {
    const users = [{ first_name: "Alice" }, { first_name: "Bob" }];
    const result = addUserDefaults(users);

    expect(result[0].user_id).toBe(1);
    expect(result[1].user_id).toBe(2);
  });
  test("adds created_at property as a Date object", () => {
    const users = [{ first_name: "Alice" }];
    const result = addUserDefaults(users);
    expect(result[0].created_at).toBeInstanceOf(Date);
  });
});

describe("format properties", () => {
  test("returns an empty array when given an empty array", () => {
    expect(formatProperties([])).toEqual([]);
  });
  test("maps a property with a host_name to the correct host_id", () => {
    const users = [{ user_id: 1, first_name: "Alice", surname: "Johnson" }];
    const properties = [
      {
        name: "Modern Apartment in City Center",
        property_type: "Apartment",
        location: "London, UK",
        price_per_night: 120.0,
        description: "Description of Modern Apartment in City Center.",
        host_name: "Alice Johnson",
        amenities: ["WiFi", "TV", "Kitchen"],
      },
    ];
    const result = formatProperties(properties, users);
    expect(result[0]).toMatchObject({
      host_id: 1,
      name: "Modern Apartment in City Center",
      location: "London, UK",
      property_type: "Apartment",
      price_per_night: 120.0,
      description: "Description of Modern Apartment in City Center.",
    });
  });

  describe("formatReviews", () => {
    test("returns an empty array when given no reviews", () => {
      expect(formatReviews([], [], [])).toEqual([]);
    });

    test("maps guest_name and property_name to correct IDs", () => {
      const users = [{ user_id: 1, first_name: "Frank", surname: "White" }];
      const properties = [
        { property_id: 5, name: "Chic Studio Near the Beach" },
      ];

      const reviews = [
        {
          guest_name: "Frank White",
          property_name: "Chic Studio Near the Beach",
          rating: 4,
          comment: "Comment about Chic Studio Near the Beach",
          created_at: "2024-03-28T10:15:00Z",
        },
      ];

      const result = formatReviews(reviews, users, properties);

      expect(result[0]).toMatchObject({
        property_id: 5,
        guest_id: 1,
        rating: 4,
        comment: "Comment about Chic Studio Near the Beach",
      });
      expect(result[0].created_at).toBeInstanceOf(Date);
    });
  });
});
