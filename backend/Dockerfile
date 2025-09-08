# ---- Build Stage ----
FROM node:18-alpine AS build
WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Build TypeScript to dist
RUN npm run build

# ---- Production Stage ----
FROM node:18-alpine AS production
WORKDIR /app

# Install only runtime dependencies
COPY --from=build /app/package*.json ./
RUN npm install --production

# Copy built files and seeds
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src

# Set environment
ENV NODE_ENV=production
EXPOSE 5000

# Run server
CMD ["node", "dist/index.js"]
