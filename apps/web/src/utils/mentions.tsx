import { Link } from 'react-router-dom';

/**
 * Parse text and convert @mentions to clickable links
 */
export function renderTextWithMentions(text: string): React.ReactNode[] {
  const mentionRegex = /@(\w+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    const username = match[1];
    const matchIndex = match.index;

    // Add text before the mention
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex));
    }

    // Add the mention as a link
    parts.push(
      <Link
        key={`mention-${matchIndex}`}
        to={`/u/${username}`}
        className="text-orange-600 hover:underline font-medium"
      >
        @{username}
      </Link>
    );

    lastIndex = matchIndex + match[0].length;
  }

  // Add remaining text after the last mention
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Extract all mentioned usernames from text
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}
