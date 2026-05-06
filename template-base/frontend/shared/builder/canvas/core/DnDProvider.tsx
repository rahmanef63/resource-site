import React, { createContext, useContext, useState } from 'react';

interface DnDContextType {
  type: string | null;
  setType: (type: string | null) => void;
}

const DnDContext = createContext<DnDContextType | null>(null);

export const useDnD = () => {
  const context = useContext(DnDContext);
  if (!context) {
    throw new Error('useDnD must be used within DnDProvider');
  }
  return [context.type, context.setType] as const;
};

interface DnDProviderProps {
  children: React.ReactNode;
}

export const DnDProvider: React.FC<DnDProviderProps> = ({ children }) => {
  const [type, setType] = useState<string | null>(null);

  return (
    <DnDContext.Provider value={{ type, setType }}>
      {children}
    </DnDContext.Provider>
  );
};
