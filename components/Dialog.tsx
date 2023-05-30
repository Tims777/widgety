import { type Ref, useRef } from "preact/hooks";

interface DialogProps<T extends Record<string, string>> {
  message?: string;
  buttons?: Record<string, CallbackFn<T>>;
  inputs?: T;
}

export type PromptResult<T> = { [K in keyof T]: string };

export type CallbackFn<T> = (result: PromptResult<T>) => unknown;

export default function Dialog<T extends Record<string, string>>(
  props: DialogProps<T>,
) {
  const children = [];
  const refs: Ref<HTMLInputElement>[] = [];
  function getResult() {
    const result: Record<string, string> = {};
    for (const ref of refs) {
      result[ref.current!.name] = ref.current!.value;
    }
    return result as PromptResult<T>;
  }
  if (props.message) children.push(props.message);
  for (const [label, type] of Object.entries<string>(props.inputs ?? {})) {
    const ref = useRef<HTMLInputElement>(null);
    children.push(
      <label>
        {label}
        <input ref={ref} type={type} name={label} />
      </label>,
    );
    refs.push(ref);
  }
  for (const [label, callback] of Object.entries(props.buttons ?? {})) {
    children.push(
      <button onClick={() => callback(getResult())}>{label}</button>,
    );
  }
  return (
    <dialog open>
      {children}
    </dialog>
  );
}
