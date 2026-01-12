interface FamilyOverviewProps {
  family: {
    id: string;
    name: string;
    country: string;
    language: string;
    createdAt: string;
    updatedAt: string;
  };
  members: Array<{
    id: string;
    name: string;
    dietaryRestrictions: string[];
    allergies: string[];
  }>;
}

export function FamilyOverview({ family, members }: FamilyOverviewProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Family Header */}
      <div className="family-card p-6">
        <h2 className="text-2xl font-heading font-semibold text-escoffier-green mb-2">
          {family.name}
        </h2>
        <div className="flex gap-6 text-sm text-escoffier-green/70">
          <div className="flex items-center gap-2">
            <span className="font-medium">Country:</span>
            <span>{family.country}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Language:</span>
            <span>{family.language}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="family-card p-4">
          <div className="text-3xl font-heading font-semibold text-champagne-gold mb-1">
            {members.length}
          </div>
          <div className="text-sm text-escoffier-green/70">Members</div>
        </div>
        <div className="family-card p-4">
          <div className="text-3xl font-heading font-semibold text-champagne-gold mb-1">
            {members.filter((m) => m.dietaryRestrictions.length > 0).length}
          </div>
          <div className="text-sm text-escoffier-green/70">With Restrictions</div>
        </div>
        <div className="family-card p-4">
          <div className="text-3xl font-heading font-semibold text-champagne-gold mb-1">
            {members.filter((m) => m.allergies.length > 0).length}
          </div>
          <div className="text-sm text-escoffier-green/70">With Allergies</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="family-card p-6">
        <h3 className="text-lg font-heading font-semibold text-escoffier-green mb-4">
          Family Setup
        </h3>
        <p className="text-escoffier-green/70 text-sm">
          This family was created on {new Date(family.createdAt).toLocaleDateString()}.
        </p>
      </div>
    </div>
  );
}
