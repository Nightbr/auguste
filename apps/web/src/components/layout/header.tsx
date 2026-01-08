import { ChefHat } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center gap-3 p-6 border-b border-white/5 bg-[#1B3022] sticky top-0 z-50">
      <div className="p-2 border border-[#D4AF37]/40 rounded-lg">
        <ChefHat className="w-6 h-6 text-[#D4AF37]" />
      </div>
      <h1 className="text-2xl font-serif font-bold tracking-tight text-[#D4AF37]">
        Auguste Assistant
      </h1>
    </header>
  );
}
