import { ScrollArea } from '@auguste/ui/components/ui/scroll-area';
import { MessageItem } from './message-item';
import { ThinkingBubble } from './thinking-bubble';
import type { Message } from '@/hooks/use-chat';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({ messages, isLoading, messagesEndRef }: MessageListProps) {
  return (
    <ScrollArea className="flex-1 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto py-6">
        {messages.map((msg, i) => (
          <MessageItem key={i} message={msg} />
        ))}
        {isLoading && <ThinkingBubble />}
        <div ref={messagesEndRef} className="h-px w-full" />
      </div>
    </ScrollArea>
  );
}
