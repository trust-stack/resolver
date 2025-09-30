import { OpenAPIHono } from '@hono/zod-openapi';
import { contextStorage } from 'hono/context-storage';
import links from './link/link.handler';
import { LinkRepository } from './link/link.repository';
import { getOpenApiConfig } from './openapi/config';
import { authMiddleware, dependencyMiddlewareFactory } from './request-context';
import resolver from './resolver/resolver.handler';
import { ResolverRepository } from './resolver/resolver.repository';

export type AppOptions = {
  linksRepository: LinkRepository;
  resolverRepository: ResolverRepository;
};

export function createApp(options: AppOptions) {
  const app = new OpenAPIHono();
  app.doc('/openapi.json', () => getOpenApiConfig());

  app.use(contextStorage());
  app.use(dependencyMiddlewareFactory(options));
  // Auth + DI only for /links endpoints (root and nested)
  app.use('/links', authMiddleware);
  app.use('/links/*', authMiddleware);
  app.route('/links', links);

  // Public resolver routes (mounted after /links to avoid catch-all collisions)

  app.route('/', resolver);

  return app;
}

export type App = ReturnType<typeof createApp>;
