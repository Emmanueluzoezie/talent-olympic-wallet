import React, { createContext, useState, useContext, ReactNode } from 'react';

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  setPrimaryColor: (color: string) => void;
  setSecondaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  primaryColor: '#1a1a1a',
  secondaryColor: '#ffffff',
  setPrimaryColor: () => {},
  setSecondaryColor: () => {},
});

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState('#1a1a1a');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');

  return (
    <ThemeContext.Provider value={{ primaryColor, secondaryColor, setPrimaryColor, setSecondaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);