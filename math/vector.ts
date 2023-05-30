type NumberLike = number | SVGAnimatedLength;

type Operation = (a: number, b: number) => number;

function asNumber(x: NumberLike) {
  if (typeof x === "number") {
    return x;
  } else {
    return x.baseVal.value;
  }
}

export class Vector {
  constructor(public value: number[]) {}

  public get x() {
    return this.value[0];
  }

  public get y() {
    return this.value[1];
  }

  public get z() {
    return this.value[2];
  }

  public op(other: Vector | NumberLike, operation: Operation) {
    return new Vector(this.value.map((v1, i) => {
      const v2 = other instanceof Vector ? other.value[i] : asNumber(other);
      return operation(v1, v2);
    }));
  }

  public mul = (other: Vector | NumberLike) => this.op(other, (a, b) => a * b);
  public div = (other: Vector | NumberLike) => this.op(other, (a, b) => a / b);
  public add = (other: Vector | NumberLike) => this.op(other, (a, b) => a + b);
  public sub = (other: Vector | NumberLike) => this.op(other, (a, b) => a - b);
  public mod = (other: Vector | NumberLike) => this.op(other, (a, b) => a % b);
  public min = () => Math.min(...this.value);
  public max = () => Math.max(...this.value);
}

export class Dimension {
  public static of(
    obj: { width: NumberLike; height: NumberLike } | {
      get_width(): NumberLike;
      get_height(): NumberLike;
    },
  ) {
    if ("width" in obj && "height" in obj) {
      return new Vector([
        asNumber(obj.width),
        asNumber(obj.height),
      ]);
    } else {
      return new Vector([
        asNumber(obj.get_width()),
        asNumber(obj.get_height()),
      ]);
    }
  }
}
