import { useMemo, useState, useEffect } from 'react';
import { format, parseISO, addDays, isWithinInterval } from 'date-fns';
import { UtensilsCrossed, Users, Coffee, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';

interface MealPlanning {
  id: string;
  familyId: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed';
}

interface MealEvent {
  id: string;
  familyId: string;
  planningId?: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  recipeName?: string;
  participants: string[];
}

interface WeeklyPlanViewProps {
  plannings: MealPlanning[];
  events?: MealEvent[];
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

export function WeeklyPlanView({ plannings, events = [] }: WeeklyPlanViewProps) {
  // Sort plannings by start date (chronologically for navigation)
  const sortedPlannings = useMemo(
    () => [...plannings].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [plannings],
  );

  // Find the planning that contains today (current week)
  const currentWeekPlanningIndex = useMemo(() => {
    const today = new Date();
    const index = sortedPlannings.findIndex((p) => {
      const start = parseISO(p.startDate);
      const end = parseISO(p.endDate);
      return isWithinInterval(today, { start, end });
    });
    // Default to last planning if no current week planning, or 0 if empty
    return index >= 0 ? index : Math.max(0, sortedPlannings.length - 1);
  }, [sortedPlannings]);

  // Track selected planning index
  const [selectedIndex, setSelectedIndex] = useState(currentWeekPlanningIndex);

  // Update selected index when plannings change and we need to find current week
  useEffect(() => {
    setSelectedIndex(currentWeekPlanningIndex);
  }, [currentWeekPlanningIndex]);

  const selectedPlanning = sortedPlannings[selectedIndex];

  // Filter events for the selected planning
  const planningEvents = useMemo(() => {
    if (!selectedPlanning) return [];
    return events.filter((e) => e.planningId === selectedPlanning.id);
  }, [events, selectedPlanning]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const grouped: Record<string, MealEvent[]> = {};
    for (const event of planningEvents) {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    }
    // Sort events within each day by meal type order
    const mealOrder = { breakfast: 0, lunch: 1, dinner: 2 };
    for (const date of Object.keys(grouped)) {
      grouped[date].sort((a, b) => mealOrder[a.mealType] - mealOrder[b.mealType]);
    }
    return grouped;
  }, [planningEvents]);

  // Generate dates for the selected planning's date range
  const weekDates = useMemo(() => {
    if (!selectedPlanning) return [];
    const start = parseISO(selectedPlanning.startDate);
    const end = parseISO(selectedPlanning.endDate);
    const dates: string[] = [];
    let current = start;
    while (current <= end) {
      dates.push(format(current, 'yyyy-MM-dd'));
      current = addDays(current, 1);
    }
    return dates;
  }, [selectedPlanning]);

  const canGoPrevious = selectedIndex > 0;
  const canGoNext = selectedIndex < sortedPlannings.length - 1;

  const handlePrevious = () => {
    if (canGoPrevious) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  // No plannings - show empty state
  if (sortedPlannings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-escoffier-green/10 flex items-center justify-center mb-4">
          <UtensilsCrossed className="w-8 h-8 text-escoffier-green" />
        </div>
        <h3 className="text-xl font-serif text-escoffier-green mb-2">No Meal Plan Yet</h3>
        <p className="text-escoffier-green/60 max-w-md">
          Start a conversation with Auguste to create your first weekly meal plan. Auguste will
          consider your family's preferences, dietary restrictions, and availability.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-serif text-escoffier-green">Weekly Meal Plan</h2>
          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              className={`p-2 rounded-lg transition-colors ${
                canGoPrevious
                  ? 'hover:bg-escoffier-green/10 text-escoffier-green'
                  : 'text-escoffier-green/30 cursor-not-allowed'
              }`}
              title="Previous planning"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-escoffier-green/60 min-w-[80px] text-center">
              {selectedIndex + 1} of {sortedPlannings.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              className={`p-2 rounded-lg transition-colors ${
                canGoNext
                  ? 'hover:bg-escoffier-green/10 text-escoffier-green'
                  : 'text-escoffier-green/30 cursor-not-allowed'
              }`}
              title="Next planning"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        {selectedPlanning && (
          <div className="flex items-center gap-3 text-sm text-escoffier-green/60">
            <span>
              {format(parseISO(selectedPlanning.startDate), 'MMM d')} -{' '}
              {format(parseISO(selectedPlanning.endDate), 'MMM d, yyyy')}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                selectedPlanning.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : selectedPlanning.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {selectedPlanning.status.charAt(0).toUpperCase() + selectedPlanning.status.slice(1)}
            </span>
          </div>
        )}
      </div>

      {/* Week Grid */}
      <div className="space-y-4">
        {weekDates.map((dateStr) => {
          const dayEvents = groupedEvents[dateStr] || [];
          const date = parseISO(dateStr);
          const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;

          return (
            <div
              key={dateStr}
              className={`border rounded-lg overflow-hidden ${
                isToday
                  ? 'border-champagne-gold/50 bg-champagne-gold/5'
                  : 'border-escoffier-green/10'
              }`}
            >
              {/* Day Header */}
              <div
                className={`px-4 py-2 ${isToday ? 'bg-champagne-gold/10' : 'bg-escoffier-green/5'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-escoffier-green">{format(date, 'EEEE')}</span>
                    <span className="text-escoffier-green/60">{format(date, 'MMM d')}</span>
                  </div>
                  {isToday && (
                    <span className="text-xs px-2 py-0.5 bg-champagne-gold/20 text-champagne-gold rounded-full font-medium">
                      Today
                    </span>
                  )}
                </div>
              </div>

              {/* Meals */}
              <div className="divide-y divide-escoffier-green/5">
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => <MealEventCard key={event.id} event={event} />)
                ) : (
                  <div className="px-4 py-3 text-escoffier-green/40 text-sm italic">
                    No meals planned
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MealEventCard({ event }: { event: MealEvent }) {
  return (
    <div className="px-4 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2 w-24 text-escoffier-green/60">
        {MEAL_TYPE_ICONS[event.mealType]}
        <span className="text-sm">{MEAL_TYPE_LABELS[event.mealType]}</span>
      </div>
      <div className="flex-1">
        {event.recipeName ? (
          <span className="font-medium text-escoffier-green">{event.recipeName}</span>
        ) : (
          <span className="text-escoffier-green/40 italic">No recipe selected</span>
        )}
      </div>
      {event.participants.length > 0 && (
        <div className="flex items-center gap-1 text-escoffier-green/50 text-sm">
          <Users className="w-3.5 h-3.5" />
          <span>{event.participants.length}</span>
        </div>
      )}
    </div>
  );
}
