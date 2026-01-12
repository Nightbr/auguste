interface PlannerSettingsProps {
  settings: {
    id: string;
    familyId: string;
    mealTypes: string[];
    activeDays: number[];
    defaultServings: number;
    notificationCron: string;
    timezone: string;
    createdAt: string;
    updatedAt: string;
  };
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

/**
 * Format hour to 12-hour format with AM/PM
 */
function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const minuteStr = minute === 0 ? '' : `:${minute.toString().padStart(2, '0')}`;
  return `${displayHour}${minuteStr} ${period}`;
}

/**
 * Convert a cron expression to human-readable format
 */
function cronToHumanReadable(cron: string): string {
  const parts = cron.split(' ');
  if (parts.length !== 5) {
    return cron; // Return as-is if invalid
  }

  const [minute, hour, , , dayOfWeek] = parts;
  const hourNum = parseInt(hour, 10);
  const minuteNum = parseInt(minute, 10);

  // Format time
  const timeStr = formatTime(hourNum, minuteNum);

  // Format days
  let dayStr: string;
  if (dayOfWeek === '*') {
    dayStr = 'Every day';
  } else if (dayOfWeek === '1-5') {
    dayStr = 'Monday to Friday';
  } else if (dayOfWeek === '0,6' || dayOfWeek === '6,0') {
    dayStr = 'Weekends';
  } else {
    const dayNums = dayOfWeek.split(',').map((d) => parseInt(d, 10));
    if (dayNums.length === 1) {
      dayStr = `Every ${DAYS[dayNums[0]]}`;
    } else {
      dayStr = dayNums.map((d) => DAYS[d]).join(', ');
    }
  }

  return `${dayStr} at ${timeStr}`;
}

export function PlannerSettings({ settings }: PlannerSettingsProps) {
  const humanReadableSchedule = cronToHumanReadable(settings.notificationCron);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-heading font-semibold text-escoffier-green mb-6">
        Planner Settings
      </h2>

      {/* Active Days */}
      <div className="family-card p-6">
        <h3 className="text-lg font-medium text-escoffier-green mb-4">Active Planning Days</h3>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((day, index) => (
            <div
              key={day}
              className={`calendar-day p-3 text-center text-sm ${
                settings.activeDays.includes(index)
                  ? 'bg-champagne-gold/10 border-champagne-gold/30'
                  : 'bg-escoffier-green/5 border-escoffier-green/10'
              }`}
            >
              <div className="font-medium">{day.slice(0, 3)}</div>
              <div className="text-xs text-escoffier-green/60 mt-1">
                {settings.activeDays.includes(index) ? 'Active' : 'Inactive'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal Types */}
      <div className="family-card p-6">
        <h3 className="text-lg font-medium text-escoffier-green mb-4">Meal Types</h3>
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPES.map((mealType) => (
            <span
              key={mealType}
              className={`badge ${settings.mealTypes.includes(mealType) ? 'gold' : ''}`}
            >
              {mealType}
            </span>
          ))}
        </div>
      </div>

      {/* Default Servings */}
      <div className="family-card p-6">
        <h3 className="text-lg font-medium text-escoffier-green mb-4">Default Servings</h3>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-heading font-semibold text-champagne-gold">
            {settings.defaultServings}
          </div>
          <div className="text-sm text-escoffier-green/70">people per meal</div>
        </div>
      </div>

      {/* Notification Schedule */}
      <div className="family-card p-6">
        <h3 className="text-lg font-medium text-escoffier-green mb-4">Notification Schedule</h3>
        <div className="flex items-center gap-3">
          <div className="text-xl font-medium text-champagne-gold">{humanReadableSchedule}</div>
          <span className="text-sm text-escoffier-green/50">({settings.timezone})</span>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-escoffier-green/50">
        Last updated: {new Date(settings.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}
