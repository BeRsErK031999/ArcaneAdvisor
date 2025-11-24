import { z } from 'zod';

export interface Subclass {
  subclass_id: string;
  class_id: string;
  name: string;
  description: string;
  name_in_english: string;
}

export const SubclassCreateSchema = z.object({
  class_id: z.string().uuid('Некорректный UUID класса'),
  name: z.string().min(1, 'Название подкласса обязательно'),
  description: z.string().min(1, 'Описание обязательно'),
  name_in_english: z.string().min(1, 'Английское название обязательно'),
});

export type SubclassCreateInput = z.infer<typeof SubclassCreateSchema>;
