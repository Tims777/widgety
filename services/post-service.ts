import database from "./database-service.ts";

const dodbumentTable = "document";
const documentTableColumns = "id,path,content";

export interface Post {
  id: string;
  path: string;
  content: string;
}

class PostService {
  async list(): Promise<Post[]> {
    return await database.execute((db) =>
      db.from(dodbumentTable)
        .select(documentTableColumns)
    );
  }
  async update(path: string, data: Partial<Post>) {
    return await database.execute((c) =>
      c.from(dodbumentTable)
        .update(data)
        .filter("path", "eq", path)
    );
  }
  async get(path: string): Promise<Post | null> {
    return await database.execute((db) =>
      db.from(dodbumentTable)
        .select(documentTableColumns)
        .filter("path", "eq", path)
        .limit(1).maybeSingle()
    );
  }
}

const posts = new PostService();
export default posts;
