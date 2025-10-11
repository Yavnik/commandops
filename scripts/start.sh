#!/bin/sh
set -e

echo "Running database migrations..."
bunx drizzle-kit migrate

echo "Starting Command Ops application..."
exec bun server.js 