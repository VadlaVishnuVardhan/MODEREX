/**
 * Format date to relative time string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) {
    return d.toLocaleDateString();
  }
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

/**
 * Get moderation badge text from moderation object
 * @param {Object} moderation - Moderation result object
 * @returns {string|null} Badge text or null
 */
export const getModerationBadgeText = (moderation) => {
  if (!moderation || !moderation.flagged) return null;
  
  const flaggedCategories = Object.entries(moderation.categories || {})
    .filter(([_, flagged]) => flagged)
    .map(([category]) => category);
  
  if (flaggedCategories.length === 0) return null;
  return flaggedCategories[0].replace('/', ' ');
};

/**
 * Get moderation status display text
 * @param {string} status - Status value
 * @returns {string} Display text
 */
export const getModerationStatusText = (status) => {
  const statusMap = {
    pending: 'Pending Review',
    approved: 'Approved',
    rejected: 'Rejected'
  };
  return statusMap[status] || status;
};

/**
 * Resolve URL to handle both absolute and relative paths
 * @param {string} url - URL to resolve
 * @returns {string} Resolved URL
 */
export const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${import.meta.env.VITE_API_URL}${url}`;
};
