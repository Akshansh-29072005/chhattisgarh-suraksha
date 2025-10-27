# 🚀 Quick Deployment Guide

## Option 1: Docker (Recommended - 5 minutes)

```bash
# 1. Get API keys
# WAQI: https://aqicn.org/api/
# Twilio: https://www.twilio.com/console

# 2. Setup environment
cp .env.example .env
nano .env  # Add your API keys

# 3. Deploy
docker-compose up -d

# 4. Verify
curl http://localhost/api/status

# Done! Access at http://localhost
```

## Option 2: Local Development

```bash
# Terminal 1 - Database
createdb chhattisgarh_suraksha

# Terminal 2 - Backend
cd backend
npm install
cp .env.example .env
# Edit .env with API keys
npm run dev

# Terminal 3 - Frontend
cd frontend
npm install
npm run dev

# Access at http://localhost:5173
```

## Environment Variables (REQUIRED)

```env
# Get from https://aqicn.org/api/
WAQI_API_KEY=your_waqi_api_key

# Get from https://www.twilio.com/console
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Generate strong secret
JWT_SECRET=$(openssl rand -hex 32)

# Database (auto-handled by Docker)
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/chhattisgarh_suraksha
```

## Production Deployment

```bash
# 1. Setup production environment
cp .env.example .env.production
# Edit with production values + SSL

# 2. Build and deploy
docker-compose --env-file .env.production build
docker-compose --env-file .env.production up -d

# 3. Setup SSL (optional)
# Add Certbot for Let's Encrypt SSL

# 4. Monitor
docker-compose logs -f
```

## Health Checks

```bash
# Backend API
curl http://localhost/api/status

# Database
docker-compose exec postgres psql -U postgres -d chhattisgarh_suraksha -c "SELECT 1"

# View logs
docker-compose logs backend -f
docker-compose logs frontend -f
```

## Common Issues

**Port already in use:**
```bash
# Change port in docker-compose.yml:
ports:
  - "8080:80"  # Use 8080 instead of 80
```

**Database connection failed:**
```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres
sleep 10
docker-compose up -d backend frontend
```

**API keys not working:**
```bash
# Verify environment variables loaded
docker-compose exec backend env | grep WAQI
docker-compose exec backend env | grep TWILIO
```

## Scaling

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Add load balancer in docker-compose.yml
```

## Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres chhattisgarh_suraksha > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres chhattisgarh_suraksha < backup.sql
```

## Update Deployment

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

**Need help?** Open an issue on GitHub
