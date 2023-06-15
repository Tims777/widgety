import { useContext, useEffect, useRef } from "preact/hooks";
import { Component } from "preact";
import { CursorContext } from "./CursorContext.tsx";
import { thumbnail } from "../utils/thumbnail.ts";
import { Dimension } from "../math/vector.ts";

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
  public render(props: ImageViewerProps) {
    const cursor = useContext(CursorContext);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawImage = (img?: HTMLImageElement, rot?: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const canvasSize = Dimension.of(canvas);
      const canvasCenter = canvasSize.mul(.5);

      ctx.setTransform();
      ctx.clearRect(
        0,
        0,
        canvasSize.x,
        canvasSize.y,
      );

      if (img) {
        const actualSize = Dimension.of(img);
        const scale = canvasSize.div(actualSize).min();
        const imageSize = actualSize.mul(scale);
        const imageCenter = imageSize.mul(.5);
        ctx.translate(canvasCenter.x, canvasCenter.y);
        ctx.rotate((rot ?? 0) * Math.PI / 180);
        ctx.drawImage(
          img,
          -imageCenter.x,
          -imageCenter.y,
          imageSize.x,
          imageSize.y,
        );
      }
    };

    useEffect(() => {
      const rescaleCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      };
      window.onresize = rescaleCanvas;
      rescaleCanvas();
    }, []);

    useEffect(() => {
      drawImage(undefined);

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
            const image = new Image();
            image.src = imageUrl;
            image.decode().then(() => {
              if (controller.signal.aborted) return;
              drawImage(image, rot);
            });
          });

        setTimeout(() => {
          if (controller.signal.aborted) return;
          const imageUrl = URL.createObjectURL(currentFile);
          onAbort(() => URL.revokeObjectURL(imageUrl));
          const image = new Image();
          image.src = imageUrl;
          image.decode().then(() => {
            if (controller.signal.aborted) return;
            drawImage(image);
          });
        }, 100);

        return () => controller.abort();
      }
    }, [cursor.value]);

    return <canvas ref={canvasRef} style="width:100%; height:100%;" />;
  }
}
