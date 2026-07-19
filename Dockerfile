# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci

# Copy Prisma schema, config, and generate client
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy source and compile TypeScript
COPY . .
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema, config, and generate client in production image
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Copy compiled output from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 5000

# Start the server (skipping migrate to avoid Supabase pooler hanging)
CMD ["node", "dist/server.js"]
