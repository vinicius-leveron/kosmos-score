/**
 * Channel platform configuration - colors, labels, and icons
 */

import type { ChannelPlatform, ContentType, ContentFormat, PostingFrequency, ProductType } from './competitorTypes';

interface PlatformConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const PLATFORM_CONFIG: Record<ChannelPlatform, PlatformConfig> = {
  instagram: {
    label: 'Instagram',
    color: '#E4405F',
    bgColor: 'bg-pink-500/10',
    icon: 'Instagram',
  },
  youtube: {
    label: 'YouTube',
    color: '#FF0000',
    bgColor: 'bg-red-500/10',
    icon: 'Youtube',
  },
  tiktok: {
    label: 'TikTok',
    color: '#000000',
    bgColor: 'bg-gray-500/10',
    icon: 'Music2',
  },
  website: {
    label: 'Website',
    color: '#3B82F6',
    bgColor: 'bg-blue-500/10',
    icon: 'Globe',
  },
  podcast: {
    label: 'Podcast',
    color: '#8B5CF6',
    bgColor: 'bg-purple-500/10',
    icon: 'Mic',
  },
  newsletter: {
    label: 'Newsletter',
    color: '#F59E0B',
    bgColor: 'bg-amber-500/10',
    icon: 'Mail',
  },
  twitter: {
    label: 'X / Twitter',
    color: '#1DA1F2',
    bgColor: 'bg-sky-500/10',
    icon: 'Twitter',
  },
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  educativo: 'Educativo',
  entretenimento: 'Entretenimento',
  promocional: 'Promocional',
  storytelling: 'Storytelling',
};

export const CONTENT_FORMAT_LABELS: Record<ContentFormat, string> = {
  video: 'Vídeo',
  carrossel: 'Carrossel',
  imagem: 'Imagem',
  texto: 'Texto',
  audio: 'Áudio',
  live: 'Live',
};

export const POSTING_FREQUENCY_LABELS: Record<PostingFrequency, string> = {
  diario: 'Diário',
  '3x_semana': '3x/semana',
  semanal: 'Semanal',
  quinzenal: 'Quinzenal',
  mensal: 'Mensal',
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  curso: 'Curso',
  mentoria: 'Mentoria',
  comunidade: 'Comunidade',
  ebook: 'E-book',
  consultoria: 'Consultoria',
  SaaS: 'SaaS',
};

/** Status label and color for pipeline stages */
export const PIPELINE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Aguardando', color: 'text-kosmos-gray' },
  discovering: { label: 'Descobrindo canais', color: 'text-blue-400' },
  scraping: { label: 'Extraindo dados', color: 'text-amber-400' },
  analyzing: { label: 'Analisando conteúdo', color: 'text-purple-400' },
  enriching: { label: 'Gerando insights', color: 'text-cyan-400' },
  completed: { label: 'Concluído', color: 'text-green-400' },
  failed: { label: 'Falhou', color: 'text-red-400' },
};
