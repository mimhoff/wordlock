import type { ReactNode } from 'react';
import { CloseIcon } from './icons';

interface ModalProps {
  title: string;
  /** Replaces the plain title heading (the title is still the dialog's accessible name). */
  heading?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, heading, onClose, children }: ModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>
        {heading ?? <h2>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
