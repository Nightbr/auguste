import { useMemo } from 'react';
import { format, parseISO, eachDayOfInterval, isSameDay } from 'date-fns';
import { X, Coffee, Sun, Moon, Users, UtensilsCrossed, CalendarDays } from 'lucide-react';
import type { MealPlanning, MealEvent } from '@/hooks/use-planner-data';

interface PlanningDetailsProps {
  planning: MealPlanning;
  events: MealEvent[];
  onClose: () => void;
}

const MEAL_TYPE_ICONS: Record<string, React.ReactNode> = {
  breakfast: <Coffee className="w-4 h-4" />,
  lunch: <Sun className="w-4 h-4" />,
  dinner: <Moon className="w-4 h-4" />,
};

const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

export function PlanningDetails({ planning, events, onClose }: PlanningDetailsProps) {
  const today = new Date();

  // Get all days in the planning period
  const planningDays = useMemo(() => {
    return eachDayOfInterval({
      start: parseISO(planning.startDate),
      end: parseISO(planning.endDate),
    });
  }, [planning.startDate, planning.endDate]);

  // Filter and group events by date
  const eventsByDate = useMemo(() => {
    const planningEvents = events
      .filter((event) => event.planningId === planning.id)
      .sort((a, b) => {
        const mealOrder = { breakfast: 0, lunch: 1, dinner: 2 };
        return mealOrder[a.mealType] - mealOrder[b.mealType];
      });

    const grouped: Record<string, MealEvent[]> = {};
    for (const event of planningEvents) {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    }
    return grouped;
  }, [events, planning.id]);

  const totalMeals = Object.values(eventsByDate).flat().length;

  return (
    <div className="bg-white border-t border-escoffier-green/10">
      {/* Header - compact */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-escoffier-green/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-escoffier-green">
            <CalendarDays className="w-3.5 h-3.5 text-escoffier-green/60" />
            <span>
              {format(parseISO(planning.startDate), 'MMM d')} -{' '}
              {format(parseISO(planning.endDate), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-escoffier-green/70">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>{totalMeals} meals</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 hover:bg-escoffier-green/10 rounded transition-colors"
        >
          <X className="w-4 h-4 text-escoffier-green" />
        </button>
      </div>

      {/* Horizontal scrolling days - styled like weekly plan */}
      <div className="overflow-x-auto">
        <div className="flex gap-3 p-3" style={{ minWidth: 'max-content' }}>
          {planningDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = isSameDay(day, today);

            return (
              <div
                key={dateStr}
                className={`flex-shrink-0 w-40 rounded-lg border overflow-hidden ${
                  isToday
                    ? 'border-champagne-gold/50 bg-champagne-gold/5'
                    : 'border-escoffier-green/10 bg-white'
                }`}
              >
                {/* Day header - matching weekly plan style */}
                <div
                  className={`px-3 py-2 ${isToday ? 'bg-champagne-gold/10' : 'bg-escoffier-green/5'}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-escoffier-green text-sm">
                        {format(day, 'EEE')}
                      </span>
                      <span className="text-escoffier-green/60 text-sm ml-1">
                        {format(day, 'MMM d')}
                      </span>
                    </div>
                    {isToday && (
                      <span className="text-xs px-1.5 py-0.5 bg-champagne-gold/20 text-champagne-gold rounded-full font-medium">
                        Today
                      </span>
                    )}
                  </div>
                </div>

                {/* Meals - matching weekly plan style */}
                <div className="divide-y divide-escoffier-green/5">
                  {dayEvents.length > 0 ? (
                    dayEvents.map((event) => <MealEventCard key={event.id} event={event} />)
                  ) : (
                    <div className="px-3 py-2 text-escoffier-green/40 text-sm italic">
                      No meals planned
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MealEventCard({ event }: { event: MealEvent }) {
  return (
    <div className="px-3 py-2">
      {/* Meal type header */}
      <div className="flex items-center gap-1.5 text-escoffier-green/60">
        {MEAL_TYPE_ICONS[event.mealType]}
        <span className="text-xs">{MEAL_TYPE_LABELS[event.mealType]}</span>
      </div>
      {/* Recipe name */}
      <div className="mt-0.5">
        {event.recipeName ? (
          <span className="font-medium text-escoffier-green text-sm">{event.recipeName}</span>
        ) : (
          <span className="text-escoffier-green/40 italic text-sm">No recipe</span>
        )}
      </div>
      {/* Participants */}
      {event.participants.length > 0 && (
        <div className="flex items-center gap-0.5 text-escoffier-green/50 text-xs mt-0.5">
          <Users className="w-3 h-3" />
          <span>{event.participants.length}</span>
        </div>
      )}
    </div>
  );
}
