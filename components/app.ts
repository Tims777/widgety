import { h } from "preact";
import { Page } from "./page.ts";

const style = { padding: 0, margin: 0 };

export interface AppProps {
  page: string;
}

export default function App(props: AppProps) {
  const head = h("head", {}, h("meta", { charSet: "utf-8" }));
  const body = h("body", { style }, h(Page, { name: props.page }));
  return h("html", {}, head, body);
}
