const seed = require("./seed");
const {propertyTypesData} = require("./data/test")
const {usersData} = require("./data/test")
const {propertiesData} = require("./data/test")
const {reviewsData} = require("./data/test");

seed(propertyTypesData, usersData, propertiesData, reviewsData);