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
    <div className="flex flex-col gap-4">
      {messages.map((msg, i) => (
        <MessageItem key={i} message={msg} />
      ))}
      {isLoading && <ThinkingBubble />}
      <div ref={messagesEndRef} className="h-px w-full" />
    </div>
  );
}
