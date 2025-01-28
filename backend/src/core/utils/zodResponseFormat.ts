import { z } from 'zod';

export function zodResponseFormat(schema: z.ZodSchema<any>, name: string) {
  return {
    type: 'json_schema',
    json_schema: {
      type: 'object',
      properties: {
        [name]: {
          type: 'array',
          items: schema,
        },
      },
      required: [name],
    },
  };
}
