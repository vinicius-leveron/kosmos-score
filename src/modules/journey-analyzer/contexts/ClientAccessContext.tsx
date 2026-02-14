import { createContext, useContext } from 'react';
import type { ClientProjectData } from '../types';

interface ClientAccessContextValue {
  token: string;
  data: ClientProjectData;
}

const ClientAccessContext = createContext<ClientAccessContextValue | null>(null);

export function ClientAccessProvider({
  token,
  data,
  children,
}: ClientAccessContextValue & { children: React.ReactNode }) {
  return (
    <ClientAccessContext.Provider value={{ token, data }}>
      {children}
    </ClientAccessContext.Provider>
  );
}

export function useClientContext() {
  const ctx = useContext(ClientAccessContext);
  if (!ctx) {
    throw new Error('useClientContext must be used within ClientAccessProvider');
  }
  return ctx;
}
