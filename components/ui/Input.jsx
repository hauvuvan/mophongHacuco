import React from 'react';
import { cn } from '../../lib/utils';

const baseInput = [
  'h-9 w-full rounded-md border border-[var(--color-input)] bg-[var(--color-background)] px-3 text-sm',
  'focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'placeholder:text-[var(--color-muted-foreground)]',
].join(' ');

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(baseInput, className)}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(baseInput, 'cursor-pointer', className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full rounded-md border border-[var(--color-input)] bg-[var(--color-background)] px-3 py-2 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]',
        'disabled:opacity-50 placeholder:text-[var(--color-muted-foreground)]',
        'resize-none',
        className
      )}
      {...props}
    />
  );
}

export function Label({ children, required, className, ...props }) {
  return (
    <label className={cn('text-sm font-medium text-[var(--color-foreground)]', className)} {...props}>
      {children}
      {required && <span className="text-[var(--color-destructive)] ml-0.5">*</span>}
    </label>
  );
}
