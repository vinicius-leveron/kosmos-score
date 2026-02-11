import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { render as rtlRender } from '@testing-library/react';
import { AuthProvider } from '@/core/auth/AuthContext';

// Create a new QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface WrapperProps {
  children: ReactNode;
}

export function createWrapper() {
  const queryClient = createTestQueryClient();
  
  return function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };
}

export function render(ui: React.ReactElement, options = {}) {
  const Wrapper = createWrapper();
  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { render };

// Utility to wait for async operations
export const waitForAsync = async () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Mock localStorage for tests
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    },
  };
};
