import express from 'express';
import cors from 'cors';
import {
  mastra,
  RequestContext,
  createFamily,
  getFamilyById,
  getMembersByFamilyId,
  getAvailabilityByFamilyId,
  getPlannerSettingsByFamilyId,
  getMealPlanningByFamilyId,
  getMealEventsByFamilyId,
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

  console.log(`Chat request: agentId=${agentId}, familyId=${familyId}`);

  try {
    const agent = mastra.getAgent(agentId);

    if (!agent) {
      console.error(`Agent not found: ${agentId}`);
      return res.status(404).json({ error: `Agent not found: ${agentId}` });
    }

    // Set headers for SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const requestContext = new RequestContext();
    if (familyId) {
      requestContext.set('familyId', familyId);
    }

    console.log(`Starting stream for agent: ${agentId}`);

    const result = await agent.stream(message, {
      threadId,
      resourceId,
      requestContext,
    });

    let chunkCount = 0;
    // Stream using fullStream to catch all events including errors
    for await (const chunk of result.fullStream) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyChunk = chunk as any;
      if (chunk.type === 'text-delta') {
        chunkCount++;
        res.write(`data: ${JSON.stringify({ type: 'text', content: chunk.textDelta })}\n\n`);
      } else if (chunk.type === 'error') {
        console.error('Stream error:', chunk.error);
        res.write(`data: ${JSON.stringify({ type: 'error', content: String(chunk.error) })}\n\n`);
      } else if (chunk.type === 'tool-call') {
        const toolName = anyChunk.payload?.toolName || anyChunk.toolName || 'unknown';
        console.log(`Tool call: ${toolName}`);
      } else if (chunk.type === 'tool-result') {
        const toolName = anyChunk.payload?.toolName || anyChunk.toolName || 'unknown';
        const resultStr = JSON.stringify(anyChunk.payload?.result || anyChunk.result || {});
        console.log(`Tool result: ${toolName} -> ${resultStr.slice(0, 200)}`);
      }
    }

    console.log(`Stream completed for agent: ${agentId}, chunks: ${chunkCount}`);

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

// Meal planning endpoints
app.get('/api/family/:id/planning', async (req, res) => {
  try {
    const { id } = req.params;
    const planning = await getMealPlanningByFamilyId(id);

    if (!planning) {
      return res.status(404).json({ error: 'No meal planning found' });
    }

    res.json(planning);
  } catch (error) {
    console.error('Error fetching meal planning:', error);
    res.status(500).json({ error: 'Failed to fetch meal planning' });
  }
});

app.get('/api/family/:id/events', async (req, res) => {
  try {
    const { id } = req.params;
    const events = await getMealEventsByFamilyId(id);
    res.json(events);
  } catch (error) {
    console.error('Error fetching meal events:', error);
    res.status(500).json({ error: 'Failed to fetch meal events' });
  }
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
