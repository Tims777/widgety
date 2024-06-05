import { Fragment, h } from "preact";

export interface PageProps {
  name: string;
}

export function Page(props: PageProps) {
  const loaderScript =
    `import load from "/js/utils/load.js"; load("${props.name}");`;
  const children = [
    h("main", { id: "content" }),
    h("script", {
      type: "module",
      dangerouslySetInnerHTML: { __html: loaderScript },
    }),
  ];
  return h(Fragment, {}, ...children);
}
