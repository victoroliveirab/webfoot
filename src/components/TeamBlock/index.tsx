import type { ParentProps } from "solid-js";

type Props = ParentProps<{
  background: string;
  border?: string;
  class?: HTMLParagraphElement["className"];
  foreground: string;
  onClick?: () => void;
}>;

const TeamBlock = ({
  background,
  border,
  children,
  class: className = "",
  foreground,
  onClick,
}: Props) => {
  return (
    <p
      class={`p-1 uppercase select-none ${border ? "border" : ""} ${!!onClick ? "cursor-pointer" : ""} ${className}`}
      style={{
        color: foreground,
        "background-color": background,
        "border-color": border ?? "transparent",
      }}
      onClick={onClick}
    >
      {children?.toString().toUpperCase()}
    </p>
  );
};

export default TeamBlock;
