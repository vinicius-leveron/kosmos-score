import { createContext, useContext, ReactNode } from 'react';

interface EmbedContextType {
  isEmbed: boolean;
}

const EmbedContext = createContext<EmbedContextType>({ isEmbed: false });

interface EmbedProviderProps {
  children: ReactNode;
  isEmbed: boolean;
}

export function EmbedProvider({ children, isEmbed }: EmbedProviderProps) {
  return (
    <EmbedContext.Provider value={{ isEmbed }}>
      {children}
    </EmbedContext.Provider>
  );
}

export function useEmbed() {
  return useContext(EmbedContext);
}
