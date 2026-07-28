# PostgreSQL Migration Guide

This guide explains how to migrate Nexora Cloud from SQLite to PostgreSQL for production deployments.

## Why PostgreSQL?

SQLite is great for development and small deployments, but PostgreSQL is recommended for:
- Multi-instance deployments (multiple dashboard containers)
- Concurrent writes (SQLite locks the entire database)
- Larger datasets (>1GB)
- Point-in-time recovery
- Read replicas

## Step 1: Provision PostgreSQL

### Option A: Managed PostgreSQL (recommended)
```bash
# Using Neon (serverless Postgres)
# Sign up at https://neon.tech and create a project
# Copy the connection string

# Using Supabase
# Sign up at https://supabase.com and create a project
# Copy the connection string from Settings → Database

# Using AWS RDS
aws rds create-db-instance \
  --db-instance-identifier nexora-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username nexora \
  --master-user-password <secure-password> \
  --allocated-storage 20
```

### Option B: Self-hosted PostgreSQL
```bash
# Using Docker
docker run -d \
  --name nexora-postgres \
  -e POSTGRES_USER=nexora \
  -e POSTGRES_PASSWORD=<secure-password> \
  -e POSTGRES_DB=nexora \
  -p 5432:5432 \
  -v nexora-pgdata:/var/lib/postgresql/data \
  postgres:16-alpine
```

## Step 2: Update Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Step 3: Update Environment Variables

Edit `.env`:

```bash
# Replace the SQLite URL with your PostgreSQL connection string
DATABASE_URL="postgresql://nexora:<password>@<host>:5432/nexora?schema=public"

# Example formats:
# Neon:     postgresql://user:pass@ep-xxx.region.aws.neon.tech/nexora?sslmode=require
# Supabase: postgresql://postgres.xxxx:pass@xxxx.supabase.co:6543/postgres
# AWS RDS:  postgresql://nexora:pass@nexora-prod.xxxx.region.rds.amazonaws.com:5432/nexora
# Docker:   postgresql://nexora:pass@localhost:5432/nexora
```

## Step 4: Run Migration

```bash
# Generate new Prisma client
bunx prisma generate

# Create and apply migration
bunx prisma migrate dev --name init_postgresql

# Or if you just want to push the schema (no migration history):
bunx prisma db push

# Seed the database
bun run scripts/seed.ts
```

## Step 5: Update Docker Compose (optional)

If you want PostgreSQL as part of your Docker Compose stack, add a `postgres` service and update the `DATABASE_URL` to point to it. See `docker-compose.yml` for reference.

## Step 6: Backup Strategy

```bash
# Using pg_dump (add to cron)
pg_dump $DATABASE_URL | gzip > /backups/nexora-$(date +%Y%m%d).sql.gz

# Retain last 30 days
find /backups -name "nexora-*.sql.gz" -mtime +30 -delete
```

## Migration Verification

After migration, verify:
1. `curl http://localhost:3000/api/health` — should return `{"status":"healthy"}`
2. Login with `owner@nexora.app` / `admin123`
3. Navigate to Applications — should show seeded apps
4. Navigate to Secrets Manager — should show encrypted secrets
5. Navigate to Audit Log — should show audit events

## Rollback

To rollback to SQLite:
1. Change `prisma/schema.prisma` back to `provider = "sqlite"`
2. Change `DATABASE_URL` back to `file:/app/data/nexora.db`
3. Run `bunx prisma db push`
4. Run `bun run scripts/seed.ts`
