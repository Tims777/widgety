import { useMemo, useState } from "preact/hooks";
import { createContext } from "preact";

type Bounds = [number, number];

interface Cursor {
  value: number;
  bounds: Bounds;
  increment: () => void;
  decrement: () => void;
  setValue: (x: number) => void;
  setBounds: (x: Bounds) => void;
}

function constrainWithin(bounds: Bounds, value: number) {
  let safeValue = value;
  safeValue = Math.max(safeValue, bounds[0]);
  safeValue = Math.min(safeValue, bounds[1] - 1);
  return safeValue;
}

const CursorContext = createContext({ value: 0 } as Cursor);

function useCursor(): Cursor {
  const [value, setValue] = useState<number>(0);
  const [bounds, setBounds] = useState<[number, number]>([0, Infinity]);

  const [increment, decrement, safeSetValue] = useMemo(() => {
    const safeSet = (x: number) => setValue(constrainWithin(bounds, x));
    const inc = () => setValue((x) => constrainWithin(bounds, x + 1));
    const dec = () => setValue((x) => constrainWithin(bounds, x - 1));
    return [inc, dec, safeSet];
  }, [bounds]);

  return {
    value,
    bounds,
    increment,
    decrement,
    setBounds,
    setValue: safeSetValue,
  };
}

export { type Cursor, CursorContext, useCursor };
