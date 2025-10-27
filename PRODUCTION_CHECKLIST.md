# ✅ Production Readiness Checklist

## Pre-Deployment (30 minutes)

### 1. API Keys Setup
- [ ] Get WAQI API key from https://aqicn.org/api/
- [ ] Get Twilio credentials from https://www.twilio.com/console
- [ ] Generate JWT secret: `openssl rand -hex 32`

### 2. Environment Configuration
```bash
cp .env.example .env
nano .env
```

Required variables:
```env
WAQI_API_KEY=your_key_here
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
JWT_SECRET=your_generated_secret
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/chhattisgarh_suraksha
```

### 3. Security
- [ ] Change default database password
- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Review CORS origins in backend/src/index.js
- [ ] Disable debug logging in production

## Deployment (5 minutes)

```bash
# Quick deploy
docker-compose up -d

# Verify all services running
docker-compose ps

# Check logs
docker-compose logs -f
```

## Post-Deployment Verification (10 minutes)

### Health Checks
```bash
# 1. Backend API
curl http://localhost/api/status
# Should return: {"status":"running"}

# 2. Database
docker-compose exec postgres psql -U postgres -c "SELECT 1"

# 3. Frontend
curl http://localhost
# Should return HTML

# 4. Test ML endpoint
curl http://localhost/api/ml/hotspots
# Should return JSON with predictions
```

### Functional Tests
- [ ] Visit http://localhost
- [ ] Test OTP flow (Auth)
- [ ] Submit a test report
- [ ] View ML insights
- [ ] Check forum works
- [ ] Export data works

## Performance Optimization (Optional)

### Database Indexes
```sql
-- Connect to database
docker-compose exec postgres psql -U postgres -d chhattisgarh_suraksha

-- Add indexes
CREATE INDEX idx_air_quality_timestamp ON air_quality_metrics(timestamp DESC);
CREATE INDEX idx_weather_timestamp ON weather_metrics(timestamp DESC);
CREATE INDEX idx_forum_topics_updated ON forum_topics(updated_at DESC);
CREATE INDEX idx_user_stats_impact ON user_stats((reports_submitted * 10 + forum_posts * 5));
```

### Nginx Caching (Already configured)
- Static assets cached for 1 year
- Gzip compression enabled
- API proxy configured

## Monitoring Setup (Optional but Recommended)

### Docker Stats
```bash
# Watch resource usage
watch docker stats

# View container health
docker-compose ps
```

### Log Monitoring
```bash
# Tail all logs
docker-compose logs -f

# Backend only
docker-compose logs backend -f

# Errors only
docker-compose logs | grep -i error
```

## Backup Strategy

### Daily Database Backup
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres chhattisgarh_suraksha > "backup_${DATE}.sql"
find . -name "backup_*.sql" -mtime +7 -delete  # Keep 7 days
EOF

chmod +x backup.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### Restore from Backup
```bash
docker-compose exec -T postgres psql -U postgres -d chhattisgarh_suraksha < backup_20251027.sql
```

## Scaling (When Needed)

### Horizontal Scaling
```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3

# Requires load balancer (add nginx upstream)
```

### Vertical Scaling
Edit docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Security Hardening

### 1. Firewall Rules
```bash
# Allow only HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. SSL/HTTPS Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 3. Rate Limiting
Already configured in backend for auth endpoints

### 4. Database Security
```sql
-- Revoke public access
REVOKE ALL ON DATABASE chhattisgarh_suraksha FROM PUBLIC;

-- Create limited user
CREATE USER app_user WITH PASSWORD 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

## Troubleshooting Common Issues

### Backend Not Starting
```bash
docker-compose logs backend | tail -50
# Check: DATABASE_URL, API keys, port conflicts
```

### High Memory Usage
```bash
# Restart services
docker-compose restart

# Clear logs
docker-compose logs > /dev/null 2>&1
```

### Database Connection Pool Exhausted
```bash
# Increase pool size in backend/src/config/database.js
# Restart: docker-compose restart backend
```

## Maintenance

### Update Application
```bash
git pull
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Clear Cache
```bash
# Clear Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose down -v
docker-compose up --build -d
```

### Database Maintenance
```bash
# Vacuum database
docker-compose exec postgres psql -U postgres -d chhattisgarh_suraksha -c "VACUUM ANALYZE;"

# Check table sizes
docker-compose exec postgres psql -U postgres -d chhattisgarh_suraksha -c "
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

## Production Metrics

### Expected Performance
- API response time: < 200ms (95th percentile)
- Database queries: < 50ms average
- Frontend load time: < 2s
- Memory usage: < 1GB per service
- CPU usage: < 50% average

### Alerts to Set Up
- Backend service down
- Database connection failures
- Disk space < 20%
- Memory usage > 80%
- Error rate > 5%

---

## Quick Reference

**Start:** `docker-compose up -d`
**Stop:** `docker-compose down`
**Logs:** `docker-compose logs -f`
**Restart:** `docker-compose restart`
**Status:** `docker-compose ps`
**Backup:** `docker-compose exec -T postgres pg_dump -U postgres chhattisgarh_suraksha > backup.sql`

🎉 **You're production-ready!**
