import database from "./database-service.ts";

const galleryTable = "gallery";
const mediaTable = "media";
const mediaStorage = "media";

function getPath(directory: string, name: string, blob: Blob) {
  const fileExt = blob.type.slice(blob.type.lastIndexOf("/") + 1);
  return `${directory}/${name}.${fileExt}`;
}

interface CreateMediaProps {
  directory: string;
  data: Blob;
  preview?: Blob;
  description?: string;
}

class GalleryService {
  private async upload(blob: Blob, path: string) {
    const db = await database.use();
    const storage = db.storage.from(mediaStorage);
    const { data, error } = await storage.upload(path, blob);
    if (error) throw error;
    return db.storage.from(mediaStorage).getPublicUrl(data.path).data.publicUrl;
  }

  public async createMedia(type: string, props: CreateMediaProps) {
    const id = crypto.randomUUID();
    const description = props.description;
    let resource: string, preview: string;
    if (props.data) {
      resource = await this.upload(
        props.data,
        getPath(props.directory, id, props.data),
      );
    }
    if (props.preview) {
      preview = await this.upload(
        props.preview,
        getPath(props.directory, `${id}-preview`, props.preview),
      );
    }
    await database.execute((db) =>
      db.from(mediaTable).insert({
        id,
        type,
        resource,
        preview,
        description,
      })
    );
    return id;
  }

  public async create(name: string, ...content: string[]) {
    const id = crypto.randomUUID();
    await database.execute((db) =>
      db.from(galleryTable).insert({
        id,
        name,
        content,
      })
    );
    return id;
  }
}

const galleries = new GalleryService();
export default galleries;
