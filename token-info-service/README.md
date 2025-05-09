# Web3 Token Information Microservice

This service provides mock Web3 token information, validates API keys, enforces rate limits, and logs requests. It subscribes to key events from the Access Key Management microservice via Redis Pub/Sub.

## Features
- Fetch token info by ID (mock data)
- API key validation (expiration, status) using Redis cache
- Rate limiting per key (requests per minute)
- Request logging in Redis
- Subscribes to key events for cache updates

## Environment Variables
- `REDIS_URL` (default: `redis://localhost:6379`)

## Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start Redis** (Docker example):
   ```bash
   docker run -d --name redis -p 6379:6379 redis:7
   ```
3. **Run the service:**
   ```bash
   npm run start:dev
   ```

## Running with Docker

1. **Start Redis (if not already running):**
   ```bash
   docker run -d --name redis -p 6379:6379 redis:7
   ```
2. **Build the image:**
   ```bash
   docker build -t token-info-service .
   ```
3. **Run the container:**
   ```bash
   docker run -p 3000:3000 \
     -e REDIS_URL='redis://host.docker.internal:6379' \
     token-info-service
   ```

## API Endpoint
- `GET /tokens/:tokenId` — Fetch token info (requires `X-API-Key` header)

## Testing with Postman

1. **Import Endpoint:**
   - Use the endpoint in Postman.
   - Set the request URL to `http://localhost:3000` (or your Docker host IP).

2. **Example: Fetch Token Info**
   - Method: `GET`
   - URL: `http://localhost:3000/tokens/eth`
   - Headers:
     - `X-API-Key: <your-key>`
   - Example response:
     ```json
     {
       "id": "eth",
       "name": "Ethereum",
       "price": 3500
     }
     ```

3. **Error Cases:**
   - If the key is missing, invalid, expired, or disabled, you will get a 403 error.
   - If the tokenId is not found, you will get a 404 error.

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

**Note:** This service expects API keys to be managed and published by the Access Key Management microservice.
