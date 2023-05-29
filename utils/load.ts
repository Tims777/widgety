import { render } from "preact";

export default async function load(name: string) {
  const page = await import(`../pages/${name}.js`);
  render(page.default(), document.getElementById("content")!);
}
