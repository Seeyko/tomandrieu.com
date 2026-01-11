# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Install prisma globally for migrations
RUN npm install -g prisma@7.2.0

# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy JavaScript prisma config for production
COPY prisma.config.js ./

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Run migrations and start the application
CMD ["sh", "-c", "prisma migrate deploy && node dist/src/main.js"]
