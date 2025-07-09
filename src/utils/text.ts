/**
 * Utility functions for text processing
 */

/**
 * Strips HTML tags from a string and returns clean text
 * @param html - The HTML string to clean
 * @returns Clean text without HTML tags
 */
export function stripHtmlTags(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Remove HTML tags using regex
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Replace HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, '...')
    .trim(); // Remove leading/trailing whitespace
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param text - The text to truncate
 * @param maxLength - Maximum length of the text
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Capitalizes the first letter of a string
 * @param text - The text to capitalize
 * @returns Text with first letter capitalized
 */
export function capitalizeFirst(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Converts text to title case
 * @param text - The text to convert
 * @returns Text in title case
 */
export function toTitleCase(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Removes extra whitespace and normalizes spacing
 * @param text - The text to normalize
 * @returns Normalized text
 */
export function normalizeWhitespace(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace
}
