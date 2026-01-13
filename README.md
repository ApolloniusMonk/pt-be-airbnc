# Airbnc Backend API

This repository contains the backend for AirBnC, a full-stack Airbnb-style property listing application.

The API is built with Node.js and Express, backed by a PostgreSQL database, and provides endpoints for retrieving properties, images, users, reviews, and favourites. It is designed to be consumed by a React frontend.

## Tech Stack

- Node.js
- Express
- PostgreSQL
- pg (Postgres client)
- dotenv (environment variables)
- Jest and Supertest (testing)

## Installation

```bash
npm install
```

## Database Setup

This project uses postreSQL and requires local databases for development and testing.
Create the database by running:

```bash
npm run setup-db
```

This will create both the development and test databases.

## Seeding the Database

Seed the databases with initial data:

- Seed the development database:

```bash
npm run seed
```

- Seed the test database:

```bash
npm run seed-test
```

## Environment Variables

Create a .env file in the root directory.

Example:

PGDATABASE=airbnc_dev
For testing, Jest will automatically use the test database.

## Running the Server

To start the server in development mode:

```bash
npm run dev
```

The server will be available locally at:

http://localhost:9090

## Testing

Run the full test suite with:

```bash
npm test
```

To run tests for the app:

```bash
npm run test-app
```

## Live API

The API is deployed and publicly accessible:
Live API:
https://pt-be-airbnc-txl6.onrender.com/

To access endpoints, append /api to the URL.
For example:

```bash
https://pt-be-airbnc-txl6.onrender.com/api/properties
```
