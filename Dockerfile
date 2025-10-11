# Use Bun with Alpine for smaller base image
FROM oven/bun:1.2-alpine AS base

# Install dependencies for building
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install all dependencies for build
RUN bun install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Ensure build doesn't require real runtime secrets
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=1
ENV DATABASE_URL=postgresql://dummy_user:dummy_password@postgres:5432/command_ops
ENV BETTER_AUTH_SECRET=BETTER_AUTH_SECRET
ENV GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET
ENV GITHUB_CLIENT_ID=GITHUB_CLIENT_ID
ENV GITHUB_CLIENT_SECRET=GITHUB_CLIENT_SECRET
# Build Next.js (no server secrets passed at build time)
RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application artifacts
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy migrations and migrator script with dependencies
COPY --chown=nextjs:nodejs drizzle ./drizzle
COPY --chown=nextjs:nodejs scripts/migrate.ts ./scripts/migrate.ts

# Copy node_modules needed for migration script
# The standalone build doesn't include these, so we copy them from deps
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/postgres ./node_modules/postgres
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/drizzle-orm ./node_modules/drizzle-orm

# Run as non-root
USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check using wget (already available in Alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["bun", "server.js"]
