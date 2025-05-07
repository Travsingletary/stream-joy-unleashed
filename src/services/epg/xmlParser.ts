
// Helper functions for XML parsing

/**
 * Parse XML string to Document
 */
export const parseXML = (xmlString: string): Document => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, "text/xml");
};

/**
 * Parse date format from XMLTV (YYYYMMDDHHMMSS)
 */
export const parseXMLTVDate = (dateString: string): number => {
  // XMLTV date format can be YYYYMMDDHHMMSS or with timezone
  const basicFormat = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s?/;
  const match = dateString.match(basicFormat);
  
  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    return new Date(
      parseInt(year),
      parseInt(month) - 1, // Month is 0-based in JS
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    ).getTime();
  }
  
  // Fallback: try to parse as ISO string or return current time on failure
  try {
    return new Date(dateString).getTime();
  } catch (e) {
    console.error("Failed to parse date:", dateString);
    return Date.now();
  }
};
