const {addUserDefaults, formatProperties} = require ("../db/utils");

describe("addUserDefaults", () => {
    test("returns an empty array when given no users", () => {
        expect(addUserDefaults()).toEqual([]);
    })
    test("adds an incrementing user_id starting at 1", () => {
        const users = [{first_name: 'Alice'}, {first_name: "Bob"}];
        const result = addUserDefaults(users);

        expect(result[0].user_id).toBe(1);
        expect(result[1].user_id).toBe(2)
    })
    test("adds created_at property as a Date object", () => {
        const users = [{first_name: "Alice"}];
        const result = addUserDefaults(users);
        expect(result[0].created_at).toBeInstanceOf(Date)
    })
})   

describe("format properties", () => {
    test.only("returns an empty array when given an empty array", () => {
        expect(formatProperties([])).toEqual([]);
    })
    test.only("maps a property with a host_name to the correct host_id", () => {
        const users = [{user_id: 1, first_name: "Alice", surname: "Johnson"}]
        const properties = [{
    "name": "Modern Apartment in City Center",
    "property_type": "Apartment",
    "location": "London, UK",
    "price_per_night": 120.0,
    "description": "Description of Modern Apartment in City Center.",
    "host_name": "Alice Johnson",
    "amenities": ["WiFi", "TV", "Kitchen"]
    }
   ]
        const result = formatProperties(properties, users);
        expect(result[0]).toMatchObject({
            host_id: 1,
            name: "Modern Apartment in City Center",
            location: "London, UK",
            property_type: "Apartment",
            price_per_night: 120.0,
            description: "Description of Modern Apartment in City Center."
        })
    })
})
    



 
