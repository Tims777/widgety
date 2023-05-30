import { type Handler, serve } from "std/http/server.ts";
import { walkSync } from "std/fs/walk.ts";
import { renderToString } from "preact-render-to-string";
import { h } from "preact";
import { posix, SEP } from "std/path/mod.ts";
import App from "./app.tsx";
import build from "./utils/build.ts";

const respInit = {
  html: { headers: { "content-type": "text/html" } },
  js: { headers: { "content-type": "application/javascript" } },
};

const files = [...walkSync("./pages", { includeDirs: false })];
const pages = files.map((w) =>
  /^pages\/(.*).tsx$/.exec(w.path.replaceAll(SEP, posix.sep))?.[1]
);

console.time("Build");
const assets = await build(["utils/load.ts", ...files.map((w) => w.path)]);
console.timeEnd("Build");

function renderPage(page: string) {
  return "<!doctype html>" + renderToString(h(App, { page }));
}

const handler: Handler = (req) => {
  const pathname = new URL(req.url).pathname;
  if (assets.has(pathname)) {
    return new Response(assets.get(pathname), respInit.js);
  }

  const pagename = pathname.replace(/\/$/, "/__default").replace(/^\//, "");
  if (pages.indexOf(pagename) >= 0) {
    return new Response(renderPage(pagename), respInit.html);
  }

  return new Response(null, { status: 404 });
};

if (import.meta.main) {
  serve(handler, { port: 8000 });
}
