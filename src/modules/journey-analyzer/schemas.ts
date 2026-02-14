import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Nome do projeto obrigatorio').max(200),
  client_name: z.string().min(1, 'Nome do cliente obrigatorio').max(200),
  client_email: z.union([
    z.string().email('E-mail invalido'),
    z.literal(''),
  ]).optional(),
  description: z.string().max(1000).optional(),
  dt_mode: z.enum(['full', 'simplified']),
});

export const personaSchema = z.object({
  name: z.string().min(1, 'Nome da persona obrigatorio').max(200),
  role: z.string().max(200).optional(),
  age_range: z.string().max(50).optional(),
  bio: z.string().max(1000).optional(),
  goals: z.array(z.string().max(200)).max(20),
  pain_points: z.array(z.string().max(200)).max(20),
  behaviors: z.array(z.string().max(200)).max(20),
  motivations: z.array(z.string().max(200)).max(20),
});

export const ideaSchema = z.object({
  title: z.string().min(1, 'Titulo da ideia obrigatorio').max(300),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  impact: z.number().min(1).max(5).optional(),
  effort: z.number().min(1).max(5).optional(),
});

export const testPlanSchema = z.object({
  hypothesis: z.string().min(1, 'Hipotese obrigatoria').max(1000),
  method: z.string().max(100).optional(),
  success_metric: z.string().max(500).optional(),
  target_audience: z.string().max(200).optional(),
  idea_id: z.string().uuid().optional(),
});

export const touchpointSchema = z.object({
  name: z.string().min(1, 'Nome do touchpoint obrigatorio').max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['page', 'email', 'event', 'content', 'automation', 'whatsapp', 'call', 'other']),
});

export const problemStatementSchema = z.object({
  statement: z.string().min(1, 'Declaracao HMW obrigatoria').max(500),
  context: z.string().max(1000).optional(),
  persona_id: z.string().uuid().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type PersonaInput = z.infer<typeof personaSchema>;
export type IdeaInput = z.infer<typeof ideaSchema>;
export type TestPlanInput = z.infer<typeof testPlanSchema>;
export type TouchpointInput = z.infer<typeof touchpointSchema>;
export type ProblemStatementInput = z.infer<typeof problemStatementSchema>;
