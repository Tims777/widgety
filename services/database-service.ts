import { createClient, type SupabaseClient } from "supabase";
import config from "./config.ts";
import dialog from "./dialog-service.ts";

type ResultOrError<T> =
  | { data: T; error: null }
  // deno-lint-ignore ban-types
  | { error: object; data: null };

class DatabaseService {
  private client?: SupabaseClient;

  private async signIn() {
    const { data, error } = await this.client!.auth.getSession();
    if (error) throw error;
    if (!data.session) {
      const credentials = await dialog.prompt({
        email: "text",
        password: "password",
      });
      await this.client!.auth.signInWithPassword(credentials);
    }
  }

  public async use() {
    if (typeof document === "undefined") {
      throw "Database service is not intended for use in the backend";
    }
    if (!this.client) {
      this.client = createClient(config.supabase.url, config.supabase.key);
      await this.signIn();
    }
    return this.client;
  }

  public async execute<T>(
    query: (c: SupabaseClient) => PromiseLike<ResultOrError<T>>,
  ) {
    if (typeof document === "undefined") {
      throw "Database service is not intended for use in the backend";
    }
    if (!this.client) {
      this.client = createClient(config.supabase.url, config.supabase.key);
      await this.signIn();
    }
    const { data, error } = await query(this.client);
    if (error) throw error;
    else return data;
  }
}

const database = new DatabaseService();
export default database;
