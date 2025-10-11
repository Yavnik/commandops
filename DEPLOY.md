# Self-Hosting Guide

Deploy Command Ops on your own infrastructure using Docker.

## Quick Start

1. **Clone and configure:**
   ```bash
   git clone https://github.com/Yavnik/commandops.git
   cd commandops
   cp .env.example .env
   ```

2. **Edit your `.env` file:**
   ```bash
   nano .env
   ```

   Set these required variables:
   - `NEXT_PUBLIC_BASE_URL` - Your domain (e.g., `https://commandops.yourdomain.com` or `http://192.168.1.100:3000`)
   - `BETTER_AUTH_SECRET` - Random string, 32+ characters (generate with `openssl rand -base64 32`)
   - `POSTGRES_PASSWORD` - Secure database password
   - `REDIS_PASSWORD` - Secure Redis password

3. **Deploy:**
   ```bash
   docker compose up -d --build
   ```

4. **Access your instance:**

   Open `http://localhost:3000` (or your configured domain) and create your account.

That's it! Your self-hosted Command Ops is ready.

## Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_BASE_URL` | Public URL of your deployment | `https://commandops.example.com` |
| `BETTER_AUTH_SECRET` | Auth secret key (32+ chars) | `your-random-secret-key-here` |
| `POSTGRES_PASSWORD` | Database password | `secure_db_password` |
| `REDIS_PASSWORD` | Redis password | `secure_redis_password` |

### OAuth Login (Currently Required)

> **Note:** Google and GitHub OAuth credentials are currently required for authentication. We're working on making them optional for self-hosted instances. Stay tuned!

**Google OAuth:**

1. Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/)
2. Add authorized origins and redirect URIs
3. Set in `.env`:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

**GitHub OAuth:**

1. Create OAuth App at [GitHub Settings > Developer settings](https://github.com/settings/developers)
2. Set callback URL to `{YOUR_DOMAIN}/api/auth/callback/github`
3. Set in `.env`:
   ```bash
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

### Optional: Analytics

To enable PostHog analytics:
```bash
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Maintenance

### View Logs

```bash
docker compose logs -f           # All services
docker compose logs -f app       # Application only
docker compose logs -f postgres  # Database only
```

### Update to Latest Version

```bash
git pull
docker compose down
docker compose up -d --build
```

## What's Included

The `docker-compose.yml` sets up:
- **App**: Next.js application (exposed on port 3000)
- **PostgreSQL**: Database with persistent storage
- **Redis**: For rate limiting and caching
- **Migrations**: Automatic database schema setup on first run

All data is stored in Docker volumes and persists across restarts.

## Need Help?

- Check logs: `docker compose logs -f`
- Ensure all required environment variables are set
- Verify Docker and Docker Compose are up to date
- [Open an issue](https://github.com/Yavnik/commandops/issues) on GitHub

---