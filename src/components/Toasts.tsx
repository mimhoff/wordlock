import { useCallback, useRef, useState } from 'react';

interface Toast {
  id: number;
  text: string;
}

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const showToast = useCallback((text: string, durationMs = 1500) => {
    const id = nextId.current++;
    setToasts((t) => [{ id, text }, ...t]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), durationMs);
  }, []);
  return { toasts, showToast };
}

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.text}
        </div>
      ))}
    </div>
  );
}
