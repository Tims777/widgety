import { render, h } from "preact";
import Dialog, {
  type CallbackFn,
  type PromptResult,
} from "../components/Dialog.tsx";

class DialogService {
  public prompt<T extends Record<string, string>>(inputs: T) {
    const container = document.createElement("div");
    return new Promise<PromptResult<T>>((resolve) => {
      const buttons: Record<string, CallbackFn<T>> = {
        ok: (result) => {
          document.body.removeChild(container);
          resolve(result);
        },
      };
      render(h(Dialog<T>, { inputs, buttons }), container);
      document.body.appendChild(container);
    });
  }
  public confirm<T>(action: () => Promise<T>, message: string) {
    const container = document.createElement("div");
    return new Promise<T>((resolve, abort) => {
      const ok = async () => {
        const result = await action();
        document.body.removeChild(container);
        resolve(result);
      };
      const cancel = () => {
        document.body.removeChild(container);
        abort("No confirmation given.");
      };
      render(Dialog({ message, buttons: { ok, cancel } }), container);
      document.body.appendChild(container);
    });
  }
}

const dialog = new DialogService();
export default dialog;
