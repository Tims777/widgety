import Header from "./components/Header.tsx";

export interface AppProps {
  page: string;
}

export default function App(props: AppProps) {
  const loadPage =
    `import load from "./js/utils/load.js"; load("${props.page}");`;
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <script type="module" dangerouslySetInnerHTML={{ __html: loadPage }}>
        </script>
      </head>
      <body>
        <Header />
        <main id="content" />
      </body>
    </html>
  );
}
