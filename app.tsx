export interface AppProps {
  page: string;
}

export default function App(props: AppProps) {
  const loadPage =
    `import load from "/js/utils/load.js"; load("${props.page}");`;
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <script type="module" dangerouslySetInnerHTML={{ __html: loadPage }} />
        <style>{"html, body, main, div { padding: 0; margin: 0; }"}</style>
      </head>
      <body>
        <main id="content" />
      </body>
    </html>
  );
}
