import express from 'express';
import cors from 'cors';
import { mastra } from '@auguste/core';
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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/chat', async (req, res) => {
  const { messages, agentId = 'onboardingAgent', threadId, resourceId } = req.body;

  try {
    const agent = mastra.getAgent(agentId);

    // Set headers for plain text streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    const result = await agent.stream(messages[messages.length - 1].content, {
      threadId,
      resourceId,
    });

    for await (const chunk of result.textStream) {
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate response' });
    } else {
      res.end();
    }
  }
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
