import { describe, it, expect, vi } from 'vitest';
import { getCurrentDateTool } from './calendar-tools';

describe('Calendar Tools', () => {
  it('should return current date information', async () => {
    // Mock date to have predictable results
    vi.useFakeTimers();
    const mockDate = new Date('2026-01-07T12:00:00Z');
    vi.setSystemTime(mockDate);

    const result = await getCurrentDateTool.execute({});

    expect(result.currentDate).toBe('2026-01-07');
    expect(result.currentDay).toBe('Wednesday');
    expect(result.next7Days).toHaveLength(7);
    expect(result.next7Days[0].date).toBe('2026-01-07');
    expect(result.next7Days[0].day).toBe('Wednesday');

    // Cleanup
    vi.useRealTimers();
  });
});
