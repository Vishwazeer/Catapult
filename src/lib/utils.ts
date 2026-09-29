import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amountInLakhs: number): string {
  if (amountInLakhs >= 100) {
    const crores = amountInLakhs / 100;
    return `₹${crores.toFixed(crores % 1 === 0 ? 0 : 1)} Cr`;
  }
  return `₹${amountInLakhs.toFixed(amountInLakhs % 1 === 0 ? 0 : 1)} L`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getTagColor(tag: string): string {
  switch (tag) {
    case 'hot': return 'bg-hot/20 text-hot border-hot/30';
    case 'warm': return 'bg-warm/20 text-warm border-warm/30';
    case 'cold': return 'bg-cold/20 text-cold border-cold/30';
    default: return 'bg-ink-subtle/20 text-ink-muted border-hairline';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 70) return 'text-hot';
  if (score >= 40) return 'text-warm';
  return 'text-cold';
}

export function getScoreGradient(score: number): string {
  if (score >= 70) return 'from-hot to-orange-500';
  if (score >= 40) return 'from-warm to-yellow-500';
  return 'from-cold to-blue-500';
}
