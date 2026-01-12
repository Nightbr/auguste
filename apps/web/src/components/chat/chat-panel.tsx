import { MessageList } from './message-list';
import { ChatInput } from './chat-input';
import { SuggestedActions } from './suggested-actions';
import type { Message } from '@/hooks/use-chat';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  disabled?: boolean;
}

export function ChatPanel({
  messages,
  isLoading,
  input,
  onInputChange,
  onSend,
  messagesEndRef,
  disabled = false,
}: ChatPanelProps) {
  const hasMessages = messages.length > 0;

  const handleSuggestedAction = (message: string) => {
    onInputChange(message);
    // Trigger send after setting the input
    setTimeout(() => onSend(), 0);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF9F6]">
      {/* Agent Response Area or Suggested Actions */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {hasMessages ? (
          <MessageList messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
        ) : (
          <SuggestedActions onSelect={handleSuggestedAction} disabled={disabled} />
        )}
      </div>

      {/* Chat Input Area */}
      <div className="flex-shrink-0 px-4 py-4">
        <div className="family-card p-4">
          <ChatInput
            input={input}
            isLoading={isLoading}
            onInputChange={onInputChange}
            onSend={onSend}
            disabled={disabled}
          />
          {disabled && (
            <p className="text-xs text-escoffier-green/50 mt-2 text-center">
              Please create your family first to start chatting
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
