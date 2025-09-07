<!-- @format -->

# Bulk Email Service

A **bulk email service** built with **Node.js, Express, PostgreSQL, Redis, BullMQ, and Nodemailer**, featuring **authentication, email verification, rate limiting, logging, and queue-based bulk email sending**.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Email Queue and Worker](#email-queue-and-worker)
- [Logging](#logging)
- [Security](#security)
- [Rate Limiting](#rate-limiting)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- User registration, login, and JWT authentication
- Email verification system
- Send bulk emails with concurrency control
- Track email status (sent, failed) in the database
- Rate limiting for security
- Robust error handling with centralized middleware
- Logging with Winston for HTTP requests and errors
- Queue-based email sending using **BullMQ**
- Redis-backed queue for scalability

---

## Architecture

```
+------------+      +-------------+      +---------+
|   Client   | ---> |   Express   | ---> | PostgreSQL
| (Frontend) |      |   API       |      |         |
+------------+      +------+------+\    +---------+
                           |       \
                           |        \
                           v         v
                       +----------------+
                       |  Redis/BullMQ  |
                       +----------------+
                               |
                               v
                        +--------------+
                        | Email Worker |
                        +--------------+
                               |
                               v
                        +------------------------+
                        | SMTP/MAILTRAP Provider |
                        +------------------------+
```

---

## Prerequisites

- Node.js >= 20
- PostgreSQL >= 15
- Redis >= 7
- npm

---

## Installation

```bash
# Clone the repository
git clone https://github.com/fearalert/bulk-email-processor.git
cd bulk-email-processor

# Install dependencies for backend
cd backend && npm install
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
APP_BASE_URL=http://localhost:3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Nodemailer (Mailtrap or any SMTP)
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=xxxx
MAILTRAP_PASS=xxxx

# Email
EMAIL_CONCURRENCY=5

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# File uploads
MAX_FILE_SIZE=10mb
```

---

## Database Setup

1. Start PostgreSQL
2. Create a database:

```sql
CREATE DATABASE bulk_email_service;
```

3. Run migrations:

```bash
npm run migrate
# or
yarn migrate
```

_(Ensure `runMigrations()` is implemented in your project.)_

---

## Running the Application

```bash
# Start server
npm run dev
# or
yarn dev
```

- Server runs on `http://localhost:5000`
- Health check endpoint: `/`

---

## API Endpoints

### **Authentication**

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| POST   | `/auth/register` | Register a new user     |
| GET    | `/auth/verify`   | Verify email with token |
| POST   | `/auth/login`    | Login and get JWT token |

### **Email**

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| POST   | `/email/bulk`         | Send bulk emails               |
| GET    | `/email/logs/:userId` | Get email sending logs by user |

---

## Email Queue and Worker

- Uses **BullMQ** and **Redis**
- `emailQueue` stores all email jobs
- Worker handles sending emails with **concurrency control**:

  ```js
  const worker = new Worker(
    'emailQueue',
    async (job) => {
      await emailService.sendMail(job.data);
    },
    { connection: redisConnection, concurrency: EMAIL_CONCURRENCY }
  );
  ```

---

## Logging

- `winston` logger for:

  - `info.log` – General info
  - `error.log` – Errors
  - `combined.log` – Both info and error
  - `http.log` – HTTP requests (via `morgan`)

---

## Security

- `helmet` middleware for HTTP headers
- JWT-based authentication
- CORS configuration
- Rate limiting for authentication and email endpoints

---

## Rate Limiting

- Auth endpoints: 10 requests per 15 minutes
- Email endpoints: 5 requests per 15 minutes
- Protects against brute force attacks

---

## Testing

- Use **Postman** or **Insomnia** or **bruno** to test endpoints
- You can get **bruno** testing collection inside `backend` directory in the `bulk-email-api` directory.
- Test flows:

  1. Register → Check verification email
  2. Verify → Login → Get JWT
  3. Bulk email → Check logs

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Push and create a pull request

---
