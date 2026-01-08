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
    <div className="flex gap-4 p-6 bg-[#111814] border-t border-white/5 items-center">
      <div className="flex-1 relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-[#2d3a31]/20 border-[#D4AF37]/20 focus-visible:ring-[#D4AF37]/40 h-10 rounded-lg text-white placeholder:text-white/20 px-4"
        />
        <div className="absolute inset-0 rounded-lg border border-[#D4AF37]/10 pointer-events-none" />
      </div>
      <Button
        onClick={handleSend}
        disabled={isLoading || !input.trim()}
        size="icon"
        className="h-10 w-14 rounded-xl bg-[#e5ede9] hover:bg-white text-[#1B3022] border-none shadow-none transition-all active:scale-95"
      >
        <Send className="h-4 w-4 rotate-45" />
        <span className="sr-only">Send</span>
      </Button>
    </div>
  );
}
