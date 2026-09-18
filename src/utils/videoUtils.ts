/**
 * Extracts a safe YouTube embed URL from various YouTube link formats
 * (e.g., https://youtu.be/xzhxup5c6Q8?si=..., https://www.youtube.com/watch?v=..., embed, etc.)
 */
export function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Regular expression matching YouTube video ID (11 characters)
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = trimmed.match(regExp);

  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?rel=0&modestbranding=1`;
  }

  // If already an embed URL
  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }

  return null;
}

export function getYouTubeWatchUrl(url?: string): string {
  if (!url) return 'https://youtu.be/xzhxup5c6Q8';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.trim().match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube.com/watch?v=${match[2]}`;
  }
  return url;
}
