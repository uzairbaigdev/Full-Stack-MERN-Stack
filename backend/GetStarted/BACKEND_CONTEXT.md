# Backend Context for Frontend Integration

This document describes the backend as it currently exists in this repository. Use it as the API and architecture handoff when implementing the frontend. Do not assume that features listed under "Not implemented" already exist.

## Technology and project layout

- Node.js with ECMAScript modules (`"type": "module"`).
- Express 5 HTTP server.
- MongoDB Node.js driver 7 for database access.
- Joi for registration request validation.
- `jsonwebtoken` for registration JWTs.
- Node.js `crypto.scrypt` with a random per-user salt for password hashing.
- `server.js` loads environment variables with `dotenv/config`, parses JSON requests, mounts user routes, and serves `public/` as static files.

Relevant files:

- `server.js` — application initialization, middleware, route mounting, static file serving, server startup.
- `routes/usersRoutes.js` — user registration endpoint and password/JWT handling.
- `schemas/registerSchema.js` — Joi validation and normalization for registration data.
- `config/database.js` — MongoDB client, connection lifecycle, and database accessor.
- `schemas/userModel.js` — a Mongoose model file; it is currently not used by the routes.
- `public/index.html` — a basic static page; its attempt to fetch the user list does not correspond to an implemented API route.
- `bruno/Create User.bru` — sample registration request.

## Local development and configuration

From the `GetStarted` project directory:

- Install dependencies with `npm install`.
- Start normally with `npm start`, or use `npm run dev` for Node's watch mode.
- Default HTTP port is `3000`; `PORT` can override it.
- `MONGODB_URI` is required. The database module throws during import if this variable is missing.
- `MONGODB_DB_NAME` is optional and defaults to `Practice`.
- `JWT_SECRET` is required by the registration endpoint to sign a token.

Do not put environment-variable values or secrets in frontend code. The frontend should call the backend over HTTP and should never receive the MongoDB URI or JWT signing secret.

## Implemented API

### Register a user

`POST /users`

The endpoint expects `Content-Type: application/json`.

Request JSON:

```json
{
  "username": "hamza",
  "email": "hamza@example.com",
  "password": "SecurePass1!"
}
```

Validation rules:

- `username`: required string, trimmed, 3–15 characters.
- `email`: required string, trimmed and lowercased, Joi email format, maximum 254 characters.
- `password`: required string, maximum 128 characters, at least 8 characters, with at least one uppercase letter, lowercase letter, digit, and one of `@$!%*?&`. Other characters outside the password pattern are rejected.
- Unknown request properties are rejected.
- Validation collects all errors and returns them as `errors: [{ field, message }]`.

Successful response (`201`):

```json
{
  "message": "User created successfully",
  "code": 201,
  "token": "<signed JWT>"
}
```

The JWT expires after one hour. Its payload contains `username`, normalized `email`, and `UID`; its `sub` claim is the MongoDB inserted document ID. The backend does not return the created user document or MongoDB ID in the JSON response.

Validation error (`400`):

```json
{
  "message": "Invalid registration data",
  "code": 400,
  "errors": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

Configuration error (`500`): if `JWT_SECRET` is not configured, response message is `JWT signing secret is not configured`.

Database unavailable (`503`): if the database accessor reports that the connection is not initialized, response message is `Database is unavailable`.

Other registration/database errors (`500`):

```json
{
  "message": "Failed to create user",
  "code": 500
}
```

## Registration persistence and security

Registration writes to the MongoDB `users` collection. A created document currently contains:

- `username`
- normalized `email`
- `passwordSalt` — random 16-byte salt encoded as hexadecimal
- `passwordHash` — 64-byte scrypt hash encoded as hexadecimal
- `UID` — an integer generated with `Math.random()`
- `createdAt` — JavaScript date

The plaintext password is not returned and is not intended to be stored. The hash uses Node's scrypt; any future login/password verification endpoint must use the same algorithm and stored salt.

The database connection is attempted before the HTTP server starts. If the connection attempt fails, the startup catch logs the failure and still starts the HTTP server; registration will then fail because the database is unavailable.

## Frontend integration guidance

- For the static frontend served by this same Express server, call the relative URL `/users` to register. This avoids hard-coding a host and port.
- For a separately hosted frontend during development, configure a dev-server proxy to the backend or add a deliberate CORS policy on the backend. CORS middleware is not currently configured.
- Send the three required fields as JSON and show the server's `errors` array next to the corresponding form fields when a `400` is returned.
- On success, the response contains a JWT. No refresh-token or logout endpoint exists. If the frontend needs authenticated requests, it can send `Authorization: Bearer <token>`, but the backend currently has no protected routes or authentication middleware to validate that header.
- Do not treat the registration token as a complete authentication flow until protected routes and token verification are implemented.

## Not implemented / known gaps

- No login, logout, token refresh, password reset, email verification, or authenticated/profile endpoints.
- No `GET /users` endpoint exists. `public/index.html` currently requests it, so that page's user-list fetch cannot succeed as written.
- No username/email duplicate check or unique-index setup is present. Do not assume registration enforces uniqueness.
- No CORS policy, centralized error middleware, rate limiting, or request logging middleware is configured.
- `UID` uses `Math.random()` and has no uniqueness guarantee; use the MongoDB `_id` as the persistent document identifier.
- `schemas/userModel.js` defines a Mongoose model, but the application uses the native MongoDB driver and the route does not use this model. The package manifest does not list Mongoose. Treat the Mongoose model as unused/stale unless the backend is intentionally migrated.
- The static page and API are minimal examples, not a complete production account-management system.
