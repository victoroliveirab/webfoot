import { splitProps, type JSX } from "solid-js";

type ButtonProps = {
  icon?: string;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button(props: ButtonProps) {
  const [{ icon }, { children }, { class: className }, restProps] = splitProps(
    props,
    ["icon"],
    ["children"],
    ["class"],
  );

  return (
    <button class={`w-20 h-20 p-px flex items-center justify-evenly ${className}`} {...restProps}>
      {icon && <span class="inline-block">{icon}</span>}
      <span class="inline-block">{children}</span>
    </button>
  );
}
