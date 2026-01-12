import { useState } from 'react';
import { FamilyOverview } from './family-overview';
import { MembersList } from './members-list';
import { AvailabilityView } from './availability-view';
import { PlannerSettings } from './planner-settings';
import { useFamilyData } from '@/hooks/use-family-data';

type TabType = 'overview' | 'members' | 'availability' | 'settings';

interface FamilyPanelProps {
  familyId: string;
}

export function FamilyPanel({ familyId }: FamilyPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { family, members, availability, settings, isLoading, error } = useFamilyData(familyId);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'availability', label: 'Availability' },
    { id: 'settings', label: 'Settings' },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <p className="text-escoffier-green text-lg mb-2">Error loading family data</p>
          <p className="text-escoffier-green/60 text-sm">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tab Navigation */}
      <div className="flex-shrink-0 border-b border-escoffier-green/10">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-base font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-champagne-gold border-b-2 border-champagne-gold'
                  : 'text-escoffier-green hover:text-champagne-gold border-b-2 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-escoffier-green">Loading...</div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && family && (
              <FamilyOverview family={family} members={members || []} />
            )}
            {activeTab === 'members' && <MembersList members={members || []} />}
            {activeTab === 'availability' && (
              <AvailabilityView availability={availability || []} members={members || []} />
            )}
            {activeTab === 'settings' && settings && <PlannerSettings settings={settings} />}
          </>
        )}
      </div>
    </div>
  );
}
