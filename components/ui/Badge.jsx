import React from 'react';
import { cn } from '../../lib/utils';

const toneClasses = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-rose-100 text-rose-700',
  info: 'bg-sky-100 text-sky-700',
  muted: 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
  default: 'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]',
};

export function Badge({ tone = 'default', children, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
