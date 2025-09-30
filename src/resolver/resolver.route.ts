import { createRoute } from '@hono/zod-openapi';

import { LinksetResponseSchema, ResolverQuerySchema } from './resolver.schema';

export const resolveRoute = createRoute({
  method: 'get',
  path: '/*',
  request: {
    query: ResolverQuerySchema,
  },
  responses: {
    200: {
      description: 'Resolved linkset',
      content: {
        'application/json': { schema: LinksetResponseSchema },
      },
    },
    307: {
      description: 'Redirect to resolved link',
    },
    404: {
      description: 'No matching link',
    },
  },
});
