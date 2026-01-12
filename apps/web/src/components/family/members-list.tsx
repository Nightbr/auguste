interface Birthdate {
  day?: number;
  month?: number;
  year?: number;
}

interface MembersListProps {
  members: Array<{
    id: string;
    name: string;
    type: string;
    birthdate: Birthdate | null;
    dietaryRestrictions: string[];
    allergies: string[];
    foodPreferencesLikes: string[];
    foodPreferencesDislikes: string[];
    cookingSkillLevel: string;
  }>;
}

function getSkillLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    none: 'None',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    professional: 'Professional',
  };
  return labels[level] || level;
}

/**
 * Calculate age from a partial birthdate.
 * - If only year is provided, calculates approximate age based on current year
 * - If year and month are provided, calculates age considering month
 * - If all fields are provided, calculates exact age
 */
function calculateAgeFromBirthdate(birthdate: Birthdate): number | null {
  if (!birthdate.year) {
    return null;
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // getMonth() is 0-indexed
  const currentDay = today.getDate();

  let age = currentYear - birthdate.year;

  // If month is provided, adjust age if birthday hasn't occurred yet this year
  if (birthdate.month !== undefined) {
    if (birthdate.month > currentMonth) {
      age--;
    } else if (birthdate.month === currentMonth && birthdate.day !== undefined) {
      if (birthdate.day > currentDay) {
        age--;
      }
    }
  }

  return age >= 0 ? age : null;
}

/**
 * Format a partial birthdate for display.
 * Handles cases where only some fields are provided.
 */
function formatPartialBirthdate(birthdate: Birthdate): string {
  const parts: string[] = [];

  if (birthdate.day !== undefined) {
    parts.push(String(birthdate.day).padStart(2, '0'));
  }
  if (birthdate.month !== undefined) {
    parts.push(String(birthdate.month).padStart(2, '0'));
  }
  if (birthdate.year !== undefined) {
    parts.push(String(birthdate.year));
  }

  if (parts.length === 0) {
    return '';
  }

  // Format based on what's available
  if (
    birthdate.day !== undefined &&
    birthdate.month !== undefined &&
    birthdate.year !== undefined
  ) {
    return `${parts[0]}/${parts[1]}/${parts[2]}`;
  }
  if (birthdate.month !== undefined && birthdate.year !== undefined) {
    return `${parts[0]}/${parts[1]}`;
  }
  if (birthdate.year !== undefined) {
    return `Born ${birthdate.year}`;
  }

  return parts.join('/');
}

/**
 * Get display text for birthdate including age if calculable.
 */
function getBirthdateDisplay(birthdate: Birthdate): string {
  const formattedDate = formatPartialBirthdate(birthdate);
  const age = calculateAgeFromBirthdate(birthdate);

  if (!formattedDate) {
    return '';
  }

  if (age !== null) {
    return `${formattedDate} (${age} years old)`;
  }

  return formattedDate;
}

export function MembersList({ members }: MembersListProps) {
  if (members.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-escoffier-green text-lg mb-2">No members yet</p>
          <p className="text-escoffier-green/60 text-sm">Use the chat to add family members</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {members.map((member) => (
        <div key={member.id} className="family-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-heading font-semibold text-escoffier-green mb-1">
                {member.name}
              </h3>
              <span className="badge">{member.type}</span>
            </div>
            {member.birthdate && getBirthdateDisplay(member.birthdate) && (
              <div className="text-sm text-escoffier-green/60">
                {getBirthdateDisplay(member.birthdate)}
              </div>
            )}
          </div>

          {/* Dietary Restrictions */}
          {member.dietaryRestrictions.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-escoffier-green mb-2">
                Dietary Restrictions
              </h4>
              <div className="flex flex-wrap gap-2">
                {member.dietaryRestrictions.map((restriction: string) => (
                  <span key={restriction} className="badge">
                    {restriction}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergies */}
          {member.allergies.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-escoffier-green mb-2">Allergies</h4>
              <div className="flex flex-wrap gap-2">
                {member.allergies.map((allergy: string) => (
                  <span key={allergy} className="badge gold">
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Food Preferences */}
          {(member.foodPreferencesLikes.length > 0 ||
            member.foodPreferencesDislikes.length > 0) && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-escoffier-green mb-2">Food Preferences</h4>
              {member.foodPreferencesLikes.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-escoffier-green/60 uppercase tracking-wide">
                    Likes:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {member.foodPreferencesLikes.map((like: string) => (
                      <span key={like} className="badge">
                        {like}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {member.foodPreferencesDislikes.length > 0 && (
                <div>
                  <span className="text-xs text-escoffier-green/60 uppercase tracking-wide">
                    Dislikes:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {member.foodPreferencesDislikes.map((dislike: string) => (
                      <span key={dislike} className="badge">
                        {dislike}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cooking Skill Level */}
          <div>
            <span className="text-sm text-escoffier-green/60">Cooking Skill:</span>
            <span className="ml-2 text-escoffier-green font-medium">
              {getSkillLevelLabel(member.cookingSkillLevel)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
