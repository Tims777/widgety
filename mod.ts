import { type ComponentType, h } from "preact";
import { renderToString } from "https://esm.sh/*preact-render-to-string@6.0.3";
import { type Handler, serve, type ServeInit } from "https://deno.land/std@0.189.0/http/server.ts";
import { walk } from "https://deno.land/std@0.189.0/fs/walk.ts";
import { posix, SEP, toFileUrl } from "https://deno.land/std@0.189.0/path/mod.ts";
import build, { type DenoConfig } from "./utils/build.ts";
import App, { type AppProps } from "./components/app.ts";

export const responseType = {
  html: { headers: { "content-type": "text/html" } },
  js: { headers: { "content-type": "application/javascript" } },
  json: { headers: { "content-type": "application/json" } },
} as const;

async function buildPages(
  directory: string,
  config: DenoConfig,
): Promise<[string[], Map<string, Uint8Array>]> {
  const realPageDir = await Deno.realPath(directory);
  const entryPoints: Record<string, string> = {
    "utils/load": import.meta.resolve("./utils/load.ts"),
  };
  const pagenames: string[] = [];
  for await (const file of walk(realPageDir, { includeDirs: false })) {
    const pagename = file.path
      .replace(realPageDir, "")
      .replaceAll(SEP, posix.sep)
      .replace(/^\//, "")
      .replace(/\.(js|jsx|ts|tsx)$/, "");
    pagenames.push(pagename);
    entryPoints[`pages/${pagename}`] = toFileUrl(file.path).toString();
  }
  const assets = await build(entryPoints, config);
  return [pagenames, assets];
}

function renderPage(app: ComponentType<AppProps>, page: string) {
  return "<!doctype html>" + renderToString(h(app, { page }));
}

export interface Service {
  handle(req: Request): Response | Promise<Response>;
}

export interface RunArgs extends ServeInit {
  pageDirectory?: string;
  config?: DenoConfig;
  services?: Record<string, Service>;
}

export default async function run(
  config: DenoConfig,
  args?: RunArgs,
): Promise<void> {
  const pageDirectory = args?.pageDirectory ?? "./pages";

  console.time("Build");
  const [pagenames, assets] = await buildPages(pageDirectory, config);
  console.timeEnd("Build");

  const services = new Map(Object.entries(args?.services ?? {}));

  const handler: Handler = (req) => {
    const pathname = new URL(req.url).pathname;
    if (services.has(pathname)) {
      return services.get(pathname)!.handle(req);
    }
    if (assets.has(pathname)) {
      return new Response(assets.get(pathname), responseType.js);
    }
    const pagename = pathname.replace(/\/$/, "/__default").replace(/^\//, "");
    if (pagenames.indexOf(pagename) >= 0) {
      return new Response(renderPage(App, pagename), responseType.html);
    }
    return new Response(null, { status: 404 });
  };

  return await serve(handler, args);
}
