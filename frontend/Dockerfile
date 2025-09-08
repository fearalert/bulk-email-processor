# ---- Build Stage ----
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS production
WORKDIR /app

RUN apk add --no-cache bash netcat-openbsd

# Copy build output and package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Install serve to host static files
RUN npm install -g serve

EXPOSE 3000

# Use JSON array form (recommended) and no shell script
CMD ["serve", "-s", "dist", "-l", "3000"]
