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