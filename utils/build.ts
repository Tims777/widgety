import { build as esbuild } from "https://deno.land/x/esbuild@v0.17.19/mod.js";
import { denoPlugins } from "https://deno.land/x/esbuild_deno_loader@0.7.0/mod.ts";
import { toFileUrl } from "https://deno.land/std@0.189.0/path/mod.ts";

export interface DenoConfig {
  importMap: string;
  compilerOptions: {
    jsx: string;
    jsxImportSource: string;
  };
}

const workingDir = Deno.cwd();

const optimizationOptions = {
  treeShaking: true,
  minify: false,
  sourcemap: true,
} as const;

const bundlingOptions = {
  bundle: true,
  splitting: true,
  write: false,
  format: "esm",
  outdir: "./js",
  absWorkingDir: Deno.cwd(),
} as const;

export default async function build(
  entryPoints: Record<string, string> | string[],
  config: DenoConfig,
) {
  const jsx = "automatic";
  const jsxImportSource = config.compilerOptions.jsxImportSource;
  const importMapURL = toFileUrl(await Deno.realPath(config.importMap))
    .toString();
  const plugins = [...denoPlugins({ importMapURL })];

  const result = await esbuild({
    ...optimizationOptions,
    ...bundlingOptions,
    jsx,
    jsxImportSource,
    plugins,
    entryPoints,
  });

  const files = new Map<string, Uint8Array>();
  for (const output of result.outputFiles) {
    const path = toFileUrl(output.path.replace(workingDir, ""));
    files.set(path.pathname, output.contents);
  }
  return files;
}
