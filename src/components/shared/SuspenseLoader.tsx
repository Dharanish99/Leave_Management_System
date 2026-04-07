import { Loader2 } from 'lucide-react';

export function SuspenseLoader() {
  return (
    <div className="flex h-full min-h-[400px] w-full items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4 text-text-muted">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-sm font-medium animate-pulse">Loading module...</p>
      </div>
    </div>
  );
}
