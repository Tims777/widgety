import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { CursorContext, useCursor } from "../components/CursorContext.tsx";
import CursorControls from "../components/CursorControls.tsx";
import ImageViewer from "../components/ImageViewer.tsx";
import If from "../components/If.tsx";
import Quick from "../quick/quick.ts";
import stager from "../services/image-staging.ts";
import exifr from "exifr";

const imageInputProps = {
  type: "file",
  accept: "image/*",
  webkitdirectory: true,
};

let quick: Quick;

async function exifDateSort(files: File[], field = "DateTimeOriginal") {
  const data = await Promise.all(
    files.map((f) =>
      exifr
        .parse(f, [field])
        .then((m) => [m?.[field].getTime(), f])
    ),
  ) as [number, File][];
  data.sort();
  return data.map(([_, f]) => f);
}

export default function SelectImagesWidget() {
  const [files, setFiles] = useState<File[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const cursor = useCursor();

  const currentFile = files.length > cursor.value ? files[cursor.value] : null;
  const controlsVisible = files.length > 0;

  const updateFiles = useCallback(async (input: HTMLInputElement) => {
    const files = Array.from(input.files ?? []);
    console.time("sort");
    const sorted = await exifDateSort(files);
    console.timeEnd("sort");
    setFiles(sorted);
    cursor.setBounds([0, files.length]);
  }, []);

  useEffect(() => {
    // Set up Quick
    quick = new Quick(containerRef.current!);
  }, []);

  useEffect(() => {
    if (!currentFile) return;
    stager.isStaged(currentFile).then((result) => {
      checkboxRef.current!.checked = result;
    });
  }, [currentFile]);

  useEffect(() => {
    // Reload Quick
    quick?.rebuildNavigationTree();
  }, [controlsVisible]);

  return (
    <div ref={containerRef} style="text-align: center">
      <If condition={controlsVisible}>
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
      </If>
      <fieldset>
        <input
          {...imageInputProps}
          ref={inputRef}
          onChange={(event) => updateFiles(event.currentTarget)}
          class="quick-enter"
        />
      </fieldset>
    </div>
  );
}
