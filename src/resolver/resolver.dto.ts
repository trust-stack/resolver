import z from 'zod';

import { LinksetResponseSchema, ResolverQuerySchema } from './resolver.schema';

export type ResolverQueryDto = z.infer<typeof ResolverQuerySchema>;
export type LinksetResponseDto = z.infer<typeof LinksetResponseSchema>;
