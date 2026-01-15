import { useState } from 'react';
import { Sparkles, Check, Loader2, ChevronRight, ChevronDown } from 'lucide-react';
import type { ToolCall } from '@/hooks/use-chat';

interface ToolCallsSectionProps {
  toolCalls: ToolCall[];
}

/**
 * Format a tool name from kebab-case to a human-readable format
 * e.g., "create-member" -> "Create member"
 */
function formatToolName(toolName: string): string {
  const words = toolName.split('-');
  return words
    .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

export function ToolCallsSection({ toolCalls }: ToolCallsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (toolCalls.length === 0) {
    return null;
  }

  const completedCount = toolCalls.filter((tc) => tc.status === 'completed').length;
  const totalCount = toolCalls.length;

  return (
    <div className="mt-1.5 px-1 text-[11px] text-escoffier-green/40">
      {/* Collapsed header - clickable */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 hover:text-escoffier-green/60 transition-colors"
      >
        <Sparkles className="h-3 w-3" />
        <span>
          Actions ({completedCount}/{totalCount})
        </span>
        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {/* Expanded tool list */}
      {isExpanded && (
        <div className="mt-1 ml-4 flex flex-col gap-0.5">
          {toolCalls.map((toolCall, index) => (
            <span key={index} className="flex items-center gap-1">
              {toolCall.status === 'completed' ? (
                <Check className="h-2.5 w-2.5 text-escoffier-green/50" />
              ) : (
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
              )}
              <span>{formatToolName(toolCall.toolName)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
