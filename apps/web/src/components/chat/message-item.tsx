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
    <div className={cn('flex items-start mb-6', !isAssistant && 'justify-end')}>
      <div
        className={cn(
          'relative px-5 py-2.5 text-sm transition-all duration-300',
          isAssistant
            ? 'bg-[#2d3a31]/20 backdrop-blur-md border border-white/5 shadow-md rounded-2xl w-full max-w-[95%]'
            : 'bg-[#D4AF37] text-[#1B3022] shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-none font-bold rounded-full px-4 py-1.5 max-w-[80%] flex items-center justify-center',
        )}
      >
        <div
          className={cn(
            'prose break-words prose-p:my-1 prose-sm max-w-none',
            isAssistant ? 'dark:prose-invert text-white/80' : 'text-[#1B3022]',
          )}
        >
          {isAssistant ? (
            <ReactMarkdown
              components={{
                p: ({ node, ...props }) => (
                  <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="text-[#D4AF37] font-bold" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <p className="whitespace-pre-wrap font-bold text-[13px] leading-tight">
              {message.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
