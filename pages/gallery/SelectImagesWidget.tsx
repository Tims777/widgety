import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "preact/hooks";
import { CursorContext, useCursor } from "../../components/CursorContext.tsx";
import CursorControls from "../../components/CursorControls.tsx";
import ImageViewer from "../../components/ImageViewer.tsx";
import If from "../../components/If.tsx";
import Quick from "../../quick/quick.ts";
import stager from "../../services/image-staging.ts";

const imageMimeTypes = "image/*";

function* iterate<T>(items: { length: number; [index: number]: T }) {
  for (let i = 0; i < items.length; i++) {
    yield items[i];
  }
}

let quick: Quick;

export default function SelectImagesWidget() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  /*
  const [files, setFiles] = useState<File[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const cursor = useCursor();

  const currentFile = files.length > cursor.value ? files[cursor.value] : null;

  const updateFiles = useCallback((input: HTMLInputElement) => {
    const files = [...iterate(input.files ?? [])];
    setFiles(files);
    cursor.setBounds([0, files.length]);
  }, []);

  useEffect(() => {
    // Read back state from HTML input
    updateFiles(fileInputRef.current!);

    // Set up Quick
    quick = new Quick(containerRef.current!);
  }, []);

  useEffect(() => {
    // Reload Quick
    quick?.rebuildNavigationTree();
  }, [files.length > 0]);

  useEffect(() => {
    if (!currentFile) return;
    stager.isStaged(currentFile).then((result) => {
      checkboxRef.current!.checked = result;
    });
  }, [currentFile]);
*/
  return (
    /*
      <If condition={files.length > 0}>
        <CursorContext.Provider value={cursor}>
          <CursorControls />
          <p>
            {currentFile?.name}
            <input
              type="checkbox"
              ref={checkboxRef}
              disabled={!currentFile}
              onChange={(e) =>
                stager.setStaged(currentFile!, e.currentTarget.checked)}
              class="quick-select"
            />
          </p>
          <ImageViewer files={files} />
        </CursorContext.Provider>
      </If>*/
      <fieldset>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          accept={imageMimeTypes}
          //onChange={(event) => updateFiles(event.currentTarget)}
          class="quick-enter"
        />
      </fieldset>
  );
}
