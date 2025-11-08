# Multi-stage build for demo-api
FROM node:18-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/demo-api/package.json ./apps/demo-api/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/shared/package.json ./packages/shared/

FROM base AS dependencies
RUN pnpm install --frozen-lockfile

FROM dependencies AS build

COPY apps/demo-api ./apps/demo-api
COPY packages/sdk ./packages/sdk
COPY packages/shared ./packages/shared
COPY turbo.json ./
COPY tsconfig.json ./

RUN pnpm --filter @402pay/shared build
RUN pnpm --filter @402pay/sdk build
RUN pnpm --filter @402pay/demo-api build

FROM node:18-alpine AS production

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/demo-api/package.json ./apps/demo-api/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/apps/demo-api/dist ./apps/demo-api/dist
COPY --from=build /app/packages/sdk/dist ./packages/sdk/dist
COPY --from=build /app/packages/shared/dist ./packages/shared/dist

ENV NODE_ENV=production

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "apps/demo-api/dist/index.js"]
