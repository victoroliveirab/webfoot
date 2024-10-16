import { Show, type Accessor, type JSX, type JSXElement } from "solid-js";

type LayoutProps = {
  actions?: JSXElement;
  menu?: JSXElement;
  uppercase?: boolean;
  onClickClose?: () => void;
  title?: Accessor<string | undefined>;
  withContainerStyles?: boolean;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "title">;

export default function Layout({
  actions,
  children,
  class: className,
  menu,
  uppercase = false,
  onClickClose,
  title,
  withContainerStyles = false,
  ...props
}: LayoutProps) {
  const titleAccessor = () => (title ? title() : null);

  return (
    <div class={`${className} flex flex-col window select-none z-10`} {...props}>
      <header class="flex flex-col">
        <div class="w-full title-bar">
          <div class={`window-title text-left w-full flex ${uppercase ? "uppercase" : ""}`}>
            <h1 class="text-left text-sm title-bar-text flex-1">{titleAccessor()}</h1>
            <div class="title-bar-controls">
              <button
                aria-label="Close"
                disabled={!onClickClose}
                onClick={onClickClose}
                class="style-98"
              ></button>
            </div>
          </div>
        </div>
        {menu}
      </header>
      <section class={`flex-1 flex flex-col w-auto min-h-0 ${withContainerStyles ? "p-2" : ""}`}>
        <div
          class={`flex-1 flex flex-col min-h-0 ${withContainerStyles ? "p-2 border border-black" : ""}`}
        >
          <div class={`flex-1 overflow-y-auto ${withContainerStyles ? "border border-black" : ""}`}>
            {children}
          </div>
        </div>
      </section>
      <Show when={actions}>
        <footer class="flex items-center justify-center pb-2">{actions}</footer>
      </Show>
    </div>
  );
}
