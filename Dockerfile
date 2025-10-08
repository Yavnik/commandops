# Use Bun with Node.js compatibility
FROM oven/bun:1.2 AS base

# Install Node.js for tooling compatibility (drizzle-kit)
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install all dependencies, including devDependencies for drizzle-kit
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy migration files and scripts
COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs drizzle ./drizzle
COPY --chown=nextjs:nodejs src/db ./src/db
COPY --chown=nextjs:nodejs drizzle.config.ts ./
COPY --chown=nextjs:nodejs package.json ./
COPY --chown=nextjs:nodejs scripts/start.sh ./start.sh

RUN chmod +x ./start.sh

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD bun --version || exit 1

# Start the application with migrations
CMD ["./start.sh"]