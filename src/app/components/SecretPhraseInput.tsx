import React, { useState, useEffect, ChangeEvent } from 'react';
import { SeedPhraseInputProps } from '../types/Components';

const SeedPhraseInput: React.FC<SeedPhraseInputProps> = ({ seedPhrase, onChange, disable }) => {
  const [words, setWords] = useState<string[]>(Array(12).fill(''));

  useEffect(() => {
    if (seedPhrase) {
      setWords(seedPhrase.split(' '));
    }
  }, [seedPhrase]);

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value.trim().toLowerCase();
    setWords(newWords);
    onChange(newWords.join(' '));
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const pastedWords = pastedText.trim().split(/\s+/).slice(0, 12);
    const newWords = [...words];
    pastedWords.forEach((word, index) => {
      if (index < 12) {
        newWords[index] = word.toLowerCase();
      }
    });
    setWords(newWords);
    onChange(newWords.join(' '));
  };

  return (
    <div className="grid grid-cols-3 gap-2 px-8">
      {words.map((word, index) => (
        <input
          key={index}
          type="text"
          disabled={disable}
          value={word}
          onChange={(e: ChangeEvent<HTMLInputElement>) => handleWordChange(index, e.target.value)}
          className={`w-full p-2 text-center outline-none rounded ${disable? "text-white": ""}`}
          placeholder={`Word ${index + 1}`}
          onPaste={index === 0 ? handlePaste : undefined}
        />
      ))}
    </div>
  );
};

export default SeedPhraseInput;