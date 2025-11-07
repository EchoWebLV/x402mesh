import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/agent_registry',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

export async function getClient() {
  return await pool.connect();
}

export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    // Create agents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        version VARCHAR(50),
        endpoint VARCHAR(500) NOT NULL,
        wallet_address VARCHAR(255) NOT NULL,
        capabilities JSONB NOT NULL,
        tags TEXT[],
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        last_heartbeat TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_agents_tags ON agents USING GIN(tags);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_agents_capabilities ON agents USING GIN(capabilities);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_agents_wallet ON agents(wallet_address);
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default pool;

