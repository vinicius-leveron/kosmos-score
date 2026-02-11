export const testUsers = {
  admin: {
    email: 'admin@kosmostoolkit.com',
    password: 'Admin@123456',
    name: 'Admin User',
    role: 'admin'
  },
  client: {
    email: 'client@example.com',
    password: 'Client@123456',
    name: 'Client User',
    role: 'client'
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  }
};

export const testContacts = {
  lead1: {
    name: 'João Silva',
    email: 'joao.silva@example.com',
    phone: '(11) 98765-4321',
    company: 'Tech Solutions Ltda',
    status: 'lead'
  },
  lead2: {
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    phone: '(21) 99876-5432',
    company: 'Digital Marketing Co',
    status: 'lead'
  },
  contact1: {
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@example.com',
    phone: '(31) 97654-3210',
    company: 'Inovação Tech',
    status: 'contact'
  }
};

export const testDeals = {
  deal1: {
    title: 'Implementação KOSMOS Toolkit',
    value: '15000',
    stage: 'Qualificação',
    contact: 'João Silva',
    probability: 30
  },
  deal2: {
    title: 'Consultoria Digital',
    value: '8500',
    stage: 'Proposta',
    contact: 'Maria Santos',
    probability: 60
  },
  deal3: {
    title: 'Treinamento Equipe',
    value: '5000',
    stage: 'Negociação',
    contact: 'Pedro Oliveira',
    probability: 80
  }
};

export const pipelineStages = [
  'Qualificação',
  'Proposta',
  'Negociação',
  'Fechamento'
];

export const testFormData = {
  basicLead: {
    name: 'Carlos Teste',
    email: 'carlos.teste@example.com',
    phone: '(41) 98888-7777',
    company: 'Empresa Teste',
    message: 'Gostaria de saber mais sobre o KOSMOS Toolkit'
  },
  kosmosScore: {
    name: 'Ana Avaliação',
    email: 'ana.avaliacao@example.com',
    // Responses will be selected during test
  },
  invalidForm: {
    name: '', // Empty name to trigger validation
    email: 'invalid-email', // Invalid email format
    phone: '123', // Too short
  }
};

// Helper function to generate unique test data
export function generateUniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${random}@example.com`;
}

export function generateUniqueName(prefix: string = 'Test User'): string {
  const timestamp = Date.now();
  return `${prefix} ${timestamp}`;
}

// Test timeouts
export const timeouts = {
  short: 5000,
  medium: 10000,
  long: 30000,
  navigation: 15000
};

// URLs for different environments
export const urls = {
  local: 'http://localhost:8080',
  staging: process.env.STAGING_URL || 'http://localhost:8080',
  production: process.env.PRODUCTION_URL || 'http://localhost:8080'
};

// Common selectors
export const selectors = {
  loader: '[data-testid="loader"], .spinner, .loading',
  modal: '[role="dialog"], [data-testid="modal"], .modal',
  toast: '[data-testid="toast"], .toast, [role="status"]',
  alert: '[role="alert"], [data-testid="alert"]',
  dropdown: '[role="combobox"], [data-testid="dropdown"], select',
  table: 'table, [role="table"]',
  form: 'form, [data-testid="form"]'
};