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
  console.time("read-exif");
  const data = await Promise.all(
    files.map((f) =>
      exifr
        .parse(f, [field])
        .then((m) => [m?.[field].getTime(), f])
        .catch((e) => {
          console.warn(f.name, ": ", e.message);
          return undefined;
        })
    ),
  );
  console.timeEnd("read-exif");
  console.time("sort");
  const sorted = data.filter((v) => v !== undefined).sort() as [number, File][];
  console.timeEnd("sort");
  return sorted.map(([_, f]) => f);
}

function download(blob: Blob) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = "export.json";
  a.click();
  URL.revokeObjectURL(url);
}

export default function SelectImagesWidget() {
  const [files, setFiles] = useState<File[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const cursor = useCursor();

  const currentFile = files.length > cursor.value ? files[cursor.value] : null;
  const controlsVisible = files.length > 0;

  const exportSelection = useCallback(async () => {
    const result = await stager.list();
    if (!result.length) {
      alert("Nothing selected!");
      return;
    }
    if (confirm(`Export ${result.length} images?`)) {
      console.log("Exporting", result);
      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: "application/json",
      });
      download(blob);
      await stager.clear();
    }
  }, []);

  const updateFiles = useCallback(async (input: HTMLInputElement) => {
    const files = Array.from(input.files ?? []);
    console.log("Sorting files by exif dates...");
    const sorted = await exifDateSort(files);
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

  const style = [
    "width:100vw",
    "height:100vh",
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "background:black",
    "color:white",
  ];
  return (
    <div ref={containerRef} style={style.join(";")}>
      <If condition={controlsVisible}>
        <CursorContext.Provider value={cursor}>
          <div style="position:absolute; top:0; width:100vw; height:100vh; overflow:hidden;">
            <ImageViewer files={files} />
          </div>
          <div style="position:absolute; top:0; width:100vw; text-align:center;">
            <CursorControls />
            <div>
              <input value={currentFile?.name} readOnly={true} />
              <input
                type="checkbox"
                ref={checkboxRef}
                disabled={!currentFile}
                onChange={(e) =>
                  stager.setStaged(currentFile!, e.currentTarget.checked)}
                class="quick-select"
              />
            </div>
          </div>
        </CursorContext.Provider>
      </If>
      <fieldset>
        <input
          {...imageInputProps}
          ref={inputRef}
          onChange={(event) => updateFiles(event.currentTarget)}
          class="quick-enter"
        />
        <button onClick={exportSelection} class="quick-down">
          Export Selection
        </button>
      </fieldset>
    </div>
  );
}
