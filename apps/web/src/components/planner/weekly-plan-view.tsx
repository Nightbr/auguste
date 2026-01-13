import { useMemo } from 'react';
import { format, parseISO, addDays, startOfDay } from 'date-fns';
import { UtensilsCrossed, Users, Coffee, Sun, Moon } from 'lucide-react';

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
  planning?: MealPlanning | null;
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

export function WeeklyPlanView({ planning, events = [] }: WeeklyPlanViewProps) {
  // Group events by date
  const groupedEvents = useMemo(() => {
    const grouped: Record<string, MealEvent[]> = {};
    for (const event of events) {
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
  }, [events]);

  // Generate week dates
  const weekDates = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today, i);
      return format(date, 'yyyy-MM-dd');
    });
  }, []);

  // No planning - show empty state
  if (!planning && events.length === 0) {
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
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-escoffier-green mb-1">Weekly Meal Plan</h2>
        {planning && (
          <div className="flex items-center gap-3 text-sm text-escoffier-green/60">
            <span>
              {format(parseISO(planning.startDate), 'MMM d')} -{' '}
              {format(parseISO(planning.endDate), 'MMM d, yyyy')}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                planning.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : planning.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-700'
              }`}
            >
              {planning.status.charAt(0).toUpperCase() + planning.status.slice(1)}
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
                isToday ? 'border-champagne-gold/50 bg-champagne-gold/5' : 'border-escoffier-green/10'
              }`}
            >
              {/* Day Header */}
              <div
                className={`px-4 py-2 ${isToday ? 'bg-champagne-gold/10' : 'bg-escoffier-green/5'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-escoffier-green">
                      {format(date, 'EEEE')}
                    </span>
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
                  dayEvents.map((event) => (
                    <MealEventCard key={event.id} event={event} />
                  ))
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

