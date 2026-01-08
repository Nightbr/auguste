import { cn } from '@auguste/ui/lib/utils';
import ReactMarkdown from 'react-markdown';
import type { Message } from '@/hooks/use-chat';
import { ChefHat, User } from 'lucide-react';

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn('flex items-start gap-3 mb-6', !isAssistant && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-sm border shadow-sm',
          isAssistant
            ? 'bg-primary/10 border-primary/20'
            : 'bg-primary border-primary text-primary-foreground',
        )}
      >
        {isAssistant ? <ChefHat className="h-4 w-4 text-primary" /> : <User className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          'relative flex-1 px-4 py-3 rounded-lg max-w-[85%] text-sm transition-all duration-200',
          isAssistant
            ? 'bg-accent/80 backdrop-blur-md border border-white/10 shadow-lg'
            : 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(212,175,55,0.3)] border-none font-medium',
        )}
      >
        <div
          className={cn(
            'prose break-words prose-p:my-1 prose-sm max-w-none',
            isAssistant ? 'dark:prose-invert' : 'prose-invert font-medium',
          )}
        >
          {isAssistant ? (
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="text-primary font-bold" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
