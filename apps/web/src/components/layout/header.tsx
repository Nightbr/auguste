import { ChefHat, UtensilsCrossed, Users, ArrowRight, Pencil } from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';

interface HeaderProps {
  familyId?: string | null;
  isFamilyReady?: boolean;
  currentRoute: 'family' | 'planner';
}

export function Header({ isFamilyReady = false, currentRoute }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="grid grid-cols-3 items-center px-4 h-14 border-b border-white/5 bg-[#1B3022] sticky top-0 z-50">
      {/* Logo - Left aligned */}
      <div className="flex items-center gap-2 justify-self-start">
        <div className="border border-[#D4AF37]/40 rounded-lg p-1">
          <ChefHat className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <h1 className="text-xl font-serif font-bold tracking-tight text-[#D4AF37]">AUGUSTE</h1>
      </div>

      {/* Tab Navigation - Center aligned */}
      <nav className="flex items-center gap-1 justify-self-center">
        <Link
          to="/family"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentRoute === 'family'
              ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          Family
        </Link>
        <button
          type="button"
          onClick={() => isFamilyReady && navigate({ to: '/planner' })}
          disabled={!isFamilyReady}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentRoute === 'planner'
              ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
              : isFamilyReady
                ? 'text-white/70 hover:text-white hover:bg-white/5 cursor-pointer'
                : 'text-white/30 cursor-not-allowed'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          Meal Planner
        </button>
      </nav>

      {/* CTAs - Right aligned */}
      <div className="flex items-center justify-self-end">
        {currentRoute === 'family' && isFamilyReady && (
          <Link
            to="/planner"
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#1B3022] rounded-lg text-sm font-medium hover:bg-[#D4AF37]/90 transition-colors"
          >
            Go to Meal Planner
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
        {currentRoute === 'planner' && (
          <Link
            to="/family"
            className="flex items-center gap-2 px-4 py-2 border border-[#D4AF37]/40 text-[#D4AF37] rounded-lg text-sm font-medium hover:bg-[#D4AF37]/10 transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit Family
          </Link>
        )}
        {currentRoute === 'family' && !isFamilyReady && (
          <div className="text-white/50 text-xs">Complete setup to start planning</div>
        )}
      </div>
    </header>
  );
}
