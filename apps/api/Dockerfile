# DriveWise API image. BUILD CONTEXT = repo root:
#   docker build -f apps/api/Dockerfile -t drivewise-api .
FROM node:22-bookworm-slim AS build
WORKDIR /repo

# Prisma detects OpenSSL during client generation in the build stage.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

# Manifests first (better layer caching). Only the API's workspaces — the
# Expo mobile app and dashboard are not needed for the API image.
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/scoring/package.json packages/scoring/package.json
COPY packages/sensors/package.json packages/sensors/package.json
COPY packages/simulation/package.json packages/simulation/package.json

RUN npm install \
      --workspace=apps/api \
      --workspace=packages/shared \
      --workspace=packages/scoring \
      --workspace=packages/sensors \
      --workspace=packages/simulation \
      --include-workspace-root

# Root TS config the workspaces extend, then source.
COPY tsconfig.base.json ./
COPY apps/api apps/api
COPY packages packages

RUN npx prisma generate --schema=apps/api/prisma/schema.prisma \
 && npm run build --workspace=packages/shared \
 && npm run build --workspace=packages/scoring \
 && npm run build --workspace=packages/sensors \
 && npm run build --workspace=packages/simulation \
 && npm run build --workspace=apps/api

# Remove build/test tooling before copying dependencies into the runtime stage.
RUN npm prune --omit=dev \
      --workspace=apps/api \
      --workspace=packages/shared \
      --workspace=packages/scoring \
      --workspace=packages/sensors \
      --workspace=packages/simulation \
      --include-workspace-root

# ---- runtime ----
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /repo
# OpenSSL is required by the Prisma query engine. Package installers are not a
# runtime responsibility and are removed from the final image.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/* \
 && rm -rf /usr/local/lib/node_modules/npm \
 && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/prisma ./apps/api/prisma
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json
COPY --from=build /repo/packages ./packages

# SQLite db / persistent state can live on a mounted volume.
RUN useradd --create-home --uid 10001 appuser && chown -R appuser:appuser /repo
USER appuser
WORKDIR /repo/apps/api
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "dist/main"]
