'use client'

import React, { createContext, useContext, useState } from 'react';

interface TextContextType {
  inputText: string;
  setInputText: (text: string) => void;
}

const TextContext = createContext<TextContextType | undefined>(undefined);

export const TextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [inputText, setInputText] = useState('');

  return (
    <TextContext.Provider value={{ inputText, setInputText }}>
      {children}
    </TextContext.Provider>
  );
};

export const useText = () => {
  const context = useContext(TextContext);
  if (!context) {
    throw new Error('useText must be used within a TextProvider');
  }
  return context;
};
