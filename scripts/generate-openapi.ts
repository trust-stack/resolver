import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createApp } from '../src';
import { defaultSqliteOptions } from '../src/infra/sqlite';
import { getOpenApiConfig } from '../src/openapi/config';

async function main() {
  const app = createApp(defaultSqliteOptions());
  const document = app.getOpenAPIDocument(getOpenApiConfig());
  const outputPath = resolve(process.cwd(), 'openapi.json');
  await writeFile(outputPath, JSON.stringify(document, null, 2));
  console.log(`OpenAPI schema generated at ${outputPath}`);
}

main().catch((error) => {
  console.error('Failed to generate OpenAPI schema', error);
  process.exit(1);
});
