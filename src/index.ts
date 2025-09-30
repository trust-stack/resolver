import { OpenAPIHono } from '@hono/zod-openapi';
import { contextStorage } from 'hono/context-storage';
import links from './link/link.handler';
import { getOpenApiConfig } from './openapi/config';
import { authMiddleware, dependencyMiddlewareFactory } from './request-context';
import resolver from './resolver/resolver.handler';

export function createApp() {
  const app = new OpenAPIHono();
  app.doc('/openapi.json', () => getOpenApiConfig());

  app.use(contextStorage());
  app.use(authMiddleware);
  app.use(dependencyMiddlewareFactory());

  app.route('/links', links);
  app.route('/', resolver);

  return app;
}

export type App = ReturnType<typeof createApp>;
const app = createApp();
export default app;
