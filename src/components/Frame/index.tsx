import { splitProps, type JSX, type ParentProps } from "solid-js";

type Props = JSX.HTMLAttributes<HTMLDivElement>;

export default function Frame(props: ParentProps<Props>) {
  const [{ children }, { class: className = "" }, rest] = splitProps(
    props,
    ["children"],
    ["class"],
  );
  return (
    <div class={`h-full w-full overflow-y-hidden ${className}`} {...rest}>
      <div class="w-full h-full p-2 border border-black">
        <div class="w-full h-full border border-black overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
