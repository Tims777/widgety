import { useContext, useEffect, useState } from "preact/hooks";
import { Component } from "preact";
import { CursorContext } from "./CursorContext.tsx";
import { thumbnail } from "../utils/thumbnail.ts";

type Callback<T = void> = () => T;

function useAbortController(): [AbortController, (cb: Callback) => number] {
  const controller = new AbortController();
  const callbacks: Callback[] = [];
  const onAbort = (cb: Callback) => callbacks.push(cb);
  controller.signal.onabort = () => callbacks.forEach((cb) => cb());
  return [controller, onAbort];
}

export interface ImageViewerProps {
  files?: File[];
}

export default class ImageViewer extends Component<ImageViewerProps> {
  state = {
    width: 500,
    height: 500,
  };

  public render(props: ImageViewerProps) {
    const cursor = useContext(CursorContext);
    const [url, setUrl] = useState<string>();
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
      setUrl(undefined);
      setRotation(0);

      const currentFile = props.files?.[cursor.value];

      if (currentFile) {
        const [controller, onAbort] = useAbortController();

        thumbnail(currentFile)
          .then(([thumb, rot]) => {
            if (controller.signal.aborted) return;
            const imageUrl = URL.createObjectURL(
              new Blob(thumb ? [thumb] : []),
            );
            onAbort(() => URL.revokeObjectURL(imageUrl));
            setUrl(imageUrl);
            setRotation(rot);
          });

        setTimeout(() => {
          if (controller.signal.aborted) return;
          const imageUrl = URL.createObjectURL(currentFile);
          onAbort(() => URL.revokeObjectURL(imageUrl));
          const image = new Image();
          image.src = imageUrl;
          image.decode().then(() => {
            if (controller.signal.aborted) return;
            setUrl(imageUrl);
            setRotation(0);
          });
        }, 100);

        return () => controller.abort();
      }
    }, [cursor.value]);

    return (
      <img
        src={url}
        height={this.state.height}
        style={`transform: rotate(${rotation}deg)`}
      />
    );
  }
}
