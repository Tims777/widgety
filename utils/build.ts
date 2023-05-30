import { default as config } from "../deno.json" assert { type: "json" };
import { build } from "esbuild";
import { denoPlugins } from "esbuild_deno_loader";
import { toFileUrl } from "std/path/mod.ts";

const workingDir = Deno.cwd();

const optimizationOptions = {
  treeShaking: true,
  minify: true,
  sourcemap: false,
} as const;

const bundlingOptions = {
  bundle: true,
  splitting: true,
  write: false,
  metafile: true,
  format: "esm",
  outdir: "./js",
  absWorkingDir: workingDir,
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
  const result = await build({
    ...optimizationOptions,
    ...bundlingOptions,
    ...jsxOptions,
    plugins,
    entryPoints,
  });
  const files = new Map<string, Uint8Array>();
  for (const output of result.outputFiles) {
    const path = toFileUrl(output.path.replace(workingDir, ""));
    files.set(path.pathname.replace(/^\//, ""), output.contents);
  }
  return files;
}
