import type { FieldError, Resolver } from "react-hook-form";
import type { ZodSchema, ZodError } from "zod";

export function makeZodResolver<TFieldValues extends Record<string, unknown>>(
  schema: ZodSchema<TFieldValues>
): Resolver<TFieldValues> {
  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} } as ReturnType<Resolver<TFieldValues>>;
    }
    const zodError = result.error as ZodError;
    const errors: Record<string, FieldError> = {};
    for (const issue of zodError.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !errors[key]) {
        errors[key] = { type: issue.code, message: issue.message };
      }
    }
    return { values: {}, errors } as ReturnType<Resolver<TFieldValues>>;
  };
}
