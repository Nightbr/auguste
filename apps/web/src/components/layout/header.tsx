import { ChefHat } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center gap-3 px-2 py-2 border-b border-white/5 bg-[#1B3022] sticky top-0 z-50">
      <div className="border border-[#D4AF37]/40 rounded-lg p-1">
        <ChefHat className="w-5 h-5 text-[#D4AF37]" />
      </div>
      <h1 className="text-xl font-serif font-bold tracking-tight text-[#D4AF37]">
        Auguste Assistant
      </h1>
    </header>
  );
}
