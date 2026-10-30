export default function EvalComponent({ f }: { f: () => void | any }) {
  f();
  return <></>;
}
