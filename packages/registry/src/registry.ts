import { query as dbQuery, initializeDatabase } from './db.js';

interface AgentCapability {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  pricing: {
    amount: number;
    currency: 'USDC' | 'SOL';
    model: 'per_request' | 'per_token' | 'per_minute';
  };
}

interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  capabilities: AgentCapability[];
  endpoint: string;
  walletAddress: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  lastHeartbeat?: string;
  status?: 'active' | 'inactive';
}

export class AgentRegistry {
  private readonly HEARTBEAT_TIMEOUT = 60000; // 60 seconds
  private initialized: boolean = false;

  constructor() {
    // Initialize database on first use
    this.initialize();
    
    // Clean up inactive agents every minute
    setInterval(() => this.cleanupInactiveAgents(), 60000);
  }

  private async initialize() {
    if (this.initialized) return;
    
    try {
      await initializeDatabase();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      console.warn('⚠️  Falling back to in-memory storage (data will be lost on restart)');
    }
  }

  async register(metadata: AgentMetadata): Promise<{ success: boolean; agentId: string }> {
    if (!metadata.id || !metadata.name || !metadata.walletAddress) {
      throw new Error('Missing required fields: id, name, walletAddress');
    }

    try {
      await dbQuery(
        `INSERT INTO agents (id, name, description, version, endpoint, wallet_address, capabilities, tags, status, created_at, updated_at, last_heartbeat)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())
         ON CONFLICT (id) 
         DO UPDATE SET 
           name = $2,
           description = $3,
           version = $4,
           endpoint = $5,
           wallet_address = $6,
           capabilities = $7,
           tags = $8,
           updated_at = NOW(),
           last_heartbeat = NOW(),
           status = 'active'`,
        [
          metadata.id,
          metadata.name,
          metadata.description || '',
          metadata.version || '1.0.0',
          metadata.endpoint,
          metadata.walletAddress,
          JSON.stringify(metadata.capabilities),
          metadata.tags || [],
          'active'
        ]
      );

      console.log(`✅ Registered agent: ${metadata.name} (${metadata.id})`);
      return { success: true, agentId: metadata.id };
    } catch (error) {
      console.error('Failed to register agent:', error);
      throw error;
    }
  }

  async discover(query?: {
    tags?: string[];
    capability?: string;
    name?: string;
  }): Promise<AgentMetadata[]> {
    try {
      let queryText = `SELECT * FROM agents WHERE status = 'active'`;
      const params: any[] = [];
      let paramIndex = 1;

      // Filter by tags
      if (query?.tags && query.tags.length > 0) {
        queryText += ` AND tags && $${paramIndex}`;
        params.push(query.tags);
        paramIndex++;
      }

      // Filter by capability (search in JSONB)
      if (query?.capability) {
        queryText += ` AND capabilities::text ILIKE $${paramIndex}`;
        params.push(`%${query.capability}%`);
        paramIndex++;
      }

      // Filter by name
      if (query?.name) {
        queryText += ` AND name ILIKE $${paramIndex}`;
        params.push(`%${query.name}%`);
        paramIndex++;
      }

      queryText += ` ORDER BY created_at DESC`;

      const result = await dbQuery(queryText, params);
      
      return result.rows.map((row: any) => this.rowToAgent(row));
    } catch (error) {
      console.error('Failed to discover agents:', error);
      return [];
    }
  }

  async getAgent(agentId: string): Promise<AgentMetadata> {
    try {
      const result = await dbQuery(
        `SELECT * FROM agents WHERE id = $1`,
        [agentId]
      );

      if (result.rows.length === 0) {
        throw new Error(`Agent not found: ${agentId}`);
      }

      return this.rowToAgent(result.rows[0]);
    } catch (error) {
      console.error('Failed to get agent:', error);
      throw error;
    }
  }

  async updateAgent(agentId: string, updates: Partial<AgentMetadata>): Promise<void> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.name) {
        fields.push(`name = $${paramIndex++}`);
        values.push(updates.name);
      }
      if (updates.description) {
        fields.push(`description = $${paramIndex++}`);
        values.push(updates.description);
      }
      if (updates.version) {
        fields.push(`version = $${paramIndex++}`);
        values.push(updates.version);
      }
      if (updates.endpoint) {
        fields.push(`endpoint = $${paramIndex++}`);
        values.push(updates.endpoint);
      }
      if (updates.capabilities) {
        fields.push(`capabilities = $${paramIndex++}`);
        values.push(JSON.stringify(updates.capabilities));
      }
      if (updates.tags) {
        fields.push(`tags = $${paramIndex++}`);
        values.push(updates.tags);
      }

      fields.push(`updated_at = NOW()`);
      values.push(agentId);

      await dbQuery(
        `UPDATE agents SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
        values
      );
    } catch (error) {
      console.error('Failed to update agent:', error);
      throw error;
    }
  }

  async deregister(agentId: string): Promise<void> {
    try {
      const result = await dbQuery(
        `DELETE FROM agents WHERE id = $1`,
        [agentId]
      );

      if (result.rowCount === 0) {
        throw new Error(`Agent not found: ${agentId}`);
      }

      console.log(`❌ Deregistered agent: ${agentId}`);
    } catch (error) {
      console.error('Failed to deregister agent:', error);
      throw error;
    }
  }

  async heartbeat(agentId: string): Promise<void> {
    try {
      await dbQuery(
        `UPDATE agents 
         SET last_heartbeat = NOW(), status = 'active' 
         WHERE id = $1`,
        [agentId]
      );
    } catch (error) {
      console.error('Failed to update heartbeat:', error);
      throw error;
    }
  }

  async listAll(): Promise<AgentMetadata[]> {
    try {
      const result = await dbQuery(`SELECT * FROM agents ORDER BY created_at DESC`);
      return result.rows.map((row: any) => this.rowToAgent(row));
    } catch (error) {
      console.error('Failed to list agents:', error);
      return [];
    }
  }

  async getStats() {
    try {
      const totalResult = await dbQuery(`SELECT COUNT(*) as count FROM agents`);
      const activeResult = await dbQuery(`SELECT COUNT(*) as count FROM agents WHERE status = 'active'`);
      const inactiveResult = await dbQuery(`SELECT COUNT(*) as count FROM agents WHERE status = 'inactive'`);

      return {
        total: parseInt(totalResult.rows[0].count),
        active: parseInt(activeResult.rows[0].count),
        inactive: parseInt(inactiveResult.rows[0].count),
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return { total: 0, active: 0, inactive: 0 };
    }
  }

  private async cleanupInactiveAgents(): Promise<void> {
    try {
      const timeout = new Date(Date.now() - this.HEARTBEAT_TIMEOUT);
      
      await dbQuery(
        `UPDATE agents 
         SET status = 'inactive' 
         WHERE last_heartbeat < $1 AND status = 'active'`,
        [timeout]
      );
    } catch (error) {
      console.error('Failed to cleanup inactive agents:', error);
    }
  }

  private rowToAgent(row: any): AgentMetadata {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      version: row.version,
      endpoint: row.endpoint,
      walletAddress: row.wallet_address,
      capabilities: typeof row.capabilities === 'string' 
        ? JSON.parse(row.capabilities) 
        : row.capabilities,
      tags: row.tags || [],
      status: row.status,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
      lastHeartbeat: row.last_heartbeat?.toISOString(),
    };
  }
}
