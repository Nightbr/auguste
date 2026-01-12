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

export function PlannerSettings({ settings }: PlannerSettingsProps) {
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

      {/* Timezone */}
      <div className="family-card p-6">
        <h3 className="text-lg font-medium text-escoffier-green mb-4">Timezone</h3>
        <div className="text-escoffier-green font-medium">{settings.timezone}</div>
      </div>

      {/* Notification Schedule */}
      <div className="family-card p-6">
        <h3 className="text-lg font-medium text-escoffier-green mb-4">Notification Schedule</h3>
        <div className="text-escoffier-green/70 text-sm">
          <div className="mb-2">
            <span className="font-medium text-escoffier-green">Cron Expression:</span>
            <span className="ml-2 font-mono">{settings.notificationCron}</span>
          </div>
          <div className="text-xs text-escoffier-green/50">
            Notifications are sent according to this schedule
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-escoffier-green/50">
        Last updated: {new Date(settings.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}
