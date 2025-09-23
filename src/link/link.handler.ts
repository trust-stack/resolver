import {OpenAPIHono} from "@hono/zod-openapi";

import {
  createLinkRoute,
  deleteLinkRoute,
  getLinkRoute,
  listLinksRoute,
  updateLinkRoute,
} from "./link.route";
import {linksService} from "./link.service";

const app = new OpenAPIHono();

app.openapi(createLinkRoute, async (c) => {
  const dto = c.req.valid("json");
  const link = await linksService.createLink(dto);

  return c.json(link, 201);
});

app.openapi(getLinkRoute, async (c) => {
  const {id} = c.req.valid("param");
  const link = await linksService.getLink(id);

  if (!link) {
    return c.json({message: "Link not found"}, 404);
  }

  return c.json(link);
});

app.openapi(updateLinkRoute, async (c) => {
  const {id} = c.req.valid("param");
  const dto = c.req.valid("json");
  const link = await linksService.updateLink(id, dto);

  if (!link) {
    return c.json({message: "Link not found"}, 404);
  }

  return c.json(link);
});

app.openapi(deleteLinkRoute, async (c) => {
  const {id} = c.req.valid("param");
  const deleted = await linksService.deleteLink(id);

  if (!deleted) {
    return c.json({message: "Link not found"}, 404);
  }

  return c.body(null, 204);
});

app.openapi(listLinksRoute, async (c) => {
  const query = c.req.valid("query");
  const result = await linksService.listLinks(query);

  return c.json(result);
});

export default app;
