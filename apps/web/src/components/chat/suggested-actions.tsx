type ContextType = 'family' | 'planner';

interface SuggestedActionsProps {
  onSelect: (message: string) => void;
  disabled?: boolean;
  context?: ContextType;
}

interface Suggestion {
  label: string;
  message: string;
  icon: string;
}

interface ContextConfig {
  title: string;
  subtitle: string;
  suggestions: Suggestion[];
}

const contextConfigs: Record<ContextType, ContextConfig> = {
  family: {
    title: "Hello! I'm Auguste",
    subtitle: 'Your AI meal planning assistant. How can I help you today?',
    suggestions: [
      {
        label: 'Add new member',
        message: 'I would like to add a new family member',
        icon: '👤',
      },
      {
        label: 'Set availability',
        message: 'I want to set meal availability for family members',
        icon: '📅',
      },
      {
        label: 'Food preferences',
        message: 'I want to specify food preferences or allergies',
        icon: '🥗',
      },
    ],
  },
  planner: {
    title: "Let's Plan Your Meals",
    subtitle: 'I can help you create delicious meal plans for your family.',
    suggestions: [
      {
        label: 'Plan meals for the next week',
        message: 'Plan meals for the next week',
        icon: '📆',
      },
      {
        label: 'Suggest meals for a specific date',
        message: 'Suggest meals for a specific date',
        icon: '🍽️',
      },
      {
        label: 'Adjust meal plan for a specific date',
        message: 'Adjust meal plan for a specific date',
        icon: '✏️',
      },
    ],
  },
};

export function SuggestedActions({
  onSelect,
  disabled = false,
  context = 'family',
}: SuggestedActionsProps) {
  const config = contextConfigs[context];

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-serif text-escoffier-green mb-2">{config.title}</h2>
        <p className="text-escoffier-green/70">{config.subtitle}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 max-w-md">
        {config.suggestions.map((suggestion) => (
          <button
            type="button"
            key={suggestion.label}
            onClick={() => onSelect(suggestion.message)}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-escoffier-green/20 rounded-lg hover:border-escoffier-green/40 hover:bg-escoffier-cream/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-lg">{suggestion.icon}</span>
            <span className="text-escoffier-green font-medium">{suggestion.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
