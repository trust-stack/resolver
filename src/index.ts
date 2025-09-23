import {OpenAPIHono} from "@hono/zod-openapi";

import links from "./link/link.handler.ts";
import {getOpenApiConfig} from "./openapi/config.ts";
import resolver from "./resolver/resolver.handler.ts";

const app = new OpenAPIHono();

app.route("/links", links);

app.doc("/openapi.json", () => getOpenApiConfig());

app.route("/", resolver);

export default app;
