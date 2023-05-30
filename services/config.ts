import dialog from "./dialog-service.ts";

const configFileStorageKey = "config";

function pickConfigFile() {
  return new Promise<File>((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = () => {
      if (input.files?.length) {
        resolve(input.files[0]);
      } else {
        reject("No file was chosen.");
      }
    };
    input.click();
  });
}

async function requestConfigFile() {
  const file = await dialog.confirm(pickConfigFile, "Load config?");
  return await file.text();
}

async function loadFromStorage(key: string, fallback: () => Promise<string>) {
  let item = localStorage.getItem(key);
  if (!item) {
    item = await fallback();
    localStorage.setItem(key, item);
  }
  return JSON.parse(item);
}

async function loadConfig() {
  let config: Config;
  if (typeof document !== "undefined") {
    config = await loadFromStorage(configFileStorageKey, requestConfigFile);
  } else {
    config = {} as Config;
  }
  return config;
}

interface Config {
  supabase: {
    url: string;
    key: string;
  };
}

const config = await loadConfig();
export default config;
