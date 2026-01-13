import { useState } from 'react';
import { WeeklyPlanView } from './weekly-plan-view';
import { usePlannerData } from '@/hooks/use-planner-data';
import { LayoutGrid, CalendarDays } from 'lucide-react';

type PlannerTabType = 'weekly' | 'calendar';

interface PlannerPanelProps {
  familyId: string;
  isPolling?: boolean;
}

export function PlannerPanel({ familyId, isPolling = false }: PlannerPanelProps) {
  const [activeTab, setActiveTab] = useState<PlannerTabType>('weekly');
  const { planning, events, isLoading, error } = usePlannerData(familyId, { isPolling });

  const tabs: { id: PlannerTabType; label: string; icon: React.ReactNode }[] = [
    { id: 'weekly', label: 'Weekly Plan', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays className="w-4 h-4" /> },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <p className="text-escoffier-green text-lg mb-2">Error loading meal planning data</p>
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
              className={`flex items-center gap-2 px-6 py-4 text-base font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-champagne-gold border-b-2 border-champagne-gold'
                  : 'text-escoffier-green hover:text-champagne-gold border-b-2 border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-escoffier-green">Loading meal plan...</div>
          </div>
        ) : (
          <>
            {activeTab === 'weekly' && <WeeklyPlanView planning={planning} events={events} />}
            {activeTab === 'calendar' && <WeeklyPlanView planning={planning} events={events} />}
          </>
        )}
      </div>
    </div>
  );
}
