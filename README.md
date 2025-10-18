# AirBNC Express Server

This is the source code for RESTful backend server which serves up properties for an airbnb style property site.
The server was built in `express` and connects to a postgreSQL database.

You'll need a postgreSQL server running on your machine.

# Setup Instructions

- run `npm install` to install the necessary dependencies.
- create the local test database using the script `npm run setup-db`

# Database Connection

This project uses a postreSQL connection pool with the pg package.
Database credentials are stored in environment variables using dotenv.
