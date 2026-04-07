import { useState } from 'react';
import { ChevronDown, Zap } from 'lucide-react';
import { DEMO_CREDENTIALS } from './useLogin';

interface QuickLoginProps {
  onSelect: (email: string) => void;
  isLoading: boolean;
}

export function QuickLogin({ onSelect, isLoading }: QuickLoginProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6">
      {/* Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 mx-auto text-xs text-text-muted hover:text-text-secondary transition-colors group"
        disabled={isLoading}
      >
        <Zap className="w-3 h-3 text-text-muted group-hover:text-status-pending transition-colors" />
        <span>Quick Login</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Collapsible panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        <div className="flex flex-wrap gap-2 justify-center">
          {DEMO_CREDENTIALS.map((cred) => (
            <button
              key={cred.email}
              type="button"
              disabled={isLoading}
              onClick={() => onSelect(cred.email)}
              className="px-3 py-1.5 text-[11px] font-medium rounded-md
                         bg-surface-muted text-text-secondary
                         border border-surface-border
                         hover:bg-accent-light hover:text-accent hover:border-accent/30
                         active:scale-95
                         transition-all duration-150
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {cred.shortLabel}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
