import React from 'react';

// Function to escape special regex characters
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

interface HighlightTextProps {
  text: string | undefined | null;
  highlight: string;
}

const HighlightText: React.FC<HighlightTextProps> = ({ text, highlight }) => {
  const highlightQuery = highlight.trim();

  if (!highlightQuery || !text) {
    return <>{text}</>;
  }

  // Split search query by spaces to highlight individual words
  const searchWords = highlightQuery.split(/\s+/).filter(word => word.length > 0);
  if (searchWords.length === 0) {
    return <>{text}</>;
  }

  const escapedWords = searchWords.map(escapeRegExp);
  const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        // The parts array will have the matched delimiters at odd indices
        index % 2 === 1 ? (
          <mark key={index} className="bg-cyan-500/30 text-inherit rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

export default HighlightText;
