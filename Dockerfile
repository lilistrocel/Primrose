# Multi-stage production Docker build
FROM node:18-alpine AS base
WORKDIR /app

# Install security updates and dumb-init
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S primrose -u 1001

# Development dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production runtime stage
FROM base AS runtime

# Copy built application
COPY --from=build --chown=primrose:nodejs /app/dist ./dist
COPY --from=build --chown=primrose:nodejs /app/package*.json ./
COPY --from=deps --chown=primrose:nodejs /app/node_modules ./node_modules

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER primrose

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js"] 