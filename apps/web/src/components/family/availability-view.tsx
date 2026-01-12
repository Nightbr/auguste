interface AvailabilityViewProps {
  availability: Array<{
    id: string;
    memberId: string;
    memberName: string;
    mealType: string;
    dayOfWeek: number;
    isAvailable: boolean;
  }>;
  members: Array<{
    id: string;
    name: string;
  }>;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

export function AvailabilityView({ availability, members }: AvailabilityViewProps) {
  if (members.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-escoffier-green text-lg mb-2">No members yet</p>
          <p className="text-escoffier-green/60 text-sm">Add members to set availability</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-heading font-semibold text-escoffier-green mb-6">
        Weekly Availability
      </h2>

      <div className="space-y-6">
        {DAYS.map((day, dayIndex) => (
          <div key={day} className="family-card p-4">
            <h3 className="text-lg font-medium text-escoffier-green mb-3">{day}</h3>
            <div className="grid grid-cols-3 gap-4">
              {MEAL_TYPES.map((mealType) => (
                <div key={mealType} className="space-y-2">
                  <h4 className="text-sm font-medium text-escoffier-green/70 capitalize">
                    {mealType}
                  </h4>
                  {members.map((member) => {
                    const avail = availability.find(
                      (a) =>
                        a.memberId === member.id &&
                        a.dayOfWeek === dayIndex &&
                        a.mealType === mealType,
                    );
                    return (
                      <div key={member.id} className="flex items-center gap-2 text-sm">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            avail?.isAvailable ? 'bg-champagne-gold' : 'bg-escoffier-green/20'
                          }`}
                        />
                        <span
                          className={
                            avail?.isAvailable ? 'text-escoffier-green' : 'text-escoffier-green/40'
                          }
                        >
                          {member.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
