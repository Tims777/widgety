import { Dimension } from "../math/vector.ts";
import * as photon from "../static/wasm/photon_rs_bg.js";

const jpegMime = "image/jpeg";
const jpegDefaultQuality = 75;

async function initializePhoton() {
  if (photon.isInitialized()) return;
  const wasm = await WebAssembly.instantiateStreaming(
    fetch("/wasm/photon_rs_bg.wasm"),
    {
      "./photon_rs_bg.js": photon as unknown as WebAssembly.ModuleImports,
    },
  );
  photon.initialize(wasm.instance.exports);
}

class ImageEditService {
  async *createScaledVersions(file: Blob, ...resolutions: number[]) {
    await initializePhoton();
    const originalImage = photon.PhotonImage.new_from_byteslice(
      new Uint8Array(await file.arrayBuffer()),
    );
    for (const res of resolutions) {
      const originalSize = Dimension.of(originalImage);
      const scaledSize = originalSize.mul(res / originalSize.max());
      const scaledImage = photon.resize(
        originalImage,
        scaledSize.x,
        scaledSize.y,
        photon.SamplingFilter.Lanczos3,
      );
      yield new Blob(
        [scaledImage.get_bytes_jpeg(jpegDefaultQuality)],
        { type: jpegMime },
      );
    }
  }
}

const imageEditor = new ImageEditService();
export default imageEditor;
