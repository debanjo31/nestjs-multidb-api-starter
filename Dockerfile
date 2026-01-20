# =============================================================================
# NestJS Multi-DB API Starter - Multi-stage Dockerfile
# =============================================================================
# Build: docker build --build-arg APP_NAME=service -t nestjs-service .
# Run:   docker run -p 7000:7000 --env-file _env/.env nestjs-service
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS dependencies

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies (including devDependencies for build)
RUN yarn install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 2: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Build argument for selecting which app to build
ARG APP_NAME=service

# Build the specific application
RUN yarn build ${APP_NAME}

# -----------------------------------------------------------------------------
# Stage 3: Production
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Copy built application from builder stage
ARG APP_NAME=service
COPY --from=builder /app/dist/apps/${APP_NAME} ./dist/apps/${APP_NAME}

# Copy shared libs if they exist in dist
COPY --from=builder /app/dist/libs ./dist/libs

# Copy config directory
COPY --from=builder /app/config ./config

# Copy environment example (users should mount their own .env)
COPY --from=builder /app/_env/.env.example ./_env/.env.example

# Set ownership to non-root user
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose default port (can be overridden)
ARG PORT=7000
ENV PORT=${PORT}
EXPOSE ${PORT}

# Set the app name as environment variable
ENV APP_NAME=${APP_NAME}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/v1/health || exit 1

# Start the application
CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main.js"]
