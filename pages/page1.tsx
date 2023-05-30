import { useState } from "preact/hooks";

export default function Page1() {
  const [count, setCount] = useState(0);
  return (
    <>
      <h1>Page 1</h1>
      <p>
        Current count: <output value={count} />
      </p>
      <p>
        <button onClick={() => setCount((c) => c + 1)}>+</button>
      </p>
    </>
  );
}
