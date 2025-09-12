/**
 * Parses a price string into a number, handling various currency formats.
 * @param priceString - The string to parse (e.g., "$1,299.99", "£150", "1.299,99 EUR").
 * @returns The parsed number or null if parsing fails.
 */
export const parsePrice = (priceString: string): number | null => {
  if (!priceString || typeof priceString !== 'string') {
    return null;
  }
  
  // Remove currency symbols, codes (like USD), and whitespace
  let cleaned = priceString.replace(/[$\sA-Z€£]+/g, '').trim();
  
  const lastCommaIndex = cleaned.lastIndexOf(',');
  const lastDotIndex = cleaned.lastIndexOf('.');

  // Handle European-style decimals (e.g., "1.299,95")
  if (lastCommaIndex > lastDotIndex) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // Handle American-style thousands separators (e.g., "1,299.95")
    cleaned = cleaned.replace(/,/g, '');
  }

  const price = parseFloat(cleaned);
  return isNaN(price) ? null : price;
};