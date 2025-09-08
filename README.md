<!-- @format -->

# Bulk Email Processor (Start Guide)

Quick start guide to run the project with Docker or locally without Docker.

---

## Prerequisites

- Docker & Docker Compose (for containerized setup)
- Node.js >= 18 and npm (for local setup)
- PostgreSQL 15
- Redis 7

---

## Environment Variables

Create `.env` files:

### `backend/.env`

```env
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://yourdomain.com
APP_BASE_URL=http://localhost:5000

# ------------------------------
# Database (PostgreSQL)
# ------------------------------
DB_HOST=your_db_host
DB_PORT=your_db_port
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name

# ------------------------------
# Redis (BullMQ)
# ------------------------------
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password

# ------------------------------
# JWT Secret
# ------------------------------
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# ------------------------------
# Email (Mailtrap)
# ------------------------------
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_user
MAILTRAP_PASS=your_mailtrap_pass

# ------------------------------
# Concurrency & Limits
# ------------------------------
EMAIL_CONCURRENCY=10
MAX_FILE_SIZE_MB=2
RATE_LIMIT_WINDOW_MIN=15
RATE_LIMIT_MAX=100
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

---

## 1️⃣ Run with Docker (Recommended)

1. Clone the repository:

```bash
git clone https://github.com/fearalert/bulk-email-processor.git
cd bulk-email-processor
```

2. Start all services:

```bash
docker-compose up --build
```

3. Run migrations & seed templates (optional):

```bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed:templates
```

4. Access PostgreSQL:

```bash
docker exec -it bulk-email-postgres psql -U postgres -d bulk_email
```

---

## 2️⃣ Run Locally (Without Docker)

1. Install dependencies:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. Start PostgreSQL and Redis locally on the ports defined in `.env`.

3. Run backend migrations & seed templates:

```bash
cd backend
npm run migrate
npm run seed:templates
```

4. Start backend:

```bash
npm run start
```

5. Start frontend:

```bash
cd ../frontend
npm run dev
```

---

## 3️⃣ Ports Reference

| Service    | URL / Port                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Backend    | [http://localhost:5000](http://localhost:5000)                             |
| Frontend   | [http://localhost:3000](http://localhost:3000) (Docker) / 5173 (local dev) |
| PostgreSQL | localhost:5432                                                             |
| Redis      | localhost:6380                                                             |

---

## 4️⃣ Optional Commands

- Access backend logs:

```bash
docker-compose logs -f backend
```

- Access frontend logs:

```bash
docker-compose logs -f frontend
```

- Stop all Docker containers:

```bash
docker-compose down
```
