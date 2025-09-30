import { OpenAPIHono } from '@hono/zod-openapi';

import { resolveRoute } from './resolver.route';
import { resolve as resolvePath } from './resolver.service';

const app = new OpenAPIHono();

app.openapi(resolveRoute, async (c) => {
  const query = c.req.valid('query');
  const result = await resolvePath(c.req.path, query);

  if (result.type === 'redirect') {
    return c.redirect(result.location, 307);
  }

  if (result.type === 'linkset') {
    return c.json(result.body, 200);
  }

  return c.json({ message: 'Link not found' }, 404);
});

export default app;
