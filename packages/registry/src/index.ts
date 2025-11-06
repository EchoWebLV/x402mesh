import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { AgentRegistry } from './registry.js';

const app = express();
const registry = new AgentRegistry();
const PORT = process.env.REGISTRY_PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'agent-registry' });
});

// Register an agent
app.post('/agents/register', (req, res) => {
  try {
    const result = registry.register(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Discover agents
app.get('/agents/discover', (req, res) => {
  const { tags, capability, name } = req.query;
  const agents = registry.discover({
    tags: tags ? (tags as string).split(',') : undefined,
    capability: capability as string,
    name: name as string,
  });
  res.json(agents);
});

// Get specific agent
app.get('/agents/:agentId', (req, res) => {
  try {
    const agent = registry.getAgent(req.params.agentId);
    res.json(agent);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Update agent
app.put('/agents/:agentId', (req, res) => {
  try {
    registry.updateAgent(req.params.agentId, req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Deregister agent
app.delete('/agents/:agentId', (req, res) => {
  try {
    registry.deregister(req.params.agentId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Heartbeat
app.post('/agents/:agentId/heartbeat', (req, res) => {
  try {
    registry.heartbeat(req.params.agentId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// List all agents
app.get('/agents', (req, res) => {
  const agents = registry.listAll();
  res.json(agents);
});

// Get registry stats
app.get('/stats', (req, res) => {
  const stats = registry.getStats();
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`🚀 Agent Registry running on http://localhost:${PORT}`);
});

