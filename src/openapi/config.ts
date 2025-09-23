const DEFAULT_BASE_URL = process.env.RESOLVER_BASE_URL ?? "https://truststack.link";

export const getOpenApiConfig = () => ({
  openapi: "3.0.0",
  info: {
    title: "Trust Stack Resolver API",
    version: "1.0.0",
    description: "ISO Link Resolver endpoints for managing and resolving link sets.",
  },
  servers: [
    {
      url: DEFAULT_BASE_URL,
    },
  ],
});
