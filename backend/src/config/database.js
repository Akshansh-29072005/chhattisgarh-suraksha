import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'chhattisgarh_suraksha',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 5432,
  max: 20,  // Maximum connections in pool
  min: 5,   // Minimum connections in pool
  idle: 10000,  // Idle timeout in milliseconds
  connectionTimeoutMillis: 5000
});

export const dbConnect = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL database');
    
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100),
        phone_number VARCHAR(15) UNIQUE NOT NULL,
        email VARCHAR(100),
        address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS otps (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(15) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        city VARCHAR(50) NOT NULL DEFAULT 'Raipur',
        state VARCHAR(50) NOT NULL DEFAULT 'Chhattisgarh',
        country VARCHAR(50) NOT NULL DEFAULT 'India',
        latitude DECIMAL(10, 8) NOT NULL DEFAULT 21.2514,
        longitude DECIMAL(11, 8) NOT NULL DEFAULT 81.6296,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS air_quality_metrics (
        id SERIAL PRIMARY KEY,
        location_id INTEGER REFERENCES locations(id),
        aqi INTEGER,
        pm25 DECIMAL(10, 2),
        pm10 DECIMAL(10, 2),
        no2 DECIMAL(10, 2),
        so2 DECIMAL(10, 2),
        o3 DECIMAL(10, 2),
        co DECIMAL(10, 2),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS weather_metrics (
        id SERIAL PRIMARY KEY,
        location_id INTEGER REFERENCES locations(id),
        temperature DECIMAL(6, 2),
        humidity DECIMAL(5, 2),
        wind_speed DECIMAL(5, 2),
        wind_direction VARCHAR(3),
        precipitation DECIMAL(6, 2),
        pressure DECIMAL(8, 2),
        visibility DECIMAL(6, 2),
        uv_index DECIMAL(4, 2),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS environmental_alerts (
        id SERIAL PRIMARY KEY,
        location_id INTEGER REFERENCES locations(id),
        type VARCHAR(20) CHECK (type IN ('air_quality', 'weather', 'emergency', 'general')),
        severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        message TEXT,
        details JSONB,
        is_active BOOLEAN DEFAULT true,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS real_time_metrics (
        id SERIAL PRIMARY KEY,
        location_id INTEGER REFERENCES locations(id),
        air_quality_id INTEGER REFERENCES air_quality_metrics(id),
        weather_id INTEGER REFERENCES weather_metrics(id),
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Forum tables
      CREATE TABLE IF NOT EXISTS forum_topics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        category VARCHAR(50) CHECK (category IN ('general', 'safety', 'environmental', 'infrastructure')),
        content TEXT NOT NULL,
        views_count INTEGER DEFAULT 0,
        replies_count INTEGER DEFAULT 0,
        last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS forum_posts (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS forum_votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        target_type VARCHAR(10) CHECK (target_type IN ('topic', 'post')),
        target_id INTEGER NOT NULL,
        vote_type VARCHAR(10) CHECK (vote_type IN ('upvote', 'downvote')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, target_type, target_id)
      );

      -- User preferences tables
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        dashboard_widgets JSONB DEFAULT '[]'::jsonb,
        alert_thresholds JSONB DEFAULT '{}'::jsonb,
        preferred_units JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_notification_settings (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        email_enabled BOOLEAN DEFAULT true,
        sms_enabled BOOLEAN DEFAULT false,
        push_enabled BOOLEAN DEFAULT true,
        alert_frequency VARCHAR(20) CHECK (alert_frequency IN ('realtime', 'hourly', 'daily')) DEFAULT 'realtime',
        quiet_hours_start TIME,
        quiet_hours_end TIME,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_otps_phone_expires ON otps(phone_number, expires_at);
      CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON forum_topics(category);
      CREATE INDEX IF NOT EXISTS idx_forum_topics_last_activity ON forum_topics(last_activity_at DESC);
      CREATE INDEX IF NOT EXISTS idx_forum_posts_topic ON forum_posts(topic_id);
      CREATE INDEX IF NOT EXISTS idx_forum_votes_target ON forum_votes(target_type, target_id);
      CREATE INDEX IF NOT EXISTS idx_air_quality_timestamp ON air_quality_metrics(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_weather_timestamp ON weather_metrics(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_alerts_active ON environmental_alerts(is_active, timestamp DESC);

      -- Insert default location if not exists
      INSERT INTO locations (city, state, country, latitude, longitude)
      VALUES ('Raipur', 'Chhattisgarh', 'India', 21.2514, 81.6296)
      ON CONFLICT DO NOTHING;
    `);
    
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
};

export const query = (text, params) => pool.query(text, params);

export default pool;