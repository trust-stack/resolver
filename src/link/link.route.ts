import {createRoute} from "@hono/zod-openapi";

import {
  CreateLinkSchema,
  LinkIdSchema,
  LinkSchema,
  ListLinksQuerySchema,
  PaginatedLinksSchema,
  UpdateLinkSchema,
} from "./link.schema.ts";

export const createLinkRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {schema: CreateLinkSchema},
      },
    },
  },
  responses: {
    201: {
      description: "Link created",
      content: {
        "application/json": {schema: LinkSchema},
      },
    },
  },
});

export const getLinkRoute = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: LinkIdSchema,
  },
  responses: {
    200: {
      description: "Found link",
      content: {
        "application/json": {schema: LinkSchema},
      },
    },
    404: {
      description: "Link not found",
    },
  },
});

export const updateLinkRoute = createRoute({
  method: "patch",
  path: "/{id}",
  request: {
    params: LinkIdSchema,
    body: {
      content: {
        "application/json": {schema: UpdateLinkSchema},
      },
    },
  },
  responses: {
    200: {
      description: "Updated link",
      content: {
        "application/json": {schema: LinkSchema},
      },
    },
    404: {
      description: "Link not found",
    },
  },
});

export const deleteLinkRoute = createRoute({
  method: "delete",
  path: "/{id}",
  request: {
    params: LinkIdSchema,
  },
  responses: {
    204: {
      description: "Link deleted",
    },
    404: {
      description: "Link not found",
    },
  },
});

export const listLinksRoute = createRoute({
  method: "get",
  path: "/",
  request: {
    query: ListLinksQuerySchema,
  },
  responses: {
    200: {
      description: "List links",
      content: {
        "application/json": {schema: PaginatedLinksSchema},
      },
    },
  },
});
