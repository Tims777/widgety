import { type VNode } from "preact";

export default function If(
  props: { condition: boolean; children: VNode | VNode[] },
) {
  if (props.condition) {
    return <>{props.children}</>;
  } else {
    return <></>;
  }
}
