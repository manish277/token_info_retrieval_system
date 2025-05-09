# Microservices: Access Key Management & Web3 Token Information

This repository contains two NestJS microservices that work together to provide secure, rate-limited access to Web3 token information via API keys.

---

## Architecture Overview

```
+---------------------+         Redis Pub/Sub         +--------------------------+
| Access Key Service  | <--------------------------> | Token Info Service       |
| (MongoDB, REST API) |                             | (Redis, REST API)        |
+---------------------+                             +--------------------------+
```

- **Access Key Service**: Manages API keys, rate limits, and expiration. Publishes key events to Redis.
- **Token Info Service**: Provides token info, validates API keys, enforces rate limits, and logs requests. Subscribes to key events from Redis.

---

## 1. Access Key Management Microservice

- **Features:**
  - Create, update, delete, list, and disable API keys
  - MongoDB for persistent storage
  - Publishes key events to Redis Pub/Sub
  - RESTful API (admin and user endpoints)

- **Environment Variables:**
  - `MONGODB_URI` (default: `mongodb://localhost/access-key-service`)
  - `REDIS_URL` (default: `redis://localhost:6379`)

- **Docker Usage:**
  ```bash
  docker run -d --name mongo -p 27017:27017 mongo:6
  docker run -d --name redis -p 6379:6379 redis:7
  cd access-key-service
  docker build -t access-key-service .
  docker run -p 3000:3000 \
    -e MONGODB_URI='mongodb://host.docker.internal:27017/access-key-service' \
    -e REDIS_URL='redis://host.docker.internal:6379' \
    access-key-service
  ```

- **API Endpoints:**
  - `POST /admin/keys` — Create key
  - `DELETE /admin/keys/:key` — Delete key
  - `GET /admin/keys` — List keys
  - `PATCH /admin/keys/:key` — Update key
  - `GET /users/keys/:key` — Get key details
  - `PATCH /users/keys/:key/disable` — Disable key

- **Postman Testing:**
  - Use the above endpoints with `http://localhost:3000`.
  - No authentication headers required (assumed handled by gateway).
  - Example: Create a key (POST `/admin/keys`):
    ```json
    {
      "rateLimit": 10,
      "expiresAt": "2025-12-31T23:59:59.000Z"
    }
    ```

---

## 2. Web3 Token Information Microservice

- **Features:**
  - Fetch token info by ID (mock data)
  - API key validation (expiration, status) using Redis cache
  - Rate limiting per key (requests per minute)
  - Request logging in Redis
  - Subscribes to key events for cache updates

- **Environment Variables:**
  - `REDIS_URL` (default: `redis://localhost:6379`)

- **Docker Usage:**
  ```bash
  docker run -d --name redis -p 6379:6379 redis:7
  cd token-info-service
  docker build -t token-info-service .
  docker run -p 3000:3000 \
    -e REDIS_URL='redis://host.docker.internal:6379' \
    token-info-service
  ```

- **API Endpoint:**
  - `GET /tokens/:tokenId` — Fetch token info (requires `X-API-Key` header)

- **Postman Testing:**
  - Method: `GET`
  - URL: `http://localhost:3000/tokens/eth`
  - Headers: `X-API-Key: <your-key>`
  - Example response:
    ```json
    {
      "id": "eth",
      "name": "Ethereum",
      "price": 3500
    }
    ```

---

## Development & Testing

- **Unit tests:**
  ```bash
  npm run test
  ```
- **E2E tests:**
  ```bash
  npm run test:e2e
  ```

---

**Note:**
- The Access Key service does not implement authentication (assumed handled by gateway).
- The Token Info service expects API keys to be managed and published by the Access Key service.
