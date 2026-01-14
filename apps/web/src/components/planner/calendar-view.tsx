import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MealPlanning, MealEvent } from '@/hooks/use-planner-data';

interface CalendarViewProps {
  plannings: MealPlanning[];
  events: MealEvent[];
  selectedPlanningId?: string;
  onSelectPlanning: (planningId: string | undefined) => void;
}

const STATUS_COLORS = {
  draft: {
    bg: 'bg-gray-100',
    bgSelected: 'bg-gray-200',
    text: 'text-gray-600',
  },
  active: {
    bg: 'bg-escoffier-green/15',
    bgSelected: 'bg-escoffier-green/25',
    text: 'text-escoffier-green',
  },
  completed: {
    bg: 'bg-blue-50',
    bgSelected: 'bg-blue-100',
    text: 'text-blue-600',
  },
};

type PlanningPosition = 'start' | 'middle' | 'end' | 'single';

export function CalendarView({
  plannings,
  events,
  selectedPlanningId,
  onSelectPlanning,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get days for the calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  // Find plannings that overlap with a given day with position info
  const getPlanningInfoForDay = (day: Date, dayIndex: number) => {
    const isRowStart = dayIndex % 7 === 0;
    const isRowEnd = dayIndex % 7 === 6;

    return plannings
      .filter((planning) => {
        const start = parseISO(planning.startDate);
        const end = parseISO(planning.endDate);
        return isWithinInterval(day, { start, end });
      })
      .map((planning) => {
        const start = parseISO(planning.startDate);
        const end = parseISO(planning.endDate);
        const isStart = isSameDay(day, start) || isRowStart;
        const isEnd = isSameDay(day, end) || isRowEnd;

        let position: PlanningPosition = 'middle';
        if (isStart && isEnd) position = 'single';
        else if (isStart) position = 'start';
        else if (isEnd) position = 'end';

        return { planning, position };
      });
  };

  // Count events for a given day
  const getEventCountForDay = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return events.filter((event) => event.date === dateStr).length;
  };

  const today = new Date();

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif text-escoffier-green">Meal Planning Calendar</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-escoffier-green/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-escoffier-green" />
          </button>
          <span className="min-w-[140px] text-center font-medium text-escoffier-green">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-escoffier-green/10 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-escoffier-green" />
          </button>
        </div>
      </div>

      {/* Calendar Grid - fully bordered with rounded corners */}
      <div className="border border-escoffier-green/10 rounded-lg overflow-hidden">
        {/* Day headers - light grey background */}
        <div className="grid grid-cols-7 bg-escoffier-green/5 border-b border-escoffier-green/10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div
              key={day}
              className={`p-2 text-center text-sm font-medium text-escoffier-green/70 ${
                index < 6 ? 'border-r border-escoffier-green/10' : ''
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const planningInfos = getPlanningInfoForDay(day, index);
            const eventCount = getEventCountForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, today);
            const isLastColumn = index % 7 === 6;
            const isLastRow = index >= calendarDays.length - 7;

            return (
              <CalendarDay
                key={day.toISOString()}
                day={day}
                planningInfos={planningInfos}
                eventCount={eventCount}
                isCurrentMonth={isCurrentMonth}
                isToday={isToday}
                isLastColumn={isLastColumn}
                isLastRow={isLastRow}
                selectedPlanningId={selectedPlanningId}
                onSelectPlanning={onSelectPlanning}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface PlanningInfo {
  planning: MealPlanning;
  position: PlanningPosition;
}

interface CalendarDayProps {
  day: Date;
  planningInfos: PlanningInfo[];
  eventCount: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isLastColumn: boolean;
  isLastRow: boolean;
  selectedPlanningId?: string;
  onSelectPlanning: (planningId: string | undefined) => void;
}

function CalendarDay({
  day,
  planningInfos,
  eventCount,
  isCurrentMonth,
  isToday,
  isLastColumn,
  isLastRow,
  selectedPlanningId,
  onSelectPlanning,
}: CalendarDayProps) {
  const hasPlannings = planningInfos.length > 0;

  // Get margin/padding based on position for continuous bar effect
  const getBarStyle = (position: PlanningPosition) => {
    switch (position) {
      case 'start':
        return 'ml-1 rounded-l';
      case 'end':
        return 'mr-1 rounded-r';
      case 'single':
        return 'mx-1 rounded';
      default:
        return ''; // middle - no margins, extends to edges
    }
  };

  return (
    <div
      className={`
        min-h-[80px] transition-all relative
        ${!isLastColumn ? 'border-r border-escoffier-green/10' : ''}
        ${!isLastRow ? 'border-b border-escoffier-green/10' : ''}
        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'}
      `}
    >
      {/* Today indicator - gold dot on top right */}
      {isToday && <div className="absolute top-1 right-1 w-2 h-2 bg-champagne-gold rounded-full" />}

      {/* Day number */}
      <div
        className={`text-xs font-medium p-1 ${
          isCurrentMonth ? 'text-escoffier-green' : 'text-gray-400'
        }`}
      >
        {format(day, 'd')}
      </div>

      {/* Planning bars - positioned absolutely for seamless continuation */}
      <div className="absolute bottom-1 left-0 right-0 space-y-0.5">
        {planningInfos.slice(0, 2).map(({ planning, position }) => {
          const colors = STATUS_COLORS[planning.status];
          const isPlanningSelected = planning.id === selectedPlanningId;
          return (
            <button
              key={planning.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlanning(isPlanningSelected ? undefined : planning.id);
              }}
              className={`
                block w-full h-5 text-xs truncate px-1.5 transition-all text-left
                ${getBarStyle(position)}
                ${isPlanningSelected ? colors.bgSelected : colors.bg}
                ${colors.text}
                hover:opacity-80 cursor-pointer
              `}
            >
              {position === 'start' || position === 'single' ? (
                <span className="capitalize font-medium">{planning.status}</span>
              ) : null}
            </button>
          );
        })}
        {planningInfos.length > 2 && (
          <div className="text-xs text-escoffier-green/60 px-1">+{planningInfos.length - 2}</div>
        )}
      </div>

      {/* Event count - only show if no plannings */}
      {eventCount > 0 && !hasPlannings && (
        <div className="absolute bottom-1 left-1 text-xs text-escoffier-green/60">
          {eventCount} meal{eventCount > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
