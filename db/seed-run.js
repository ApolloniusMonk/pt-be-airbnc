const db = require("./db-connection-pool");
const seed = require("./seed");
const {
  propertyTypesData,
  imagesData,
  usersData,
  propertiesData,
  reviewsData,
  favouritesData,
} = require("./data");

seed(
  propertyTypesData,
  usersData,
  propertiesData,
  reviewsData,
  imagesData,
  favouritesData
).then(() => {
  db.end();
});
