const addUserDefaults = require ("../db/utils");

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


 
