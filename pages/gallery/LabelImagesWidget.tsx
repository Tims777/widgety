import { useEffect, useRef, useState } from "preact/hooks";
import { CursorContext, useCursor } from "../../components/CursorContext.tsx";
import CursorControls from "../../components/CursorControls.tsx";
import ImageViewer from "../../components/ImageViewer.tsx";
import Quick from "../../quick/quick.ts";
import stager from "../../services/image-staging.ts";

export default function LabelImagesWidget() {
  const [files, setFiles] = useState<File[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cursor = useCursor();

  const currentFile = files.length > cursor.value ? files[cursor.value] : null;

  useEffect(() => {
    // Set up Quick
    new Quick(containerRef.current!);

    // Load staged files
    stager.list().then((f) => {
      cursor.setBounds([0, f.length]);
      setFiles(f);
    });
  }, []);

  useEffect(() => {
    if (!currentFile) inputRef.current!.value = "";
    else inputRef.current!.value = stager.getDescription(currentFile) ?? "";
  }, [currentFile]);

  return (
    <div ref={containerRef} style="text-align: center">
      <CursorContext.Provider value={cursor}>
        <CursorControls />
        <ImageViewer files={files} />
        <fieldset>
          <textarea
            type="textBox"
            ref={inputRef}
            placeholder="Description"
            class="quick-enter"
            style={{ resize: "none" }}
            onInput={(e) => {
              const description = e.currentTarget.value;
              if (currentFile && description) {
                stager.setDescription(currentFile, description);
              }
            }}
            cols={50}
            rows={2}
          />
        </fieldset>
      </CursorContext.Provider>
    </div>
  );
}
