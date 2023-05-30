import { type StateUpdater, useRef, useState } from "preact/hooks";
import galleries from "../../services/gallery-service.ts";
import imageEditor from "../../services/image-editing.ts";
import stager from "../../services/image-staging.ts";
import If from "../../components/If.tsx";

const fullResolution = 1440;
const previewResolution = fullResolution / 2;

export default function UploadImagesWidget() {
  const progressRef = useRef<HTMLProgressElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function uploadImages() {
    const galleryName = inputRef.current!.value;
    const todo = await stager.list();
    const galleryContent = [];
    for (let i = 0; i < todo.length; i++) {
      const file = todo[i];
      const scaled = imageEditor.createScaledVersions(
        file,
        fullResolution,
        previewResolution,
      );
      const id = await galleries.createMedia("image", {
        directory: galleryName,
        description: stager.getDescription(file) ?? undefined,
        data: (await scaled.next()).value!,
        preview: (await scaled.next()).value!,
      });
      galleryContent.push(id);
      stager.setStaged(file, false);
      stager.deleteDescription(file);
      if (progressRef.current) {
        progressRef.current.value = (i + 1) / todo.length;
      }
    }
    galleries.create(galleryName, ...galleryContent);
  }

  function executeLocked(
    fn: () => Promise<unknown>,
    locker: StateUpdater<boolean>,
  ) {
    let abort = false;
    locker((current) => {
      if (current) abort = true;
      return true;
    });
    if (!abort) fn().finally(() => locker(false));
  }

  return (
    <div>
      <input type="text" ref={inputRef} placeholder="gallery-name" />
      <If condition={uploading}>
        <progress ref={progressRef} value={0} max={1} />
      </If>
      <If condition={!uploading}>
        <button onClick={() => executeLocked(uploadImages, setUploading)}>
          Resize & Upload Images
        </button>
      </If>
    </div>
  );
}
