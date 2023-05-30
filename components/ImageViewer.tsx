import { useContext, useEffect } from "preact/hooks";
import { Component, createRef } from "preact";
import { Dimension } from "../math/vector.ts";
import { CursorContext } from "./CursorContext.tsx";

interface ImageViewerProps {
  files?: File[];
}

export default class ImageViewer extends Component<ImageViewerProps> {
  private canvasRef = createRef<HTMLCanvasElement>();

  state = {
    width: 500,
    height: 500,
  };

  public render(props: ImageViewerProps) {
    const cursor = useContext(CursorContext);

    useEffect(() => {
      // Decode the selected image and render it to the canvas, but only after an initial delay has passed.
      // This is to compensate for high frequencies of selection changes, when the user holds down an arrow key.
      const initialDelay = 25;
      let imageWorker: Worker | undefined;
      const timeoutId = setTimeout(() => {
        if (!props.files || !props.files.length) return;
        imageWorker = new Worker("/workers/decode-image.js");
        imageWorker.onmessage = (e) => this.renderImage(e.data);
        imageWorker.postMessage(props.files[cursor.value]);
      }, initialDelay);

      return () => {
        clearTimeout(timeoutId);
        imageWorker?.terminate();
      };
    }, [props.files, cursor]);

    return (
      <canvas
        ref={this.canvasRef}
        width={this.state.width}
        height={this.state.height}
      />
    );
  }

  private renderImage(image: CanvasImageSource) {
    const canvas = this.canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const imageDim = Dimension.of(image);
    const canvasDim = Dimension.of(canvas);
    const scale = canvasDim.div(imageDim).min();
    const scaledImageDim = imageDim.mul(scale);
    const padding = canvasDim.sub(scaledImageDim).div(2);
    context.clearRect(0, 0, canvasDim.x, canvasDim.y);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      image,
      padding.x,
      padding.y,
      scaledImageDim.x,
      scaledImageDim.y,
    );
  }
}
