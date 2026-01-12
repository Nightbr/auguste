import { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export function ChatInput({
  input,
  isLoading,
  onInputChange,
  onSend,
  disabled = false,
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    onSend();
    // Keep focus on input after submit
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Ensure focus on mount
  useEffect(() => {
    if (!isLoading && !disabled) {
      inputRef.current?.focus();
    }
  }, [isLoading, disabled]);

  const isDisabled = isLoading || disabled;

  return (
    <div className="flex gap-3">
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          disabled
            ? 'Create your family to start chatting...'
            : 'Type your message... (Press Enter to send, Shift+Enter for new line)'
        }
        disabled={isDisabled}
        rows={3}
        className="flex-1 bg-transparent border-0 focus:ring-0 resize-none text-base text-escoffier-green placeholder:text-escoffier-green/40 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={isDisabled || !input.trim()}
        className="h-8 w-8 pr-0.5 rounded-xl bg-champagne-gold hover:bg-champagne-gold/80 text-escoffier-green border-none shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <Send className="h-4 w-4 rotate-45" />
        <span className="sr-only">Send</span>
      </button>
    </div>
  );
}
