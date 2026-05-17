import { OpenAPIHono } from '@hono/zod-openapi';

import { InvalidPathError } from '../link/link.utils';
import { resolveRoute } from './resolver.route';
import { resolve as resolvePath } from './resolver.service';

const LINKSET_MEDIA_TYPE = 'application/linkset+json';

const app = new OpenAPIHono();

app.openapi(resolveRoute, async (c) => {
  const query = c.req.valid('query');

  const accept = c.req.header('Accept') ?? '';
  if (!query.linkType && accept.includes(LINKSET_MEDIA_TYPE)) {
    query.linkType = 'linkset';
  }

  try {
    const result = await resolvePath(c.req.path, query);

    if (result.type === 'redirect') {
      return c.redirect(result.location, 307);
    }

    if (result.type === 'linkset') {
      c.header('Content-Type', LINKSET_MEDIA_TYPE);
      return c.json(result.body, 200);
    }

    return c.json({ message: 'Link not found' }, 404);
  } catch (error) {
    if (error instanceof InvalidPathError) {
      return c.json({ message: error.message }, 400);
    }
    throw error;
  }
});

export default app;
