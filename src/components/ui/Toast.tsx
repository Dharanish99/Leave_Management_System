import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useToastStore, type ToastMessage } from '../../hooks/useToast';
import { cn } from '../../lib/utils';
import { useEffect, useState } from 'react';

const ToastIcon = ({ variant }: { variant: ToastMessage['variant'] }) => {
  switch (variant) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const ToastItem = ({ toast }: { toast: ToastMessage }) => {
  const removeToast = useToastStore((state) => state.removeToast);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Initiate exit animation before actual removal
    const timer = setTimeout(() => {
      setIsRemoving(true);
    }, 3600); // 4000ms is total lifetime, start fading out a bit earlier
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => removeToast(toast.id), 300); // Wait for animation
  };

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm overflow-hidden bg-warm-50 rounded-xl shadow-dropdown border border-warm-300',
        'transition-all duration-300 ease-in-out transform',
        isRemoving ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0 animate-slide-up'
      )}
    >
      <div className="flex w-full items-start p-4">
        <div className="flex-shrink-0 pt-0.5">
          <ToastIcon variant={toast.variant} />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-warm-900">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-sm text-warm-600">{toast.message}</p>
          )}
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            type="button"
            className="inline-flex rounded-md text-warm-400 hover:text-ink-900 focus:outline-none focus:ring-2 focus:ring-ember-500"
            onClick={handleRemove}
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  // Use portal to render toasts at the top level of DOM
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-end px-4 py-6 sm:p-6 gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body
  );
}
