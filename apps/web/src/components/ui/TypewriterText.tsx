import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speedMs?: number;
  onComplete?: () => void;
  className?: string;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speedMs = 24,
  onComplete,
  className = '',
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsDone(false);

    let index = 0;
    const interval = setInterval(() => {
      index++;
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
      } else {
        clearInterval(interval);
        setIsDone(true);
        if (onComplete) onComplete();
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, speedMs]);

  // Click to skip typewriter and show all
  const handleClick = () => {
    if (!isDone) {
      setDisplayedText(text);
      setIsDone(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer select-none ${className}`}
      title={isDone ? '' : 'Click to skip text animation'}
    >
      <span>{displayedText}</span>
      {!isDone && (
        <span className="inline-block w-2 h-4 ml-1 bg-emerald-600 animate-pulse align-middle" />
      )}
    </div>
  );
};
