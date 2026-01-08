import { Send } from 'lucide-react';
import { Button } from '@auguste/ui/components/ui/button';
import { Input } from '@auguste/ui/components/ui/input';
import { useRef, useEffect } from 'react';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

export function ChatInput({ input, isLoading, onInputChange, onSend }: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    onSend();
    // Keep focus on input after submit
    // We use setTimeout to ensure focus happens after any potential state updates or re-renders
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent submit form default if any
      handleSend();
    }
  };

  // Ensure focus on mount
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, []);

  return (
    <div className="flex gap-2 p-4 bg-background/80 backdrop-blur-lg border-t border-primary/20">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Type your message..."
        value={input}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-accent/20 border-primary/20 focus-visible:ring-primary h-11"
        // We do NOT disable input while loading, allowing user to type next message
        // disabled={isLoading}
      />
      <Button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        size="icon"
        className="h-11 w-11 shadow-[0_0_10px_rgba(212,175,55,0.2)]"
      >
        <Send className="h-5 w-5" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  );
}
