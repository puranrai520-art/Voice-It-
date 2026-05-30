import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Pending':
      return { bg: 'bg-error-container', text: 'text-on-error-container', border: 'border-error/20' };
    case 'In Review':
      return { bg: 'bg-secondary-container', text: 'text-on-secondary-container', border: 'border-secondary/20' };
    case 'Resolved':
      return { bg: 'bg-surface-container-high', text: 'text-on-surface', border: 'border-outline-variant/30' };
    default:
      return { bg: 'bg-surface-container', text: 'text-on-surface-variant', border: 'border-outline-variant/20' };
  }
}
