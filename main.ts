import { type Handler, serve } from "std/http/server.ts";
import { walkSync } from "std/fs/walk.ts";
import { renderToString } from "preact-render-to-string";
import { h } from "preact";
import App from "./app.tsx";
import build from "./utils/build.ts";

const respInit = {
  html: { headers: { "content-type": "text/html" } },
  js: { headers: { "content-type": "application/javascript" } },
};

const files = [...walkSync("./pages", { includeDirs: false })];
const pages = files.map((w) => w.name.replace(/.tsx$/, ""));

console.time("Build");
await build(["utils/load.ts", ...files.map((w) => w.path)]);
console.timeEnd("Build");

const handler: Handler = async (req) => {
  const pathname = new URL(req.url).pathname.replace(/^\//, "");
  if (pathname.length == 0) {
    const html = renderToString(h(App, { page: "__default" }));
    return new Response(html, respInit.html);
  } else if (pathname.startsWith("js/")) {
    const file = await Deno.open(`./${pathname}`);
    return new Response(file.readable, respInit.js);
  } else if (pages.indexOf(pathname) >= 0) {
    const html = renderToString(h(App, { page: pathname }));
    return new Response(html, respInit.html);
  } else {
    return new Response(null, { status: 404 });
  }
};

if (import.meta.main) {
  serve(handler, { port: 8000 });
}
