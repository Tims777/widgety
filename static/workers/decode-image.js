self.onmessage = async (event) => {
  const bitmap = await createImageBitmap(event.data);
  self.postMessage(bitmap);
  self.close();
};
