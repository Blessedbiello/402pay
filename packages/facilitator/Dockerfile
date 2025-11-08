# Multi-stage build for 402pay Facilitator
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/facilitator/package.json ./packages/facilitator/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
FROM base AS dependencies
RUN pnpm install --frozen-lockfile

# Build stage
FROM dependencies AS build

# Copy source files
COPY packages/facilitator ./packages/facilitator
COPY packages/shared ./packages/shared
COPY turbo.json ./
COPY tsconfig.json ./

# Build packages
RUN pnpm --filter @402pay/shared build
RUN pnpm --filter @402pay/facilitator build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY packages/facilitator/package.json ./packages/facilitator/
COPY packages/shared/package.json ./packages/shared/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from build stage
COPY --from=build /app/packages/facilitator/dist ./packages/facilitator/dist
COPY --from=build /app/packages/shared/dist ./packages/shared/dist

# Set NODE_ENV
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "packages/facilitator/dist/index.js"]
