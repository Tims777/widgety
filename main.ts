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
  /^pages(\/.*).tsx$/.exec(w.path.replaceAll(SEP, posix.sep))?.[1]
);

console.time("Build");
const assets = await build(["utils/load.ts", ...files.map((w) => w.path)]);
console.timeEnd("Build");

const handler: Handler = (req) => {
  const pathname = new URL(req.url).pathname.replace(/\/$/, "");

  if (assets.has(pathname)) {
    return new Response(assets.get(pathname), respInit.js);
  }

  if (pathname == "") {
    const html = renderToString(h(App, { page: "__default" }));
    return new Response(html, respInit.html);
  }

  if (pages.indexOf(pathname) >= 0) {
    const html = renderToString(h(App, { page: pathname.replace(/^\//, "") }));
    return new Response(html, respInit.html);
  }

  return new Response(null, { status: 404 });
};

if (import.meta.main) {
  serve(handler, { port: 8000 });
}
