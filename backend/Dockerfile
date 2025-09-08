# ---- Build Stage ----
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --production=false
COPY . .

RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS production
WORKDIR /app

RUN apk add --no-cache bash netcat-openbsd

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
COPY --from=build /app/seed ./seed

ENV NODE_ENV=production
EXPOSE 5000

# Run migrations and seed templates, then start the server
CMD ["sh", "-c", "npm run migrate && npm run seed:templates && node dist/index.js"]