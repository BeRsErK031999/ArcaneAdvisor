import { z } from 'zod';

export interface Tool {
  tool_id: string;
  tool_type: string;
  name: string;
  description: string;

  cost: {
    count: number;
    piece_type: string;
  };

  weight: {
    count: number;
    unit: string;
  };

  utilizes: {
    action: string;
    complexity: number;
  }[];
}

export const ToolCreateSchema = z.object({
  tool_type: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),

  cost: z.object({
    count: z.number().nonnegative(),
    piece_type: z.string().min(1),
  }),

  weight: z.object({
    count: z.number().nonnegative(),
    unit: z.string().min(1),
  }),

  utilizes: z.array(
    z.object({
      action: z.string().min(1),
      complexity: z.number().int().nonnegative(),
    }),
  ),
});

export type ToolCreateInput = z.infer<typeof ToolCreateSchema>;
