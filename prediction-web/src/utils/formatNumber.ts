/**
 * Format number with K and M suffixes
 * - Numbers >= 10000000: Display as M (e.g., 12345678 -> 12.35M)
 * - Numbers >= 10000: Display as K (e.g., 12345 -> 12.35K)
 * - Numbers < 10000: Display normally with 2 decimal places
 * 
 * @param num - The number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
  if (num >= 10000000) {
    // Format as millions (M)
    const millions = num / 1000000;
    return `${millions.toFixed(2)}M`;
  } else if (num >= 10000) {
    // Format as thousands (K)
    const thousands = num / 1000;
    return `${thousands.toFixed(2)}K`;
  } else {
    // Format normally with 2 decimal places
    return num.toFixed(2);
  }
}
