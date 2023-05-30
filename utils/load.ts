import { h, render } from "preact";

export default async function load(name: string) {
  const page = await import(`../pages/${name}.js`);
  render(h(page.default, {}), document.getElementById("content")!);
}
