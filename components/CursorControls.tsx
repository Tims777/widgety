import { useContext, useEffect, useRef } from "preact/hooks";
import { CursorContext } from "./CursorContext.tsx";

export default function CursorControls() {
  const inputRef = useRef<HTMLInputElement>(null);
  const cursor = useContext(CursorContext);

  useEffect(() => {
    // Read back state from HTML input
    const value = inputRef.current!.valueAsNumber;
    if (isFinite(value)) {
      cursor.setValue(value);
    }
  }, []);

  useEffect(() => {
    // Write state to HTML input
    inputRef.current!.valueAsNumber = cursor.value;
  }, [cursor.value]);

  return (
    <div>
      <button onClick={() => cursor.decrement()} class="quick-left">
        Prev
      </button>
      <input
        type="number"
        ref={inputRef}
        onChange={(e) => cursor.setValue(e.currentTarget.valueAsNumber)}
      />
      <button onClick={() => cursor.increment()} class="quick-right">
        Next
      </button>
    </div>
  );
}
