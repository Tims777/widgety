import { default as config } from "../deno.json" assert { type: "json" };
import { build } from "esbuild";
import { denoPlugins } from "esbuild_deno_loader";
import { toFileUrl } from "std/path/mod.ts";

const optimizationOptions = {
  treeShaking: true,
  minify: true,
  sourcemap: false,
} as const;

const bundlingOptions = {
  bundle: true,
  splitting: true,
  write: true,
  metafile: true,
  format: "esm",
  outdir: "./js",
} as const;

const jsxOptions = {
  jsx: "automatic",
  jsxImportSource: config.compilerOptions.jsxImportSource,
} as const;

const importMapURL = toFileUrl(await Deno.realPath(config.importMap))
  .toString();

const plugins = [...denoPlugins({ importMapURL })];

export default async function build_js(
  entryPoints: Record<string, string> | string[],
) {
  return await build({
    ...optimizationOptions,
    ...bundlingOptions,
    ...jsxOptions,
    plugins,
    entryPoints,
  });
}
