# Access Key Management Microservice

This service manages API access keys with rate limits and expiration, and publishes key events to Redis.

## Features
- Create, update, delete, list, and disable API keys
- MongoDB for persistent storage
- Redis Pub/Sub for key event notifications
- RESTful API (admin and user endpoints)

## Environment Variables
- `MONGODB_URI` (default: `mongodb://localhost/access-key-service`)
- `REDIS_URL` (default: `redis://localhost:6379`)

## Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start MongoDB and Redis** (Docker example):
   ```bash
   docker run -d --name mongo -p 27017:27017 mongo:6
   docker run -d --name redis -p 6379:6379 redis:7
   ```
3. **Run the service:**
   ```bash
   npm run start:dev
   ```

## Running with Docker

1. **Start MongoDB and Redis (if not already running):**
   ```bash
   docker run -d --name mongo -p 27017:27017 mongo:6
   docker run -d --name redis -p 6379:6379 redis:7
   ```
2. **Build the image:**
   ```bash
   docker build -t access-key-service .
   ```
3. **Run the container:**
   ```bash
   docker run -p 3000:3000 \
     -e MONGODB_URI='mongodb://host.docker.internal:27017/access-key-service' \
     -e REDIS_URL='redis://host.docker.internal:6379' \
     access-key-service
   ```

## API Endpoints

### Admin
- `POST /admin/keys` — Create key
- `DELETE /admin/keys/:key` — Delete key
- `GET /admin/keys` — List keys
- `PATCH /admin/keys/:key` — Update key

### Users
- `GET /users/keys/:key` — Get key details
- `PATCH /users/keys/:key/disable` — Disable key

## Testing with Postman

1. **Import Endpoints:**
   - Use the above endpoints in Postman.
   - Set the request URL to `http://localhost:3000` (or your Docker host IP).

2. **Example: Create a Key (Admin)**
   - Method: `POST`
   - URL: `http://localhost:3000/admin/keys`
   - Body (JSON):
     ```json
     {
       "rateLimit": 10,
       "expiresAt": "2025-12-31T23:59:59.000Z"
     }
     ```

3. **Example: List Keys (Admin)**
   - Method: `GET`
   - URL: `http://localhost:3000/admin/keys`

4. **Example: Get Key Details (User)**
   - Method: `GET`
   - URL: `http://localhost:3000/users/keys/{key}`

5. **Example: Disable Key (User)**
   - Method: `PATCH`
   - URL: `http://localhost:3000/users/keys/{key}/disable`

**Note:** No authentication headers are required for these endpoints (assumed handled by gateway).

## Testing
- **Unit tests:**
  ```bash
  npm run test
  ```
- **E2E tests:**
  ```bash
  npm run test:e2e
  ```

---

**Note:** This service does not implement authentication. It is intended to be used behind an API gateway.
