import { Exifr } from "exifr";

const thumbnailOnlyOptions = {
  tiff: false,
  // deno-lint-ignore no-explicit-any
  ifd0: false as any,
  ifd1: true,
  exif: false,
  gps: false,
  interop: false,
  sanitize: false,
  translateKeys: true,
  reviveValues: false,
  translateValues: false,
  mergeOutput: false,
};

export async function thumbnail(
  input: File,
): Promise<[Blob, number]> {
  const exr = new Exifr(thumbnailOnlyOptions);
  await exr.read(input);
  const thumb = await exr.extractThumbnail();
  const { ifd1 } = (await exr.parse()) ?? {};
  const blob = new Blob(thumb ? [thumb] : []);
  const rotation = toDegrees(ifd1?.Orientation);
  return [blob, rotation];
}

function toDegrees(orientation?: number) {
  switch (orientation) {
    case 3:
      return 180;
    case 6:
      return 90;
    case 8:
      return 270;
    default:
      return 0;
  }
}
