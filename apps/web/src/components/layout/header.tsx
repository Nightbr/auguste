import { ChefHat } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="p-2 bg-primary/10 rounded-lg">
        <ChefHat className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h1 className="text-xl font-serif font-bold tracking-tight text-primary">
          Auguste Assistant
        </h1>
        <p className="text-xs text-muted-foreground italic">Your AI Culinary Strategist</p>
      </div>
    </header>
  );
}
