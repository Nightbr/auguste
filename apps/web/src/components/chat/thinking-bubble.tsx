import { ChefHat } from 'lucide-react';

export function ThinkingBubble() {
  return (
    <div className="flex items-start gap-3 mb-6 animate-pulse">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border bg-primary/10 shadow-sm">
        <ChefHat className="h-4 w-4 text-primary" />
      </div>
      <div className="flex items-center space-x-2 bg-card border px-4 py-3 rounded-lg shadow-sm">
        <span className="sr-only">Thinking...</span>
        <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="h-2 w-2 bg-foreground/40 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
