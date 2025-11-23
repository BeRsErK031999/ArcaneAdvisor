import type { ZodTypeAny, z } from 'zod';

export type AnyZodSchema = ZodTypeAny;

export interface FormProps<TFormValues> {
  defaultValues: TFormValues;
  onSubmit: (values: TFormValues) => Promise<void> | void;
}

export interface ZodFormProps<TSchema extends AnyZodSchema> {
  schema: TSchema;
  defaultValues: z.infer<TSchema>;
  onSubmit: (values: z.infer<TSchema>) => Promise<void> | void;
}
