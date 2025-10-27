# Chhattisgarh Suraksha - Environmental Safety Platform

Full-stack environmental monitoring platform with ML insights, blockchain integration, and real-time analytics.

## 🚀 Quick Start (Docker)

```bash
cp .env.example .env    # Edit with your API keys
docker-compose up -d    # Start all services
```
Access: http://localhost

## ✨ Features

- **Citizen Reporting** - Submit incidents with photos/location
- **ML Insights** - Hotspot prediction, forecasting, risk assessment
- **Community Forum** - Discussions with voting
- **Real-time Monitoring** - Air quality + weather data
- **Data Analytics** - Stats, visualizations, export (CSV/JSON)
- **Blockchain** - Immutable report storage

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS
**Backend:** Node.js 20, Express 5, PostgreSQL 16
**DevOps:** Docker, Nginx

## 📋 API Endpoints

### Auth
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify & login

### ML
- `GET /api/ml/hotspots` - Pollution predictions
- `GET /api/ml/forecast` - 24h forecast
- `GET /api/ml/risk-assessment` - Health risks
- `GET /api/ml/patterns` - Pattern analysis

### Forum
- `GET /api/forum/topics` - List topics
- `POST /api/forum/topics` - Create topic (auth)
- `POST /api/forum/topics/:id/vote` - Vote (auth)
- `POST /api/forum/topics/:id/replies` - Reply (auth)

### Analytics
- `GET /api/analytics/data` - Environmental data
- `GET /api/analytics/statistics` - Stats summary
- `POST /api/analytics/export` - Export data

### Users
- `GET /api/users/:id/stats` - User stats
- `GET /api/users/leaderboard` - Top users

## 🔧 Local Development

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
npm run dev    # Port 5000
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev    # Port 5173
```

**Database:**
```bash
createdb chhattisgarh_suraksha
# Tables auto-create on first backend start
```

## 🔑 Environment Setup

**backend/.env:**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chhattisgarh_suraksha
JWT_SECRET=your_secret_here
WAQI_API_KEY=get_from_aqicn.org
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🐳 Production Deployment

```bash
# Setup
cp .env.example .env.production
# Edit .env.production with production values

# Deploy
docker-compose --env-file .env.production up -d

# Monitor
docker-compose logs -f

# Health check
curl http://localhost/api/status
```

## 📊 Database Tables

- `users`, `user_stats`, `user_activity`
- `air_quality_metrics`, `weather_metrics`
- `forum_topics`, `forum_replies`, `forum_votes`
- `reports`, `environmental_alerts`

## ✅ Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Add WAQI API key ([Get here](https://aqicn.org/api/))
- [ ] Configure Twilio ([Get here](https://www.twilio.com/))
- [ ] Setup SSL/HTTPS
- [ ] Configure domain DNS
- [ ] Enable database backups
- [ ] Test all API endpoints
- [ ] Run security audit

## 🐛 Troubleshooting

**Backend won't start:**
```bash
docker-compose logs backend
# Check DATABASE_URL is correct
```

**Frontend 502 error:**
```bash
docker-compose logs frontend
# Verify backend is running: curl http://localhost:5000/api/status
```

**Database connection error:**
```bash
docker-compose down -v
docker-compose up -d
# Tables will auto-create
```

## 📈 Performance Features

- Multi-stage Docker builds
- Nginx static asset caching
- Database connection pooling
- 5-minute API response caching
- Optimized SQL queries

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Write tests
4. Submit PR

## 📄 License

MIT

## 🙏 Credits

- WAQI - Air quality data
- Open-Meteo - Weather data
- Twilio - SMS/OTP service

---

**Version 1.0.0** | Built for environmental safety 🌱
