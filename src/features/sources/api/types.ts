import { z } from 'zod';

export interface Source {
  source_id: string;
  name: string;
  description: string;
  name_in_english: string;
}

export const SourceCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  name_in_english: z.string().min(1),
});

export type SourceCreateInput = z.infer<typeof SourceCreateSchema>;

export const SourceUpdateSchema = z.object({
  name: z.string().nullable(),
  description: z.string().nullable(),
  name_in_english: z.string().nullable(),
});

export type SourceUpdateInput = z.infer<typeof SourceUpdateSchema>;
