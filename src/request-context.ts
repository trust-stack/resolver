import { MiddlewareHandler } from 'hono';
import { getContext } from 'hono/context-storage';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AppOptions } from '.';
import type { AuthContext } from './auth';
import { LinkRepository } from './link/link.repository';
import { ResolverRepository } from './resolver/resolver.repository';

export type RequestContext = {
  auth: AuthContext;
  linksRepository: LinkRepository;
  resolverRepository: ResolverRepository;
};

const storage = new AsyncLocalStorage<RequestContext>();

export const runWithRequestContext = async <T>(context: RequestContext, fn: () => Promise<T>) => {
  return storage.run(context, fn);
};

export const getRequestContext = (): RequestContext => {
  const context = getContext<{ Variables: RequestContext }>();
  return context.var;
};

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const organizationId = c.req.header('x-organization-id');
  const tenantId = c.req.header('x-tenant-id');
  const userId = c.req.header('x-user-id') ?? undefined;

  if (!organizationId) {
    throw new Error("Missing required header 'x-organization-id'");
  }

  if (!tenantId) {
    throw new Error("Missing required header 'x-tenant-id'");
  }

  const auth: AuthContext = {
    organizationId,
    tenantId: tenantId ?? organizationId,
    userId,
  };

  c.set('auth', auth);

  return next();
};

export const dependencyMiddlewareFactory = (options: AppOptions) => {
  const middleware: MiddlewareHandler = async (c, next) => {
    c.set('linksRepository', options.linksRepository);
    c.set('resolverRepository', options.resolverRepository);

    return next();
  };

  return middleware;
};
