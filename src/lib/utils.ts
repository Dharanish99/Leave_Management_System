import { type ClassValue, clsx } from 'clsx';
import type { AuditLog } from '../types';

/**
 * Merge Tailwind classes safely (no tailwind-merge needed for scaffold)
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Format a date string to a human-readable format
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format a date string to relative time (e.g. "2 hours ago")
 */
export function timeAgo(dateStr: string): string {
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

/**
 * Calculate number of days between two date strings (inclusive)
 */
export function calculateDays(from: string, to: string): number {
  const start = new Date(from);
  const end = new Date(to);
  
  if (start > end) return 0;
  
  let count = 0;
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    // 0 is Sunday, 6 is Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return count;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Get initials from a name string
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Export data to CSV
 */
export function exportToCSV(data: AuditLog[], filename: string) {
  const headers = ['Timestamp','Actor','Action','Target','Details']
  const rows = data.map(l => [
    l.timestamp, l.actorName, l.action, l.targetType, l.detail
  ])
  const csv = [headers, ...rows]
    .map(r => r.map(v => `"${v}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Format audit log details into human readable strings
 */
export function formatAuditAction(action: string, detailStr: string | null): string {
  const baseAction = action.replace(/_/g, ' ').toLowerCase();
  const titleCaseAction = baseAction.charAt(0).toUpperCase() + baseAction.slice(1);

  if (!detailStr) return titleCaseAction;
  
  try {
    const parsed = JSON.parse(detailStr);
    if (!parsed || Object.keys(parsed).length === 0) return titleCaseAction;
    
    if (action === 'LEAVE_APPLIED') {
       return `Applied for ${parsed.days || parsed.totalDays || '?'} days of ${parsed.leaveType || 'leave'}`;
    }
    if (action === 'LEAVE_STATUS_CHANGED') {
       const status = parsed.status?.replace(/_/g, ' ') || 'updated';
       return `Leave ${status}`;
    }
    
    const params = Object.entries(parsed)
      .filter(([k]) => k !== 'id' && k !== 'password')
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
      
    return params ? `${titleCaseAction} (${params})` : titleCaseAction;
  } catch (e) {
    return detailStr;
  }
}
