import express from 'express';
import cors from 'cors';
import { mastra } from '@auguste/core';
import { RequestContext } from '@mastra/core/request-context';
import {
  createFamily,
  getFamilyById,
  getMembersByFamilyId,
  getAvailabilityByFamilyId,
  getPlannerSettingsByFamilyId,
} from '@auguste/core';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const { method, url } = req;

  console.log(`→ ${method} ${url}`, req.body ? JSON.stringify(req.body).slice(0, 200) : '');

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`← ${method} ${url} ${res.statusCode} (${duration}ms)`);
  });

  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/chat', async (req, res) => {
  const { message, agentId = 'onboardingAgent', threadId, resourceId, familyId } = req.body;

  try {
    const agent = mastra.getAgent(agentId);

    // Set headers for SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const requestContext = new RequestContext();
    if (familyId) {
      requestContext.set('familyId', familyId);
    }

    const result = await agent.stream(message, {
      threadId,
      resourceId,
      requestContext,
    });

    // Stream text chunks as SSE events
    for await (const chunk of result.textStream) {
      res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
    }

    // Send done event
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate response' });
    } else {
      res.write(
        `data: ${JSON.stringify({ type: 'error', content: 'Failed to generate response' })}\n\n`,
      );
      res.end();
    }
  }
});

app.post('/api/family', async (req, res) => {
  try {
    const { name, country, language } = req.body;
    if (!name || !country || !language) {
      return res.status(400).json({ error: 'Name, country, and language are required' });
    }

    const family = await createFamily({ name, country, language });
    res.json(family);
  } catch (error) {
    console.error('Error creating family:', error);
    res.status(500).json({ error: 'Failed to create family' });
  }
});

// Family data endpoints
app.get('/api/family/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const family = await getFamilyById(id);

    if (!family) {
      return res.status(404).json({ error: 'Family not found' });
    }

    res.json(family);
  } catch (error) {
    console.error('Error fetching family:', error);
    res.status(500).json({ error: 'Failed to fetch family' });
  }
});

app.get('/api/family/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const members = await getMembersByFamilyId(id);
    res.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

app.get('/api/family/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const availability = await getAvailabilityByFamilyId(id);
    res.json(availability);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

app.get('/api/family/:id/settings', async (req, res) => {
  try {
    const { id } = req.params;
    const settings = await getPlannerSettingsByFamilyId(id);

    // Return null if no settings exist - UI can show empty state
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
