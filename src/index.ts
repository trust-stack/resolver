import {OpenAPIHono} from "@hono/zod-openapi";
import links from "./link/link.handler";

const app = new OpenAPIHono();

app.route("/links", links);

export default app;
