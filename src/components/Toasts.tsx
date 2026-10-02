import { useCallback, useRef, useState } from 'react';

/** 'top' sits under the header (results, errors); 'bottom' sits just above the keyboard (tips). */
export type ToastPlacement = 'top' | 'bottom';

interface Toast {
  id: number;
  text: string;
  placement: ToastPlacement;
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const showToast = useCallback((text: string, durationMs = 1500, placement: ToastPlacement = 'top') => {
    const id = nextId.current++;
    setToasts((t) => [{ id, text, placement }, ...t]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), durationMs);
  }, []);
  return { toasts, showToast };
}

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <>
      {(['top', 'bottom'] as const).map((placement) => (
        <div key={placement} className={`toasts ${placement}`} aria-live="polite">
          {toasts
            .filter((t) => t.placement === placement)
            .map((t) => (
              <div key={t.id} className="toast">
                {t.text}
              </div>
            ))}
        </div>
      ))}
    </>
  );
}
