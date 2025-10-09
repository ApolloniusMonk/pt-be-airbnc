const db = require("./db-connection-pool");
const seed = require("./seed");
const {
  propertyTypesData,
  imagesData,
  usersData,
  propertiesData,
  reviewsData,
} = require("./data");

seed(
  propertyTypesData,
  usersData,
  propertiesData,
  reviewsData,
  imagesData
).then(() => {
  db.end();
});
