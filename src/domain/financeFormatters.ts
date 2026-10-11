/**
 * Consistent formatting utilities for TENFLOW
 */

/**
 * Format amounts in Indian Rupee notation (e.g. ₹10,000)
 */
export function formatRupees(amount: number, includeDecimals = false): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';
  
  const absAmount = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(absAmount);

  return amount < 0 ? `-${formatted}` : formatted;
}

/**
 * Format delta amounts with explicit +/- prefix (e.g. +₹1,500, -₹250)
 */
export function formatRupeesDelta(amount: number, includeDecimals = false): string {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';
  if (amount === 0) return '₹0';

  const sign = amount > 0 ? '+' : '-';
  const absFormatted = formatRupees(Math.abs(amount), includeDecimals);
  return `${sign}${absFormatted}`;
}

/**
 * Format percentage (e.g. 74.5%)
 */
export function formatPercent(value: number, decimals = 0): string {
  if (isNaN(value) || !isFinite(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Friendly date formatter
 */
export function formatDateLabel(dayIndex: number): string {
  return `Day ${dayIndex} of 30`;
}
