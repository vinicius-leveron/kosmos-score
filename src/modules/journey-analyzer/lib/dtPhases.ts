import type { DTPhaseId, PhaseStatus } from '../types';

export const DT_PHASES = [
  {
    id: 'empathize' as DTPhaseId,
    name: 'Empatia',
    description: 'Entender profundamente o usuario e suas necessidades',
    icon: 'Heart',
    color: '#8b5cf6',
    tabLabel: 'Empatia',
  },
  {
    id: 'define' as DTPhaseId,
    name: 'Definir',
    description: 'Sintetizar insights em problemas claros',
    icon: 'Target',
    color: '#6366f1',
    tabLabel: 'Definir',
  },
  {
    id: 'ideate' as DTPhaseId,
    name: 'Idear',
    description: 'Gerar solucoes criativas para os problemas',
    icon: 'Lightbulb',
    color: '#0ea5e9',
    tabLabel: 'Idear',
  },
  {
    id: 'prototype' as DTPhaseId,
    name: 'Prototipar',
    description: 'Transformar ideias em plano de acao concreto',
    icon: 'Hammer',
    color: '#10b981',
    tabLabel: 'Prototipar',
  },
  {
    id: 'test' as DTPhaseId,
    name: 'Testar',
    description: 'Validar hipoteses e medir resultados',
    icon: 'FlaskConical',
    color: '#f59e0b',
    tabLabel: 'Testar',
  },
] as const;

export function getPhaseLabel(status: PhaseStatus): string {
  switch (status) {
    case 'not_started':
      return 'Nao iniciado';
    case 'in_progress':
      return 'Em andamento';
    case 'completed':
      return 'Concluido';
  }
}

export function getPhaseStatusColor(status: PhaseStatus): string {
  switch (status) {
    case 'not_started':
      return 'bg-gray-100 text-gray-600';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700';
    case 'completed':
      return 'bg-green-100 text-green-700';
  }
}
