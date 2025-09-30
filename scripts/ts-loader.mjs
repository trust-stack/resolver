import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

export async function resolve(specifier, context, defaultResolve) {
  const parentURL = context.parentURL || pathToFileURL(process.cwd() + '/');

  const convertSpecifier = () => {
    if (specifier === 'drizzle-orm/libsql') {
      return new URL('./stubs/drizzle-orm-libsql.ts', pathToFileURL(`${process.cwd()}/scripts/`))
        .href;
    }

    if (specifier.endsWith('.ts')) {
      return new URL(specifier, parentURL).href;
    }

    if (specifier.startsWith('file://')) {
      const url = new URL(specifier);
      if (existsSync(fileURLToPath(url))) {
        return url.href;
      }
      if (!url.pathname.endsWith('.ts')) {
        const candidateUrl = new URL(`${url.pathname}.ts`, url);
        if (existsSync(fileURLToPath(candidateUrl))) {
          return candidateUrl.href;
        }

        const indexUrl = new URL(`${url.pathname}/index.ts`, url);
        if (existsSync(fileURLToPath(indexUrl))) {
          return indexUrl.href;
        }
        return `${url.href}.ts`;
      }
      return url.href;
    }

    if (
      (specifier.startsWith('./') || specifier.startsWith('../') || specifier.startsWith('/')) &&
      !specifier.endsWith('.ts')
    ) {
      const tsUrl = new URL(`${specifier}.ts`, parentURL);
      if (existsSync(fileURLToPath(tsUrl))) {
        return tsUrl.href;
      }

      const indexUrl = new URL(`${specifier}/index.ts`, parentURL);
      if (existsSync(fileURLToPath(indexUrl))) {
        return indexUrl.href;
      }

      return new URL(specifier, parentURL).href;
    }

    return null;
  };

  const converted = convertSpecifier();
  if (converted) {
    return {
      url: converted,
      shortCircuit: true,
    };
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
  if (url.endsWith('.ts')) {
    const source = await readFile(new URL(url));
    const transpiled = ts.transpileModule(source.toString(), {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.NodeNext,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
        importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
      },
      fileName: url,
    });

    return {
      format: 'module',
      source: transpiled.outputText,
      shortCircuit: true,
    };
  }
  return defaultLoad(url, context, defaultLoad);
}
