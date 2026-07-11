import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';

export function Dialog({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          'relative bg-[var(--color-card)] rounded-lg shadow-xl w-full border border-[var(--color-border)]',
          maxWidth
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-semibold text-[var(--color-card-foreground)]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors rounded-md p-1"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function DialogBody({ children, className }) {
  return (
    <div className={cn('p-5 space-y-4 max-h-[60vh] overflow-y-auto', className)}>
      {children}
    </div>
  );
}

export function DialogFooter({ children, className }) {
  return (
    <div className={cn('flex justify-end gap-2 px-5 py-4 border-t border-[var(--color-border)]', className)}>
      {children}
    </div>
  );
}
