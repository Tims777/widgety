import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "preact/hooks";
import { Component } from "preact";
import exifr from "exifr";
import { CursorContext } from "./CursorContext.tsx";

interface ImageViewerProps {
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

    const setImage = useCallback(
      (imageUrl: string) =>
        setUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return imageUrl;
        }),
      [],
    );

    useEffect(() => {
      setUrl(undefined);
      const currentFile = props.files?.[cursor.value];

      if (currentFile) {
        const controller = new AbortController();

        exifr.thumbnail(currentFile).then((t) => {
          if (controller.signal.aborted) return;
          const imageUrl = URL.createObjectURL(new Blob(t ? [t] : undefined));
          controller.signal.onabort = () => URL.revokeObjectURL(imageUrl);
          setImage(imageUrl);
        });

        setTimeout(() => {
          if (controller.signal.aborted) return;
          const imageUrl = URL.createObjectURL(currentFile);
          controller.signal.onabort = () => URL.revokeObjectURL(imageUrl);
          const image = new Image();
          image.src = imageUrl;
          image.decode().then(() => {
            if (controller.signal.aborted) return;
            setImage(imageUrl);
          });
        }, 100);

        return () => controller.abort();
      }
    }, [cursor.value]);

    return (
      <img
        src={url}
        height={this.state.height}
      />
    );
  }
}
