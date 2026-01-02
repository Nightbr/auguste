import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const getCurrentDateTool = createTool({
  id: 'get-current-date',
  description: 'Get the current date, time, day of the week, and the schedule for the next 7 days.',
  inputSchema: z.object({}),
  outputSchema: z.object({
    currentDate: z.string().describe('ISO date string (YYYY-MM-DD)'),
    currentDay: z.string().describe('Name of the day (e.g., Monday)'),
    currentTime: z.string().describe('Current time (HH:MM)'),
    next7Days: z
      .array(
        z.object({
          date: z.string(),
          day: z.string(),
        })
      )
      .describe('List of the next 7 days including today'),
  }),
  execute: async () => {
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Generate next 7 days
    const next7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      next7Days.push({
        date: d.toISOString().split('T')[0],
        day: days[d.getDay()],
      });
    }

    return {
      currentDate: now.toISOString().split('T')[0],
      currentDay: days[now.getDay()],
      currentTime: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      next7Days,
    };
  },
});
